import type { DocSectionProps } from '../types';

const badgeColors: Record<string, string> = {
  'Internal Only': 'bg-blue-100 text-blue-700',
  'Client Facing': 'bg-emerald-100 text-emerald-700',
  'Client Onboarding': 'bg-blue-100 text-blue-700',
  'Client Guide': 'bg-emerald-100 text-emerald-700',
  'Support': 'bg-emerald-100 text-emerald-700',
};

export default function DocSection({ id, title, subtitle, children, badge }: DocSectionProps) {
  return (
    <section id={id} data-section={id} className="mb-12 scroll-mt-20">
      <div className="mb-4">
        <div className="flex items-center gap-3 mb-1">
          <h2 className="text-2xl font-semibold text-gray-900">{title}</h2>
          {badge && (
            <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${badgeColors[badge] || 'bg-gray-100 text-gray-700'}`}>
              {badge}
            </span>
          )}
        </div>
        {subtitle && (
          <p className="text-gray-500 text-sm">{subtitle}</p>
        )}
        <hr className="border-gray-200 mt-3" />
      </div>
      <div>{children}</div>
    </section>
  );
}
