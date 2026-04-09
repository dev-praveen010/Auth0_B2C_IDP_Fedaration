import CodeBlock from './CodeBlock';
import type { StepCardProps } from '../types';

export default function StepCard({ steps }: StepCardProps) {
  return (
    <div className="relative my-6">
      {steps.map((step, index) => (
        <div key={index} className="flex gap-4 mb-6 last:mb-0">
          {/* Number circle + connecting line */}
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold shrink-0">
              {step.number}
            </div>
            {index < steps.length - 1 && (
              <div className="w-0.5 bg-gray-300 flex-1 mt-1" />
            )}
          </div>

          {/* Content */}
          <div className="flex-1 pb-2">
            <h4 className="text-base font-semibold text-gray-900 mb-1">{step.title}</h4>
            <p className="text-sm text-gray-600 mb-2 whitespace-pre-line">{step.description}</p>
            {step.code && (
              <CodeBlock code={step.code.content} language={step.code.language} filename={step.code.filename} />
            )}
            {step.note && (
              <p className="text-xs text-gray-500 mt-1 whitespace-pre-line">{step.note}</p>
            )}
            {step.warning && (
              <p className="text-xs text-amber-600 mt-1 whitespace-pre-line">⚠️ {step.warning}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
