import type { NavGroup } from '../types';

export const internalSections: NavGroup[] = [
  {
    group: 'OVERVIEW',
    items: [
      { id: 'int-overview', label: 'Introduction' },
      { id: 'int-architecture', label: 'Architecture' },
    ],
  },
  {
    group: 'B2C SETUP',
    items: [
      { id: 'int-tenant', label: 'Create B2C Tenant' },
      { id: 'int-app-reg', label: 'App Registration' },
      { id: 'int-platform', label: 'Platform Types' },
      { id: 'int-policy-keys', label: 'Policy Keys (IEF)' },
      { id: 'int-custom-policies', label: 'Custom Policies' },
      { id: 'int-upload', label: 'Upload Policies' },
    ],
  },
  {
    group: 'AUTH0 SETUP',
    items: [
      { id: 'int-auth0-app', label: 'Create Auth0 App' },
      { id: 'int-auth0-config', label: 'Configure Callbacks' },
      { id: 'int-auth0-secret', label: 'Policy Key Secret' },
    ],
  },
  {
    group: 'CLIENT ONBOARDING',
    items: [
      { id: 'int-need-from-client', label: 'What We Need From Client' },
      { id: 'int-give-to-client', label: 'What We Give To Client' },
      { id: 'int-checklist', label: 'Onboarding Checklist' },
    ],
  },
  {
    group: 'ERRORS & REFERENCE',
    items: [
      { id: 'int-errors', label: 'Internal Errors' },
      { id: 'int-config-ref', label: 'Config Reference' },
    ],
  },
];
