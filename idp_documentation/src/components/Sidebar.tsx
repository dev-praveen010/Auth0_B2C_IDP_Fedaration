import type { SidebarProps } from '../types';

export default function Sidebar({ sections, activeSection, onNavClick, accentColor }: SidebarProps) {
  const borderColor = accentColor === 'blue' ? 'border-blue-500' : 'border-emerald-500';
  const activeBg = 'bg-gray-800';
  const activeText = 'text-white';

  return (
    <aside className="fixed left-0 top-16 w-72 h-[calc(100vh-4rem)] bg-gray-900 overflow-y-auto z-40">
      <nav className="py-4">
        {sections.map((group) => (
          <div key={group.group} className="mb-4">
            <h3 className="px-6 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              {group.group}
            </h3>
            <ul>
              {group.items.map((item) => {
                const isActive = activeSection === item.id;
                return (
                  <li key={item.id}>
                    <button
                      onClick={() => onNavClick(item.id)}
                      className={`w-full text-left px-6 py-2 text-sm transition-colors cursor-pointer ${
                        isActive
                          ? `${activeBg} ${activeText} border-l-3 ${borderColor}`
                          : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50 border-l-3 border-transparent'
                      }`}
                    >
                      {item.label}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  );
}
