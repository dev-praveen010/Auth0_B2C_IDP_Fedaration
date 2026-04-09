import { useState, useEffect, useCallback } from 'react';
import Layout from './components/Layout';
import InternalDocs from './pages/InternalDocs';
import ClientDocs from './pages/ClientDocs';
import { internalSections } from './data/internalSections';
import { clientSections } from './data/clientSections';
import type { ActiveTab } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('internal');
  const [activeSection, setActiveSection] = useState<string>('int-overview');

  const sections = activeTab === 'internal' ? internalSections : clientSections;
  const accentColor = activeTab === 'internal' ? 'blue' as const : 'green' as const;

  // Reset scroll and active section on tab switch
  useEffect(() => {
    const defaultSection = activeTab === 'internal' ? 'int-overview' : 'cl-overview';
    setActiveSection(defaultSection);
    window.scrollTo({ top: 0 });
  }, [activeTab]);

  // IntersectionObserver for active section tracking
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const sectionId = entry.target.getAttribute('data-section');
            if (sectionId) {
              setActiveSection(sectionId);
            }
          }
        });
      },
      { threshold: 0.3 }
    );

    const elements = document.querySelectorAll('[data-section]');
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [activeTab]);

  const handleNavClick = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  return (
    <Layout
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      activeSection={activeSection}
      sections={sections}
      accentColor={accentColor}
      onNavClick={handleNavClick}
    >
      {activeTab === 'internal' ? <InternalDocs /> : <ClientDocs />}
    </Layout>
  );
}
