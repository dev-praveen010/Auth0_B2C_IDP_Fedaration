import { CheckCircle } from 'lucide-react';
import type { ChecklistCardProps } from '../types';

export default function ChecklistCard({ title, items, color = 'blue' }: ChecklistCardProps) {
  const headerBg = color === 'blue' ? 'bg-blue-600' : 'bg-emerald-600';
  const badgeBg = color === 'blue' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700';
  const iconColor = color === 'blue' ? 'text-blue-500' : 'text-emerald-500';

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden my-4">
      <div className={`${headerBg} px-4 py-3`}>
        <h3 className="text-white font-semibold text-sm">{title}</h3>
      </div>
      <div className="bg-white divide-y divide-gray-100">
        {items.map((item, index) => (
          <div key={index} className="flex items-start gap-3 px-4 py-3">
            <CheckCircle className={`w-5 h-5 ${iconColor} shrink-0 mt-0.5`} />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-900">{item.label}</span>
                {item.required && (
                  <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${badgeBg}`}>
                    Required
                  </span>
                )}
              </div>
              {item.description && (
                <p className="text-xs text-gray-500 mt-0.5">{item.description}</p>
              )}
              {item.value && (
                <code className="text-xs font-mono bg-gray-100 text-gray-600 px-2 py-0.5 rounded mt-1 inline-block">
                  {item.value}
                </code>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
