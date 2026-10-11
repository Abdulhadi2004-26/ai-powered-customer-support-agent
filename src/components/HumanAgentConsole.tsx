import React, { useState, useEffect } from 'react';
import {
  Headphones,
  AlertTriangle,
  User,
  Send,
  CheckCircle,
  Clock,
  Sparkles,
  Shield,
  MessageSquare,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';
import { ChatSession } from '../types';

export const HumanAgentConsole: React.FC = () => {
  const [escalations, setEscalations] = useState<ChatSession[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchEscalations = async () => {
    try {
      const res = await fetch('/api/escalations');
      const data = await res.json();
      setEscalations(data.escalations || []);
      if (data.escalations?.length > 0 && !selectedSessionId) {
        setSelectedSessionId(data.escalations[0].id);
      }
    } catch (err) {
      console.error('Failed to fetch escalations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEscalations();
    const interval = setInterval(fetchEscalations, 3000);
    return () => clearInterval(interval);
  }, []);

  const activeSession = escalations.find((s) => s.id === selectedSessionId) || escalations[0];

  const handleSendHumanReply = async () => {
    if (!replyText.trim() || !activeSession || sending) return;
    setSending(true);

    try {
      const res = await fetch('/api/escalations/reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: activeSession.id,
          content: replyText.trim(),
          agentName: 'Marcus Chen (Tier 2 Specialist)',
        }),
      });
      const data = await res.json();
      if (data.success) {
        setReplyText('');
        fetchEscalations();
      }
    } catch (err) {
      console.error('Reply error:', err);
    } finally {
      setSending(false);
    }
  };

  const handleResolveSession = async () => {
    if (!activeSession) return;
    try {
      const res = await fetch('/api/escalations/resolve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: activeSession.id }),
      });
      const data = await res.json();
      if (data.success) {
        fetchEscalations();
      }
    } catch (err) {
      console.error('Resolve error:', err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
            <Headphones className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white flex items-center space-x-2">
              <span>Tier 2 Human Escalation Console</span>
              <span className="text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-mono">
                Live Intercept
              </span>
            </h1>
            <p className="text-sm text-slate-400">
              Assigned Specialist: <strong className="text-slate-200">Marcus Chen</strong> • Autonomous handoffs requiring human discretion
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={fetchEscalations}
            className="flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh Queue</span>
          </button>
          <div className="px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-300">
            Pending Queue:{' '}
            <strong className="text-amber-400">{escalations.length} Cases</strong>
          </div>
        </div>
      </div>

      {/* Main Grid: Queue on left, active conversation on right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Queue List */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3">
          <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider px-2 flex items-center justify-between">
            <span>Escalation Queue</span>
            <span className="text-xs bg-slate-800 px-2 py-0.5 rounded text-slate-400 font-mono">
              {escalations.length} Active
            </span>
          </h2>

          {escalations.length === 0 ? (
            <div className="text-center py-12 px-4 rounded-xl bg-slate-800/40 border border-dashed border-slate-800">
              <CheckCircle className="w-10 h-10 text-emerald-400 mx-auto mb-3" />
              <p className="text-sm font-medium text-slate-200">Queue is Clear!</p>
              <p className="text-xs text-slate-400 mt-1">
                All customer inquiries are currently handled autonomously by the AI Agent.
              </p>
              <p className="text-[11px] text-cyan-400 mt-3">
                Tip: In the Customer Chat, type <em>"Connect me to human"</em> to trigger a live handoff test.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {escalations.map((sess) => {
                const isSelected = sess.id === (activeSession?.id || selectedSessionId);
                const lastMsg = sess.messages[sess.messages.length - 1];
                return (
                  <div
                    key={sess.id}
                    onClick={() => setSelectedSessionId(sess.id)}
                    className={`p-3.5 rounded-xl cursor-pointer transition border text-left ${
                      isSelected
                        ? 'bg-slate-800 border-emerald-500/60 shadow-md'
                        : 'bg-slate-800/50 border-slate-700/60 hover:bg-slate-800/80 hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-sm text-white">{sess.customerName}</span>
                      <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1.5 py-0.2 rounded font-mono">
                        High Priority
                      </span>
                    </div>
                    <p className="text-xs text-amber-300/90 font-medium line-clamp-1 mb-1">
                      Reason: {sess.escalationReason || 'Policy trigger'}
                    </p>
                    <p className="text-xs text-slate-400 line-clamp-2">
                      {lastMsg ? lastMsg.content : 'No messages yet'}
                    </p>
                    <div className="mt-2 text-[10px] text-slate-500 flex items-center justify-between">
                      <span>ID: {sess.id.slice(0, 12)}</span>
                      <span>{new Date(sess.updatedAt).toLocaleTimeString()}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Active Intercept Window */}
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl flex flex-col h-[600px] overflow-hidden">
          {activeSession ? (
            <>
              {/* Header */}
              <div className="bg-slate-800/90 border-b border-slate-700 p-4 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-white flex items-center space-x-2">
                    <span>{activeSession.customerName}</span>
                    <span className="text-xs font-normal text-slate-400">({activeSession.customerEmail})</span>
                  </h3>
                  <p className="text-xs text-amber-400 font-medium">
                    Trigger: {activeSession.escalationReason || 'Autonomous handoff triggered'}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleResolveSession}
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium transition shadow-sm"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Mark Resolved</span>
                  </button>
                </div>
              </div>

              {/* Chat Stream */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-950/60">
                {activeSession.messages.map((m) => {
                  const isUser = m.sender === 'user';
                  const isHuman = m.sender === 'human_agent';
                  return (
                    <div
                      key={m.id}
                      className={`flex flex-col ${isUser ? 'items-start' : 'items-end'}`}
                    >
                      <div className="text-[11px] text-slate-500 mb-0.5 px-1">
                        {isUser
                          ? activeSession.customerName
                          : isHuman
                          ? 'Marcus Chen (You)'
                          : 'Aegis AI'} • {new Date(m.timestamp).toLocaleTimeString()}
                      </div>
                      <div
                        className={`max-w-[80%] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm leading-relaxed ${
                          isUser
                            ? 'bg-slate-800 text-slate-100 border border-slate-700'
                            : isHuman
                            ? 'bg-emerald-600 text-white shadow'
                            : 'bg-cyan-950/60 border border-cyan-800/40 text-cyan-200'
                        }`}
                      >
                        {m.content}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Reply Form */}
              <div className="bg-slate-800/90 border-t border-slate-700 p-4">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendHumanReply();
                  }}
                  className="flex items-center space-x-2"
                >
                  <input
                    type="text"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Type human response to customer..."
                    disabled={sending}
                    className="flex-1 bg-slate-900 border border-slate-700 focus:border-emerald-500 rounded-xl px-4 py-2 text-xs sm:text-sm text-white placeholder-slate-500 outline-none transition"
                  />
                  <button
                    type="submit"
                    disabled={sending || !replyText.trim()}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-xs sm:text-sm font-medium flex items-center space-x-1.5 transition disabled:opacity-50"
                  >
                    <span>Reply</span>
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400">
              <MessageSquare className="w-12 h-12 text-slate-600 mb-3" />
              <p className="text-sm font-medium">Select a conversation from the queue</p>
              <p className="text-xs text-slate-500 mt-1">
                You can review the full AI transcript and take over replying directly.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
