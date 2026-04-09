import type { ReactNode } from 'react';

export interface NavItem {
  id: string;
  label: string;
}

export interface NavGroup {
  group: string;
  items: NavItem[];
}

export interface Step {
  number: number;
  title: string;
  description: string;
  code?: {
    content: string;
    language: CodeLanguage;
    filename?: string;
  };
  note?: string;
  warning?: string;
}

export type CodeLanguage =
  | 'jsx' | 'tsx' | 'js' | 'ts'
  | 'python' | 'py'
  | 'xml' | 'bash' | 'shell'
  | 'env' | 'json' | 'text'
  | 'javascript';

export interface CodeBlockProps {
  code: string;
  language?: CodeLanguage;
  filename?: string;
  showLineNumbers?: boolean;
}

export interface CalloutProps {
  type: 'warning' | 'error' | 'success' | 'info' | 'tip';
  title: string;
  children: ReactNode;
}

export interface DocSectionProps {
  id: string;
  title: string;
  subtitle?: string;
  badge?: string;
  children: ReactNode;
}

export interface StepCardProps {
  steps: Step[];
}

export interface InfoTableProps {
  headers: string[];
  rows: string[][];
  striped?: boolean;
}

export interface ChecklistItem {
  label: string;
  description: string;
  required: boolean;
  value?: string;
}

export interface ChecklistCardProps {
  title: string;
  items: ChecklistItem[];
  color?: 'blue' | 'green';
}

export interface SidebarProps {
  sections: NavGroup[];
  activeSection: string;
  onNavClick: (id: string) => void;
  accentColor: 'blue' | 'green';
}

export interface TopNavProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
}

export interface LayoutProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  activeSection: string;
  sections: NavGroup[];
  accentColor: 'blue' | 'green';
  onNavClick: (id: string) => void;
  children: ReactNode;
}

export type ActiveTab = 'internal' | 'client';
