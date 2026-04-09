import os
import secrets
import time
from typing import Any, Dict, Optional

import requests
from dotenv import load_dotenv
from fastapi import FastAPI, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from jose import JWTError, jwt
from pydantic import BaseModel

load_dotenv()

app = FastAPI(title='B2C Token Exchange API')
app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)

# ---------------------------------------------------------------------------
# In-memory session store
# { session_id -> {access_token, id_token, refresh_token, expires_at} }
# Replace dict operations with Redis calls to scale beyond a single process.
# ---------------------------------------------------------------------------
_sessions: Dict[str, Dict[str, Any]] = {}

# JWKS cache to avoid fetching keys on every request
_jwks_cache: Dict[str, Any] = {}
_JWKS_TTL = 3600  # seconds


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def generate_session_id() -> str:
    return secrets.token_urlsafe(32)


def _get_b2c_env() -> Dict[str, Optional[str]]:
    return {
        'token_endpoint': os.getenv('B2C_TOKEN_ENDPOINT'),
        'client_id': os.getenv('B2C_CLIENT_ID'),
        'client_secret': os.getenv('B2C_CLIENT_SECRET'),
        'scope': os.getenv(
            'B2C_SCOPE',
            'openid offline_access',
        ),
        'tenant': os.getenv('B2C_TENANT'),
        'policy': os.getenv('B2C_POLICY'),
        'issuer': os.getenv('B2C_ISSUER'),
    }


def get_b2c_jwks() -> list:
    """Fetch and cache B2C public keys (JWKS) with a 1-hour TTL."""
    now = time.time()
    if _jwks_cache.get('keys') and now - _jwks_cache.get('fetched_at', 0) < _JWKS_TTL:
        return _jwks_cache['keys']

    env = _get_b2c_env()
    tenant = env['tenant']
    policy = env['policy']

    if not tenant or not policy:
        raise HTTPException(
            status_code=500,
            detail={
                'error': 'server_configuration_error',
                'error_description': 'B2C_TENANT and B2C_POLICY must be configured.',
            },
        )

    jwks_url = (
        f'https://{tenant}.b2clogin.com/{tenant}.onmicrosoft.com'
        f'/{policy}/discovery/v2.0/keys'
    )

    try:
        resp = requests.get(jwks_url, timeout=10)
        resp.raise_for_status()
        keys = resp.json().get('keys', [])
        print('Fetched JWKS keys:', keys)  # Debug log
    except Exception as exc:
        raise HTTPException(
            status_code=502,
            detail={
                'error': 'jwks_fetch_failed',
                'error_description': str(exc),
            },
        )

    _jwks_cache['keys'] = keys
    _jwks_cache['fetched_at'] = now
    return keys


def verify_b2c_token(token: str) -> Dict[str, Any]:
    """Verify a B2C JWT: signature (RS256), audience, issuer, and expiry.

    Returns decoded claims on success.
    Raises HTTPException(401) for any verification failure.
    """
    env = _get_b2c_env()
    client_id = env['client_id']
    issuer = env['issuer']

    if not client_id or not issuer:
        raise HTTPException(
            status_code=500,
            detail={
                'error': 'server_configuration_error',
                'error_description': 'B2C_CLIENT_ID and B2C_ISSUER must be configured.',
            },
        )

    keys = get_b2c_jwks()

    try:
        claims = jwt.decode(
            token,
            keys,
            algorithms=['RS256'],
            audience=client_id,
            issuer=issuer,
        )
        print('Token claims:', claims)  # Debug log
        return claims
    except JWTError as exc:
        raise HTTPException(
            status_code=401,
            detail={
                'error': 'token_invalid',
                'error_description': str(exc),
            },
        )


def _do_refresh(session_id: str) -> None:
    """Refresh session tokens using the stored refresh_token.

    Updates _sessions[session_id] in place.
    Raises HTTPException on any failure.
    """
    session = _sessions.get(session_id)
    if not session:
        raise HTTPException(status_code=401, detail={'error': 'session_not_found'})

    refresh_token = session.get('refresh_token')
    if not refresh_token:
        raise HTTPException(
            status_code=401,
            detail={
                'error': 'no_refresh_token',
                'error_description': 'No refresh token in session. Re-authentication required.',
            },
        )

    env = _get_b2c_env()
    if not env['token_endpoint'] or not env['client_id'] or not env['client_secret']:
        raise HTTPException(
            status_code=500,
            detail={
                'error': 'server_configuration_error',
                'error_description': (
                    'B2C_TOKEN_ENDPOINT, B2C_CLIENT_ID, and B2C_CLIENT_SECRET '
                    'must be configured.'
                ),
            },
        )

    form_data = {
        'grant_type': 'refresh_token',
        'client_id': env['client_id'],
        'client_secret': env['client_secret'],
        'refresh_token': refresh_token,
        'scope': env['scope'],
    }

    try:
        response = requests.post(env['token_endpoint'], data=form_data, timeout=20)
        body = response.json()
    except requests.RequestException as exc:
        raise HTTPException(
            status_code=502,
            detail={
                'error': 'token_endpoint_unreachable',
                'error_description': str(exc),
            },
        )
    except ValueError:
        raise HTTPException(
            status_code=502,
            detail={
                'error': 'token_endpoint_invalid_response',
                'error_description': 'Token endpoint returned non-JSON response.',
            },
        )

    if response.status_code >= 400:
        raise HTTPException(
            status_code=response.status_code,
            detail={
                'error': body.get('error', 'refresh_failed'),
                'error_description': body.get('error_description', 'Token refresh failed.'),
            },
        )

    _sessions[session_id] = {
        'access_token': body.get('access_token'),
        'id_token': body.get('id_token', session.get('id_token')),
        # B2C may return a new refresh token (rotation); fall back to old one if not
        'refresh_token': body.get('refresh_token') or refresh_token,
        'expires_at': time.time() + int(body.get('expires_in', 3600)),
    }


