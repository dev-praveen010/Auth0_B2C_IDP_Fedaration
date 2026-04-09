import type { CalloutProps } from '../types';

const calloutStyles: Record<CalloutProps['type'], { bg: string; border: string; titleColor: string; icon: string }> = {
  warning: {
    bg: 'bg-amber-50',
    border: 'border-amber-400',
    titleColor: 'text-amber-700',
    icon: '⚠️',
  },
  error: {
    bg: 'bg-red-50',
    border: 'border-red-500',
    titleColor: 'text-red-700',
    icon: '🔴',
  },
  success: {
    bg: 'bg-emerald-50',
    border: 'border-emerald-500',
    titleColor: 'text-emerald-700',
    icon: '✅',
  },
  info: {
    bg: 'bg-blue-50',
    border: 'border-blue-400',
    titleColor: 'text-blue-700',
    icon: '💡',
  },
  tip: {
    bg: 'bg-purple-50',
    border: 'border-purple-400',
    titleColor: 'text-purple-700',
    icon: '🎯',
  },
};

export default function Callout({ type = 'info', title, children }: CalloutProps) {
  const style = calloutStyles[type];

  return (
    <div className={`${style.bg} border-l-4 ${style.border} p-4 rounded-r-lg my-4`}>
      <div className={`flex items-center gap-2 font-bold ${style.titleColor} mb-1`}>
        <span>{style.icon}</span>
        <span>{title}</span>
      </div>
      <div className="text-gray-700 text-sm">{children}</div>
    </div>
  );
}
