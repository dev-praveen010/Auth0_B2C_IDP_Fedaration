# Auth0 + Azure AD B2C Integration Guide (Full Documentation)

This document explains how to build, configure, run, and troubleshoot the Auth0 + Azure AD B2C custom policy integration used in this workspace.

It covers:
- End-to-end architecture
- Auth0 setup
- Azure AD B2C app registrations and custom policies
- Claims mapping and persistence
- Frontend and backend configuration
- Local run and validation
- Common failures (including missing claim values)
- Production hardening checklist

## 1. Solution Overview

This project uses two identity systems:
- Auth0 for primary app login (React SPA)
- Azure AD B2C custom policy for secondary federation/token flow (Insights AI connection)

Flow summary:
1. User signs in to the app with Auth0.
2. User clicks Connect to Insights AI.
3. Frontend redirects browser to B2C custom policy authorize endpoint.
4. B2C returns authorization code to frontend callback URL.
5. Frontend sends the code to backend.
6. Backend exchanges code for tokens at B2C token endpoint using client secret.

## 2. Workspace Components

- Frontend SPA: my-app
- Backend API for token exchange: backend
- B2C custom policies: custompolicy files

Key files:
- my-app/.env
- my-app/src/components/ConnectInsightsAI.jsx
- my-app/src/pages/CallbackPage.jsx
- backend/app.py
- custompolicy files/TrustFrameworkBase.xml
- custompolicy files/TrustFrameworkExtensions.xml
- custompolicy files/SignUpOrSignin.xml
- custompolicy files/ProfileEdit.xml
- custompolicy files/PasswordReset.xml

## 3. Prerequisites

- Node.js 18+
- Python 3.10+
- Azure AD B2C tenant
- Auth0 tenant
- Azure AD B2C custom policy starter pack baseline already uploaded

## 4. Auth0 Setup

### 4.1 Create SPA Application

In Auth0 Dashboard:
1. Applications -> Applications -> Create Application
2. Type: Single Page Application
3. Save

### 4.2 Configure Callback and Origins

Set these values in Auth0 app settings for local development:
- Allowed Callback URLs: http://localhost:5173/callback
- Allowed Logout URLs: http://localhost:5173
- Allowed Web Origins: http://localhost:5173

### 4.3 Gather Auth0 Values

Collect:
- Domain
- Client ID
- (Optional) API audience if calling protected Auth0 APIs

## 5. Azure AD B2C Setup

## 5.1 App Registrations Required

You typically need:
1. IdentityExperienceFramework app
2. ProxyIdentityExperienceFramework app
3. App registration for the client using custom policy authorize/token endpoints

Make sure redirect URI includes:
- http://localhost:5173/callback

## 5.2 Create/Verify Policy Keys

In B2C Identity Experience Framework policy keys, ensure keys exist:
- B2C_1A_TokenSigningKeyContainer
- B2C_1A_TokenEncryptionKeyContainer
- B2C_1A_Auth0ClientASecret

## 5.3 Update TrustFrameworkExtensions.xml

In custompolicy files/TrustFrameworkExtensions.xml:
- Confirm Auth0 OIDC technical profile metadata points to your Auth0 tenant well-known endpoint.
- Confirm client_id is correct.
- Confirm Key Id client_secret points to B2C_1A_Auth0ClientASecret.
- Confirm OutputClaims include all desired incoming claims from Auth0.

Current expected incoming claims from Auth0 profile include examples like:
- email
- name
- department
- gender
- dob
- employeeId
- role
- businessId
- tenantId

Important: If Auth0 does not issue these custom claims in the token/userinfo, they will be null in B2C.

## 5.4 Persist Custom Claims in B2C Directory (Critical)

Declaring OutputClaims in external IdP profile is not enough for long-term return.
For social/federated users, you must persist custom claims when user is created and read them back on subsequent logins.

In AAD technical profiles (usually in base/extensions chain), ensure:
1. AAD-UserWriteUsingAlternativeSecurityId has PersistedClaim entries for your custom claims.
2. AAD-UserReadUsingAlternativeSecurityId has OutputClaim entries for your custom claims.
3. The relying party policy (for example SignUpOrSignin.xml) includes those claims in PolicyProfile OutputClaims.

If step 1 or 2 is missing, claims may appear first time and disappear later, or remain empty.

## 5.5 Upload Order for Custom Policies

Upload in this exact order:
1. TrustFrameworkBase.xml
2. TrustFrameworkLocalization.xml
3. TrustFrameworkExtensions.xml
4. SignUpOrSignin.xml
5. ProfileEdit.xml
6. PasswordReset.xml

If upload fails:
- Fix validation errors
- Re-upload dependent files after changes

## 6. Endpoint and Authority Rules (Very Important)

Use one consistent authority pattern across frontend, backend, and policy references.

Recommended for B2C custom policy endpoints:
- https://<tenant>.b2clogin.com/<tenant>.onmicrosoft.com/<policy>/oauth2/v2.0/authorize
- https://<tenant>.b2clogin.com/<tenant>.onmicrosoft.com/<policy>/oauth2/v2.0/token

Do not partially remove or mix host patterns across components.
If frontend uses one issuer path and backend token exchange uses another, you can get token/claim mismatches.

## 7. Frontend Configuration

