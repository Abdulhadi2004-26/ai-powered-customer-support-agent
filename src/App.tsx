import React, { useState, useEffect } from 'react';
import { UserRole } from './types';
import { Navbar } from './components/Navbar';
import { CustomerChat } from './components/CustomerChat';
import { HumanAgentConsole } from './components/HumanAgentConsole';
import { KnowledgeBase } from './components/KnowledgeBase';
import { EvaluatorDashboard } from './components/EvaluatorDashboard';
import { TicketAndOrderViewer } from './components/TicketAndOrderViewer';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { ArchitectureAndCodeHub } from './components/ArchitectureAndCodeHub';
import { ApiDocsModal } from './components/ApiDocsModal';

export default function App() {
  const [currentRole, setCurrentRole] = useState<UserRole>('customer');
  const [activeTab, setActiveTab] = useState<string>('chat');
  const [escalationsCount, setEscalationsCount] = useState<number>(0);
  const [totalChunks, setTotalChunks] = useState<number>(24);
  const [showApiDocs, setShowApiDocs] = useState<boolean>(false);

  // Poll system state for counts
  const checkSystemState = async () => {
    try {
      const [escRes, docRes] = await Promise.all([
        fetch('/api/escalations'),
        fetch('/api/documents'),
      ]);
      const [escData, docData] = await Promise.all([escRes.json(), docRes.json()]);
      setEscalationsCount(escData.escalations?.length || 0);
      setTotalChunks(docData.totalChunks || 24);
    } catch (e) {
      // silently fallback
    }
  };

  useEffect(() => {
    checkSystemState();
    const interval = setInterval(checkSystemState, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleRoleChange = (role: UserRole) => {
    setCurrentRole(role);
    if (role === 'customer' && (activeTab === 'escalations' || activeTab === 'evaluator')) {
      setActiveTab('chat');
    } else if (role === 'agent' && activeTab === 'evaluator') {
      setActiveTab('escalations');
    }
  };

  const handleEscalationTriggered = () => {
    checkSystemState();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-white">
      {/* Navigation Header */}
      <Navbar
        currentRole={currentRole}
        onRoleChange={handleRoleChange}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        escalationsCount={escalationsCount}
        totalChunks={totalChunks}
        onOpenApiDocs={() => setShowApiDocs(true)}
      />

      {/* Main Workspace Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {activeTab === 'chat' && (
          <CustomerChat onEscalationTriggered={handleEscalationTriggered} />
        )}

        {activeTab === 'escalations' && <HumanAgentConsole />}

        {activeTab === 'knowledge' && <KnowledgeBase />}

        {activeTab === 'evaluator' && <EvaluatorDashboard />}

        {activeTab === 'data' && <TicketAndOrderViewer />}

        {activeTab === 'analytics' && <AnalyticsDashboard />}

        {activeTab === 'codebase' && <ArchitectureAndCodeHub />}
      </main>

      {/* API Documentation / Swagger Modal */}
      {showApiDocs && <ApiDocsModal onClose={() => setShowApiDocs(false)} />}
    </div>
  );
}