# ---------------------------------------------------------------------------
# Request models
# ---------------------------------------------------------------------------

class TokenExchangeRequest(BaseModel):
    code: str
    redirect_uri: str
    code_verifier: str


class RefreshRequest(BaseModel):
    session_id: str


class DisconnectRequest(BaseModel):
    session_id: str


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@app.get('/health')
def health() -> Dict[str, str]:
    return {'status': 'ok'}


@app.post('/api/b2c/token-exchange')
def exchange_b2c_code(payload: TokenExchangeRequest) -> Dict[str, str]:
    """Exchange a B2C authorization code for tokens.

    Tokens are stored server-side in the session store.
    The client receives only a session_id — no raw token is ever sent to the browser.
    """
    env = _get_b2c_env()

    if not env['token_endpoint'] or not env['client_id'] or not env['client_secret']:
        raise HTTPException(
            status_code=500,
            detail={
                'error': 'server_configuration_error',
                'error_description': (
                    'B2C_TOKEN_ENDPOINT, B2C_CLIENT_ID, and B2C_CLIENT_SECRET '
                    'must be configured on the backend.'
                ),
            },
        )

    form_data = {
        'grant_type': 'authorization_code',
        'client_id': env['client_id'],
        'client_secret': env['client_secret'],
        'code': payload.code,
        'redirect_uri': payload.redirect_uri,
        'code_verifier': payload.code_verifier,
        'scope': env['scope'],
    }

    try:
        response = requests.post(env['token_endpoint'], data=form_data, timeout=20)
        body = response.json()
        print('Token exchange response:', body)  # Debug log
    except requests.RequestException as exc:
        raise HTTPException(
            status_code=502,
            detail={
                'error': 'token_endpoint_unreachable',
                'error_description': str(exc),
            },
        )
    except ValueError:
        raise HTTPException(
            status_code=502,
            detail={
                'error': 'token_endpoint_invalid_response',
                'error_description': 'Token endpoint returned non-JSON response.',
            },
        )

    if response.status_code >= 400:
        raise HTTPException(
            status_code=response.status_code,
            detail={
                'error': body.get('error', 'token_exchange_failed'),
                'error_description': body.get('error_description', 'Token exchange failed.'),
                'details': body,
            },
        )

    session_id = generate_session_id()
    _sessions[session_id] = {
        'access_token': body.get('access_token'),
        'id_token': body.get('id_token'),
        'refresh_token': body.get('refresh_token'),
        'expires_at': time.time() + int(body.get('expires_in', 3600)),
    }

    return {'session_id': session_id}


@app.post('/api/b2c/refresh')
def refresh_b2c_token(payload: RefreshRequest) -> Dict[str, bool]:
    """Silently refresh the B2C access token using the stored refresh token.

    Tokens remain server-side. Returns {"ok": true} on success.
    """
    if payload.session_id not in _sessions:
        raise HTTPException(status_code=401, detail={'error': 'session_not_found'})

    _do_refresh(payload.session_id)
    return {'ok': True}


@app.post('/api/b2c/disconnect')
def disconnect_b2c_session(payload: DisconnectRequest) -> Dict[str, bool]:
    """Invalidate and remove a B2C session from the in-memory store."""
    _sessions.pop(payload.session_id, None)
    return {'ok': True}


@app.get('/api/external')
def call_external_api(
    x_session_id: Optional[str] = Header(default=None),
) -> Dict[str, Any]:
    """Call an external API on behalf of the user using their B2C access token.

    Flow:
      1. Look up the session by X-Session-Id header.
      2. Verify the stored access token (signature, audience, issuer, expiry).
      3. If the token is expired, silently refresh it and re-verify.
      4. Forward the request to the external API with Bearer auth.

    Replace EXTERNAL_API_URL env var (or the default httpbin URL) with the real
    API endpoint.
    """
    print("_sessions",_sessions)
    if not x_session_id or x_session_id not in _sessions:
        raise HTTPException(status_code=401, detail={'error': 'session_not_found'})

    access_token: str = _sessions[x_session_id].get('access_token') or ''

    # Verify — if expired, refresh once and re-verify
    try:
        verify_b2c_token(access_token)
    except HTTPException as exc:
        if exc.status_code == 401:
            _do_refresh(x_session_id)
            access_token = _sessions[x_session_id].get('access_token') or ''
            verify_b2c_token(access_token)  # propagates 401 if still invalid
        else:
            raise

    external_api_url = os.getenv('EXTERNAL_API_URL', 'https://httpbin.org/bearer')

    try:
        api_response = requests.get(
            external_api_url,
            headers={'Authorization': f'Bearer {access_token}'},
            timeout=15,
        )
        return {'status': api_response.status_code, 'data': api_response.json()}
    except requests.RequestException as exc:
        raise HTTPException(
            status_code=502,
            detail={
                'error': 'external_api_unreachable',
                'error_description': str(exc),
            },
        )


if __name__ == '__main__':
    import uvicorn

    port = int(os.getenv('PORT', '8000'))
    uvicorn.run('app:app', host='0.0.0.0', port=port, reload=True)

