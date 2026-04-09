import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import type { CodeBlockProps, CodeLanguage } from '../types';

const languageBadges: Record<string, string> = {
  jsx: 'bg-yellow-400 text-yellow-900',
  tsx: 'bg-yellow-400 text-yellow-900',
  js: 'bg-yellow-400 text-yellow-900',
  ts: 'bg-yellow-400 text-yellow-900',
  javascript: 'bg-yellow-400 text-yellow-900',
  python: 'bg-blue-500 text-white',
  py: 'bg-blue-500 text-white',
  xml: 'bg-orange-400 text-orange-900',
  bash: 'bg-green-500 text-white',
  shell: 'bg-green-500 text-white',
  env: 'bg-gray-500 text-white',
  json: 'bg-purple-500 text-white',
  text: 'bg-gray-400 text-white',
};

export default function CodeBlock({ code, language = 'bash' as CodeLanguage, filename, showLineNumbers = false }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const badgeClass = languageBadges[language] || 'bg-gray-500 text-white';
  const lines = code.split('\n');

  return (
    <div className="rounded-lg overflow-hidden border border-gray-700 my-4">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
        <span className="text-sm text-gray-300 font-mono">
          {filename || language}
        </span>
        <div className="flex items-center gap-2">
          <span className={`text-xs font-medium px-2 py-0.5 rounded ${badgeClass}`}>
            {language}
          </span>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 text-xs text-gray-400 hover:text-white transition-colors px-2 py-1 rounded hover:bg-gray-700 cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5" />
                Copied! ✓
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                Copy
              </>
            )}
          </button>
        </div>
      </div>

      {/* Code area */}
      <div className="bg-gray-900 p-4 overflow-x-auto">
        <pre className="text-sm font-mono text-gray-100 leading-relaxed">
          {showLineNumbers ? (
            <table className="border-collapse">
              <tbody>
                {lines.map((line, i) => (
                  <tr key={i}>
                    <td className="pr-4 text-right text-gray-600 select-none w-8">
                      {i + 1}
                    </td>
                    <td className="whitespace-pre">{line}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <code>{code}</code>
          )}
        </pre>
      </div>
    </div>
  );
}
