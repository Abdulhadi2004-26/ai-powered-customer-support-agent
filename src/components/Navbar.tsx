import React from 'react';
import {
  Bot,
  User,
  Headphones,
  ShieldCheck,
  BookOpen,
  Scale,
  BarChart3,
  Code2,
  Package,
  Layers,
  FileCode,
} from 'lucide-react';
import { UserRole } from '../types';

interface NavbarProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
  escalationsCount: number;
  totalChunks: number;
  onOpenApiDocs: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRole,
  onRoleChange,
  activeTab,
  onTabChange,
  escalationsCount,
  totalChunks,
  onOpenApiDocs,
}) => {
  const tabs = [
    {
      id: 'chat',
      label: 'Live Support Chat',
      icon: Bot,
      roles: ['customer', 'agent', 'admin'],
      badge: null,
    },
    {
      id: 'escalations',
      label: 'Human Handoff',
      icon: Headphones,
      roles: ['agent', 'admin'],
      badge: escalationsCount > 0 ? escalationsCount : null,
    },
    {
      id: 'knowledge',
      label: 'RAG Knowledge Base',
      icon: BookOpen,
      roles: ['admin', 'agent'],
      badge: `${totalChunks} chunks`,
    },
    {
      id: 'evaluator',
      label: 'LLM-as-a-Judge',
      icon: Scale,
      roles: ['admin'],
      badge: '4 Metrics',
    },
    {
      id: 'data',
      label: 'Orders & Tickets',
      icon: Package,
      roles: ['customer', 'agent', 'admin'],
      badge: null,
    },
    {
      id: 'analytics',
      label: 'Analytics & CSAT',
      icon: BarChart3,
      roles: ['admin', 'agent'],
      badge: null,
    },
    {
      id: 'codebase',
      label: 'Python & Docker Repo',
      icon: Code2,
      roles: ['customer', 'agent', 'admin'],
      badge: 'FastAPI',
    },
  ];

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-40 shadow-sm">
      {/* Top Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => onTabChange('chat')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-md shadow-blue-500/20">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg tracking-tight text-white">Aegis AI Support</span>
                <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  Enterprise
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Autonomous RAG • Tool Calling • Human Handoff • LLM Judge
              </p>
            </div>
          </div>

          {/* Right Section: System pill + API Docs + Role Selector */}
          <div className="flex items-center space-x-3">
            {/* API Docs Button */}
            <button
              onClick={onOpenApiDocs}
              className="hidden md:flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
              title="Open REST API & Swagger Specs"
            >
              <FileCode className="w-3.5 h-3.5 text-cyan-400" />
              <span>API Explorer</span>
            </button>

            {/* Role Switcher */}
            <div className="flex items-center bg-slate-800/90 rounded-lg p-1 border border-slate-700/80">
              <span className="text-[11px] font-medium text-slate-400 px-2 hidden lg:inline">
                Role:
              </span>
              <button
                onClick={() => onRoleChange('customer')}
                className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition ${
                  currentRole === 'customer'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>Customer</span>
              </button>
              <button
                onClick={() => onRoleChange('agent')}
                className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition relative ${
                  currentRole === 'agent'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Headphones className="w-3.5 h-3.5" />
                <span>Agent</span>
                {escalationsCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full animate-ping" />
                )}
              </button>
              <button
                onClick={() => onRoleChange('admin')}
                className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition ${
                  currentRole === 'admin'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Admin</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 overflow-x-auto pb-2 scrollbar-none border-t border-slate-800/80 pt-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                  isActive
                    ? 'bg-slate-800 text-cyan-400 border border-cyan-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${
                      typeof tab.badge === 'number'
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        : 'bg-slate-700 text-slate-300'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
