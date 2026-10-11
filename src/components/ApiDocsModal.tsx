import React, { useState } from 'react';
import { FileCode, X, Play, Check, ChevronDown, ChevronUp } from 'lucide-react';

interface ApiDocsModalProps {
  onClose: () => void;
}

export const ApiDocsModal: React.FC<ApiDocsModalProps> = ({ onClose }) => {
  const [selectedEndpoint, setSelectedEndpoint] = useState<string>('/api/chat/message');
  const [testResponse, setTestResponse] = useState<any>(null);
  const [testing, setTesting] = useState(false);

  const endpoints = [
    {
      method: 'POST',
      path: '/api/chat/message',
      summary: 'Execute Agent Turn (RAG + Tools + LLM Judge)',
      desc: 'Dispatches user input to RAG vector search, executes necessary tools (e.g. check_order_status, search_product_catalog), triggers human escalation if needed, and stores evaluation metrics.',
      requestBody: {
        sessionId: 'sess_demo_1',
        content: 'Where is my order ORD-9821?',
        customerId: 'usr_customer_1',
      },
    },
    {
      method: 'GET',
      path: '/api/documents',
      summary: 'List Indexed Knowledge Base Documents',
      desc: 'Retrieves all active policy, warranty, shipping, and catalog documents stored in the vector store along with chunk counts.',
      requestBody: null,
    },
    {
      method: 'POST',
      path: '/api/rag/test-search',
      summary: 'Run Hybrid Vector Similarity Search',
      desc: 'Computes cosine similarity between query embeddings and chunk embeddings fused with BM25 lexical keyword matches.',
      requestBody: {
        query: 'What is the return policy window?',
        topK: 2,
      },
    },
    {
      method: 'GET',
      path: '/api/orders/ORD-9821',
      summary: 'Get Order Status & Tracking Manifest',
      desc: 'Internal tool endpoint retrieving real-time courier tracking number, destination, and package items.',
      requestBody: null,
    },
    {
      method: 'POST',
      path: '/api/evaluations/run',
      summary: 'Run LLM-as-a-Judge Quality Scoring',
      desc: 'Evaluates response candidate on Groundedness, Relevance, Faithfulness, and Task Completion on 1-5 scale with PASS/WARN/FAIL verdict.',
      requestBody: {
        query: 'How long do refunds take?',
        response: 'Refunds are processed within 3-5 business days back to your original payment method.',
        retrievedContext: ['Refunds take 3-5 business days.'],
      },
    },
    {
      method: 'GET',
      path: '/api/analytics',
      summary: 'Operations Telemetry & Deflection Metrics',
      desc: 'Returns AI deflection percentage, average response latency, CSAT scores, and human escalation rates.',
      requestBody: null,
    },
  ];

  const currentEp = endpoints.find((e) => e.path === selectedEndpoint) || endpoints[0];

  const handleTestEndpoint = async () => {
    setTesting(true);
    setTestResponse(null);
    try {
      const options: RequestInit = {
        method: currentEp.method,
        headers: { 'Content-Type': 'application/json' },
      };
      if (currentEp.requestBody) {
        options.body = JSON.stringify(currentEp.requestBody);
      }
      const res = await fetch(currentEp.path, options);
      const data = await res.json();
      setTestResponse({ status: res.status, ok: res.ok, data });
    } catch (err: any) {
      setTestResponse({ error: err.message });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-slate-800/90 border-b border-slate-700 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <FileCode className="w-5 h-5 text-cyan-400" />
            <div>
              <h2 className="text-base font-bold text-white flex items-center space-x-2">
                <span>Interactive OpenAPI & REST Swagger Documentation</span>
                <span className="text-[10px] bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 px-2 py-0.5 rounded font-mono">
                  v1.0.0
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Live endpoints deployed on production FastAPI / Express backend
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content: Endpoint selector + Playground */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Endpoint Selector */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {endpoints.map((ep) => {
              const isSelected = ep.path === currentEp.path;
              return (
                <button
                  key={ep.path}
                  onClick={() => {
                    setSelectedEndpoint(ep.path);
                    setTestResponse(null);
                  }}
                  className={`text-left p-3 rounded-xl border transition ${
                    isSelected
                      ? 'bg-slate-800 border-cyan-500/60 shadow-md'
                      : 'bg-slate-950/60 border-slate-800 hover:bg-slate-850 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center space-x-2 font-mono text-[11px] mb-1">
                    <span
                      className={`font-bold px-1.5 py-0.2 rounded ${
                        ep.method === 'POST'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                      }`}
                    >
                      {ep.method}
                    </span>
                    <span className="text-slate-300 truncate">{ep.path}</span>
                  </div>
                  <p className="text-xs text-slate-400 line-clamp-1">{ep.summary}</p>
                </button>
              );
            })}
          </div>

          {/* Active Endpoint Details & Live Test */}
          <div className="bg-slate-950 rounded-2xl border border-slate-800 p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2 font-mono text-sm">
                <span
                  className={`font-bold px-2 py-0.5 rounded ${
                    currentEp.method === 'POST'
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'bg-blue-500/20 text-blue-400'
                  }`}
                >
                  {currentEp.method}
                </span>
                <span className="text-white font-bold">{currentEp.path}</span>
              </div>
              <button
                onClick={handleTestEndpoint}
                disabled={testing}
                className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold transition disabled:opacity-50"
              >
                <Play className="w-3.5 h-3.5" />
                <span>{testing ? 'Executing...' : 'Execute Live Request'}</span>
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">{currentEp.desc}</p>

            {/* Request Body (if any) */}
            {currentEp.requestBody && (
              <div className="space-y-1">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Request Payload (application/json):
                </p>
                <pre className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs font-mono text-cyan-300 overflow-x-auto">
                  {JSON.stringify(currentEp.requestBody, null, 2)}
                </pre>
              </div>
            )}

            {/* Test Result Response */}
            {testResponse && (
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-400 uppercase tracking-wider">
                    Server Response:
                  </span>
                  <span
                    className={`font-mono font-bold px-2 py-0.5 rounded ${
                      testResponse.ok
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-rose-500/20 text-rose-400'
                    }`}
                  >
                    HTTP {testResponse.status}
                  </span>
                </div>
                <pre className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs font-mono text-slate-200 overflow-x-auto max-h-60">
                  {JSON.stringify(testResponse.data || testResponse, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
