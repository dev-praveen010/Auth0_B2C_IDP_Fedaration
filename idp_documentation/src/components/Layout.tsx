import TopNav from './TopNav';
import Sidebar from './Sidebar';
import type { LayoutProps } from '../types';

export default function Layout({ activeTab, setActiveTab, activeSection, sections, accentColor, onNavClick, children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <TopNav activeTab={activeTab} setActiveTab={setActiveTab} />
      <Sidebar
        sections={sections}
        activeSection={activeSection}
        onNavClick={onNavClick}
        accentColor={accentColor}
      />
      <main className="ml-72 mt-16 min-h-screen bg-gray-50">
        <div className="p-8 max-w-4xl">
          {children}
        </div>
      </main>
    </div>
  );
}