In my-app/.env:
- VITE_AUTH0_DOMAIN=<auth0-domain>
- VITE_AUTH0_CLIENT_ID=<auth0-client-id>
- VITE_AUTH0_CALLBACK_URL=http://localhost:5173/callback
- VITE_B2C_AUTHORIZE_ENDPOINT=https://<tenant>.b2clogin.com/<tenant>.onmicrosoft.com/<policy>/oauth2/v2.0/authorize
- VITE_B2C_CLIENT_ID=<b2c-client-id>
- VITE_B2C_REDIRECT_URI=http://localhost:5173/callback
- VITE_B2C_SCOPE=openid offline_access <api-scope-if-needed>
- VITE_POLICY_NAME=<policy-name>

Notes:
- ConnectInsightsAI.jsx currently appends p=<policy-name> in query parameters.
- If policy already exists in path, avoid conflicting values.
- Keep policy name casing exactly consistent (for example B2C_1A_signup_signin vs B2C_1A_SIGNUP_SIGNIN).

## 8. Backend Configuration

Create backend/.env (based on backend/.env.example):
- PORT=8000
- B2C_TOKEN_ENDPOINT=https://<tenant>.b2clogin.com/<tenant>.onmicrosoft.com/<policy>/oauth2/v2.0/token
- B2C_CLIENT_ID=<b2c-client-id>
- B2C_CLIENT_SECRET=<b2c-client-secret>
- B2C_SCOPE=openid offline_access <api-scope-if-needed>

Security requirements:
- Never expose B2C client secret in frontend.
- Keep backend/.env out of source control.

PKCE note:
- Frontend creates code_verifier and code_challenge.
- Backend token exchange should include code_verifier in form_data when required by your policy/client settings.

## 9. Run Locally

From workspace root:

1. Backend:
- cd backend
- python -m venv ../.venv
- ..\.venv\Scripts\activate
- pip install -r requirements.txt
- copy .env.example .env
- Update .env with real values
- python app.py

2. Frontend (new terminal):
- cd my-app
- npm install
- copy .env.example .env
- Update .env with real values
- npm run dev

3. Open:
- http://localhost:5173

## 10. Validation Checklist

After setup, validate in this order:
1. Auth0 login works and returns to dashboard.
2. Connect Insights AI redirects to B2C authorize endpoint.
3. Callback receives code and matching state.
4. Backend token exchange returns access_token and/or id_token.
5. Returned token payload includes required claims.
6. Sign out and sign in again, claims remain available (persistence check).

## 11. Troubleshooting Guide

## 11.1 Problem: Claims not returning or empty

Possible causes:
1. Authority mismatch after removing/changing b2clogin host.
2. Custom claims not emitted by Auth0 IdP token/userinfo.
3. Custom claims not persisted/read in B2C AAD technical profiles.
4. Policy name mismatch (case/path/query mismatch).
5. Wrong scope (missing custom API scope if claims depend on API token).
6. Token from stale localStorage/sessionStorage.

How to fix:
1. Use consistent authorize/token endpoints with same tenant and policy.
2. Verify incoming Auth0 token contains the expected source claims.
3. Add PersistedClaim + OutputClaim mappings for custom attributes in AAD profiles.
4. Re-upload policies in correct dependency order.
5. Clear browser storage and retry.

## 11.2 Problem: Callback state errors

Cause:
- Auth0 callback and B2C callback both use /callback route, state is interpreted by wrong handler.

Fix:
- Keep callback handler logic that distinguishes B2C state from Auth0 state.
- Ensure sessionStorage state is set before redirect and removed after successful exchange.

## 11.3 Problem: Token endpoint returns invalid_grant

Common causes:
- Redirect URI mismatch between authorize and token exchange
- Wrong client_id/client_secret
- Expired or already-used code
- Missing code_verifier for PKCE

## 11.4 Problem: Uploaded policy but behavior unchanged

Cause:
- Wrong policy file uploaded or wrong policy invoked by frontend.

Fix:
- Confirm frontend points to exact policy being edited.
- Upload all dependent files again after extensions change.

## 12. Claims Design Guidance

When adding a new custom claim end-to-end:
1. Define claim type in Extensions ClaimsSchema.
2. Map claim from external IdP via OutputClaim in external technical profile.
3. Persist claim in AAD write technical profile.
4. Read claim in AAD read technical profile.
5. Include claim in RP PolicyProfile OutputClaims.
6. Verify claim appears in issued token.

## 13. Security and Production Hardening

- Use HTTPS everywhere in non-local environments.
- Restrict CORS allow_origins to specific frontend domains.
- Rotate B2C and Auth0 secrets regularly.
- Do not log raw tokens or secrets.
- Add backend rate limiting and request validation.
- Add centralized audit logging for auth flows.
- Use environment-specific app registrations and policy keys.

## 14. Operational Runbook

When changing identity config:
1. Update in a non-production environment first.
2. Export previous policy versions before upload.
3. Upload updated policy chain in order.
4. Run full validation checklist.
5. Promote same changes to production with environment-specific values.

## 15. Quick Reference

Frontend variables (my-app/.env):
- VITE_AUTH0_DOMAIN
- VITE_AUTH0_CLIENT_ID
- VITE_AUTH0_CALLBACK_URL
- VITE_B2C_AUTHORIZE_ENDPOINT
- VITE_B2C_CLIENT_ID
- VITE_B2C_REDIRECT_URI
- VITE_B2C_SCOPE
- VITE_POLICY_NAME

Backend variables (backend/.env):
- PORT
- B2C_TOKEN_ENDPOINT
- B2C_CLIENT_ID
- B2C_CLIENT_SECRET
- B2C_SCOPE

---

If you want, a next step can be to generate a second document with exact XML patch templates for your custom claims (department, gender, dob, employeeId, role, businessId, tenantId) so you can copy/paste directly into policy technical profiles.
