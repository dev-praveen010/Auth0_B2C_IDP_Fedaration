import { Search } from 'lucide-react';
import type { TopNavProps } from '../types';

export default function TopNav({ activeTab, setActiveTab }: TopNavProps) {
  return (
    <nav className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 z-50">
      {/* Left: Logo + Title */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-sm">IL</span>
        </div>
        <span className="text-lg font-bold text-gray-900">B2C Auth Docs</span>
      </div>

      {/* Center: Tab buttons */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => setActiveTab('internal')}
          className={`px-4 py-2 text-sm font-medium rounded-t-lg border-b-2 transition-colors cursor-pointer ${
            activeTab === 'internal'
              ? 'border-blue-500 text-blue-600 bg-blue-50'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
          }`}
        >
          🔵 Internal Docs
        </button>
        <button
          onClick={() => setActiveTab('client')}
          className={`px-4 py-2 text-sm font-medium rounded-t-lg border-b-2 transition-colors cursor-pointer ${
            activeTab === 'client'
              ? 'border-emerald-500 text-emerald-600 bg-emerald-50'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
          }`}
        >
          🟢 Client Docs
        </button>
      </div>

      {/* Right: Search + Version */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search docs..."
            className="pl-9 pr-4 py-1.5 text-sm border border-gray-200 rounded-lg bg-gray-50 text-gray-700 placeholder-gray-400 w-52 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <span className="text-xs font-medium bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
          v1.0
        </span>
      </div>
    </nav>
  );
}
