import React, { useState, useEffect, useRef } from 'react';
import {
  Send,
  Bot,
  User,
  Headphones,
  Sparkles,
  RotateCcw,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  CheckCircle2,
  Package,
  Search,
  FileText,
  Star,
  Info,
} from 'lucide-react';
import { ChatMessage, ChatSession, ToolCallExecution, RetrievalResult } from '../types';

interface CustomerChatProps {
  onEscalationTriggered?: () => void;
}

export const CustomerChat: React.FC<CustomerChatProps> = ({ onEscalationTriggered }) => {
  const [session, setSession] = useState<ChatSession | null>(null);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [expandedTools, setExpandedTools] = useState<Record<string, boolean>>({});
  const [expandedCitations, setExpandedCitations] = useState<Record<string, boolean>>({});
  const [userRating, setUserRating] = useState<number | null>(null);
  const [feedbackSent, setFeedbackSent] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchSession = async () => {
    try {
      const res = await fetch('/api/chat/session?customerId=usr_customer_1');
      const data = await res.json();
      if (data.session) {
        setSession(data.session);
      }
    } catch (err) {
      console.error('Failed to fetch session:', err);
    }
  };

  useEffect(() => {
    fetchSession();
    const interval = setInterval(fetchSession, 3000); // Polling for live human agent replies
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [session?.messages, loading]);

  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText || inputMessage;
    if (!textToSend.trim() || loading || !session) return;

    setInputMessage('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: session.id,
          content: textToSend,
          customerId: session.customerId,
        }),
      });

      const data = await res.json();
      if (data.session) {
        setSession(data.session);
        if (data.message?.isEscalated && onEscalationTriggered) {
          onEscalationTriggered();
        }
      }
    } catch (err) {
      console.error('Chat error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleResetChat = async () => {
    try {
      const res = await fetch('/api/chat/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerId: 'usr_customer_1' }),
      });
      const data = await res.json();
      if (data.session) {
        setSession(data.session);
        setUserRating(null);
        setFeedbackSent(false);
      }
    } catch (err) {
      console.error('Reset error:', err);
    }
  };

  const toggleToolExpand = (msgId: string, idx: number) => {
    const key = `${msgId}_tool_${idx}`;
    setExpandedTools((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleCitationExpand = (msgId: string, idx: number) => {
    const key = `${msgId}_cite_${idx}`;
    setExpandedCitations((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const quickPrompts = [
    {
      title: '📦 Order Status',
      query: 'Where is my order ORD-9821 and what is the tracking number?',
      badge: 'Tool: check_order_status',
    },
    {
      title: '🔄 Refund Policy',
      query: 'What is your return policy for opened headphones?',
      badge: 'RAG: Vector Retrieval',
    },
    {
      title: '🎧 Catalog Search',
      query: 'Recommend wireless headphones with ANC under $220.',
      badge: 'Tool: search_product_catalog',
    },
    {
      title: '🚨 Human Escalation',
      query: 'I suspect my credit card was charged twice and I demand to speak with a human!',
      badge: 'Tool: escalate_to_human',
    },
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-w-5xl mx-auto bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
      {/* Chat Header */}
      <div className="bg-slate-800/90 border-b border-slate-700/80 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow">
              <Bot className="w-5 h-5" />
            </div>
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-slate-900 rounded-full" />
          </div>
          <div>
            <h2 className="font-semibold text-white text-sm sm:text-base flex items-center space-x-2">
              <span>TechCorp AI Support Assistant</span>
              <span className="text-[10px] bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 px-2 py-0.5 rounded-full font-mono">
                Gemini 3.8 Flash
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Customer: <span className="text-slate-300 font-medium">{session?.customerName || 'Alice Johnson'}</span> • Session:{' '}
              <span className="font-mono text-slate-500">{session?.id.slice(0, 14)}...</span>
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {session?.status === 'escalated' && (
            <div className="flex items-center space-x-1.5 px-3 py-1 bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs rounded-full font-medium animate-pulse">
              <Headphones className="w-3.5 h-3.5" />
              <span>Escalated to Tier 2 Human</span>
            </div>
          )}
          <button
            onClick={handleResetChat}
            className="flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 bg-slate-700/80 hover:bg-slate-700 border border-slate-600 transition"
            title="Start fresh conversation"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Escalation Notification Banner */}
      {session?.status === 'escalated' && (
        <div className="bg-amber-950/40 border-b border-amber-600/30 px-6 py-2.5 flex items-center justify-between text-xs text-amber-200">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              <strong>Active Human Takeover:</strong> Marcus Chen (Tier 2 Support) has joined this channel. You can message directly.
            </span>
          </div>
          <span className="text-[11px] bg-amber-500/20 px-2 py-0.5 rounded border border-amber-500/40 font-mono">
            Priority Queue
          </span>
        </div>
      )}

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 bg-gradient-to-b from-slate-900 to-slate-950">
        {session?.messages.map((msg) => {
          const isUser = msg.sender === 'user';
          const isHumanAgent = msg.sender === 'human_agent';
          const isSystem = msg.sender === 'system';

          if (isSystem) {
            return (
              <div key={msg.id} className="flex justify-center my-2">
                <span className="text-xs px-3 py-1 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                  {msg.content}
                </span>
              </div>
            );
          }

          return (
            <div
              key={msg.id}
              className={`flex items-start space-x-3 ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}
            >
              {/* Avatar */}
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow ${
                  isUser
                    ? 'bg-blue-600 text-white'
                    : isHumanAgent
                    ? 'bg-emerald-600 text-white'
                    : 'bg-cyan-600 text-white'
                }`}
              >
                {isUser ? (
                  <User className="w-4 h-4" />
                ) : isHumanAgent ? (
                  <Headphones className="w-4 h-4" />
                ) : (
                  <Bot className="w-4 h-4" />
                )}
              </div>

              {/* Message Content */}
              <div
                className={`max-w-[85%] sm:max-w-[78%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
                  isUser
                    ? 'bg-blue-600 text-white rounded-tr-none'
                    : isHumanAgent
                    ? 'bg-emerald-950/70 border border-emerald-600/40 text-emerald-100 rounded-tl-none'
                    : 'bg-slate-800/90 border border-slate-700/80 text-slate-100 rounded-tl-none'
                }`}
              >
                {/* Sender Title */}
                {!isUser && (
                  <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-slate-700/60 text-xs">
                    <span className="font-semibold text-slate-300">
                      {isHumanAgent ? 'Marcus Chen (Support Specialist)' : 'Aegis AI Assistant'}
                    </span>
                    <div className="flex items-center space-x-2 text-[11px] text-slate-400">
                      {msg.confidenceScore !== undefined && (
                        <span className="text-emerald-400 font-mono">
                          Confidence: {(msg.confidenceScore * 100).toFixed(0)}%
                        </span>
                      )}
                      <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                )}

                {/* Body Text */}
                <div className="whitespace-pre-wrap font-sans text-[13.5px]">
                  {msg.content}
                </div>

                {/* Tool Executions Pill */}
                {msg.toolCalls && msg.toolCalls.length > 0 && (
                  <div className="mt-3 space-y-2 pt-2 border-t border-slate-700/50">
                    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center space-x-1">
                      <Sparkles className="w-3 h-3 text-cyan-400" />
                      <span>Autonomous Tools Executed ({msg.toolCalls.length}):</span>
                    </p>
                    {msg.toolCalls.map((tc, idx) => {
                      const key = `${msg.id}_tool_${idx}`;
                      const isExpanded = !!expandedTools[key];
                      return (
                        <div
                          key={idx}
                          className="bg-slate-900/90 border border-cyan-500/20 rounded-lg p-2 text-xs"
                        >
                          <div
                            className="flex items-center justify-between cursor-pointer select-none"
                            onClick={() => toggleToolExpand(msg.id, idx)}
                          >
                            <div className="flex items-center space-x-1.5 text-cyan-300 font-mono">
                              <span className="text-emerald-400 font-bold">✓</span>
                              <span>{tc.name}</span>
                            </div>
                            <button className="text-slate-400 hover:text-slate-200">
                              {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                          {isExpanded && (
                            <div className="mt-2 pt-2 border-t border-slate-800 space-y-1 font-mono text-[11px]">
                              <div className="text-slate-400">
                                <strong>Args:</strong> {JSON.stringify(tc.input, null, 2)}
                              </div>
                              <div className="text-slate-300">
                                <strong>Result:</strong> {JSON.stringify(tc.output, null, 2)}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Source Citations Pill */}
                {msg.citations && msg.citations.length > 0 && (
                  <div className="mt-3 space-y-2 pt-2 border-t border-slate-700/50">
                    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center space-x-1">
                      <FileText className="w-3 h-3 text-blue-400" />
                      <span>RAG Sources Grounded ({msg.citations.length}):</span>
                    </p>
                    <div className="space-y-1.5">
                      {msg.citations.map((cite, idx) => {
                        const key = `${msg.id}_cite_${idx}`;
                        const isExpanded = !!expandedCitations[key];
                        return (
                          <div
                            key={idx}
                            className="bg-slate-900/80 border border-slate-700/70 rounded-lg p-2 text-xs"
                          >
                            <div
                              className="flex items-center justify-between cursor-pointer select-none"
                              onClick={() => toggleCitationExpand(msg.id, idx)}
                            >
                              <div className="flex items-center space-x-2 text-slate-200">
                                <span className="font-medium">{cite.chunk.docTitle}</span>
                                <span className="text-[10px] bg-blue-500/20 text-blue-400 px-1.5 py-0.2 rounded font-mono">
                                  Sim: {(cite.score * 100).toFixed(0)}%
                                </span>
                              </div>
                              <button className="text-slate-400 hover:text-slate-200">
                                {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                              </button>
                            </div>
                            {isExpanded && (
                              <div className="mt-2 pt-2 border-t border-slate-800 text-[11.5px] text-slate-300 italic">
                                "{cite.chunk.content}"
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Escalation Reason Badge */}
                {msg.isEscalated && (
                  <div className="mt-2.5 p-2 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center space-x-2 text-xs text-amber-300">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    <span>Escalated Reason: {msg.escalationReason || 'Policy trigger'}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Loading Indicator */}
        {loading && (
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-cyan-600 flex items-center justify-center text-white">
              <Bot className="w-4 h-4 animate-spin" />
            </div>
            <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl rounded-tl-none px-4 py-3 text-xs text-slate-300 flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span>Querying vector store & evaluating tools...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Inquiries */}
      <div className="bg-slate-900/95 border-t border-slate-800 px-4 py-2.5 overflow-x-auto scrollbar-none">
        <div className="flex items-center space-x-2">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider shrink-0 flex items-center space-x-1">
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>Try Quick Test:</span>
          </span>
          {quickPrompts.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(p.query)}
              disabled={loading}
              className="shrink-0 flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-xs text-slate-300 hover:text-white transition disabled:opacity-50"
            >
              <span>{p.title}</span>
              <span className="text-[9px] bg-slate-900 px-1.5 py-0.5 rounded text-cyan-400 font-mono">
                {p.badge}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Input Form */}
      <div className="bg-slate-800/95 border-t border-slate-700/80 p-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center space-x-3"
        >
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder={
              session?.status === 'escalated'
                ? 'Type your message to Marcus Chen (Human Support)...'
                : 'Ask about return policy, order tracking, catalog items, or warranty...'
            }
            disabled={loading}
            className="flex-1 bg-slate-900 border border-slate-700 focus:border-cyan-500 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-400 outline-none transition disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={loading || !inputMessage.trim()}
            className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white px-5 py-2.5 rounded-xl font-medium text-sm flex items-center space-x-1.5 transition disabled:opacity-50 shadow-md shadow-blue-500/20"
          >
            <span>Send</span>
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
