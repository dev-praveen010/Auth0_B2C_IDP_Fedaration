import type { NavGroup } from '../types';

export const clientSections: NavGroup[] = [
  {
    group: 'GETTING STARTED',
    items: [
      { id: 'cl-overview', label: 'What You Received' },
      { id: 'cl-prerequisites', label: 'Prerequisites' },
      { id: 'cl-flow', label: 'How It Works' },
    ],
  },
  {
    group: 'INTEGRATION',
    items: [
      { id: 'cl-react', label: 'React Frontend' },
      { id: 'cl-python', label: 'Python Backend' },
      { id: 'cl-env', label: 'Environment Variables' },
    ],
  },
  {
    group: 'TESTING',
    items: [
      { id: 'cl-testing', label: 'Test Your Integration' },
      { id: 'cl-token', label: 'Verify Token' },
    ],
  },
  {
    group: 'TROUBLESHOOTING',
    items: [
      { id: 'cl-errors', label: 'Common Errors' },
      { id: 'cl-contact', label: 'Contact INextLabs' },
    ],
  },
];
