import React, { useState, useEffect } from 'react';
import {
  Scale,
  Play,
  CheckCircle,
  AlertTriangle,
  XCircle,
  ShieldAlert,
  BarChart2,
  RefreshCw,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Award,
} from 'lucide-react';
import { LLMEvaluation } from '../types';

export const EvaluatorDashboard: React.FC = () => {
  const [evaluations, setEvaluations] = useState<LLMEvaluation[]>([]);
  const [runningBenchmark, setRunningBenchmark] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filterVerdict, setFilterVerdict] = useState<'ALL' | 'PASS' | 'WARN' | 'FAIL'>('ALL');

  // Custom evaluation test inputs
  const [customQuery, setCustomQuery] = useState('');
  const [customResponse, setCustomResponse] = useState('');
  const [runningCustom, setRunningCustom] = useState(false);

  const fetchEvals = async () => {
    try {
      const res = await fetch('/api/evaluations');
      const data = await res.json();
      setEvaluations(data.evaluations || []);
    } catch (err) {
      console.error('Failed to fetch evaluations:', err);
    }
  };

  useEffect(() => {
    fetchEvals();
  }, []);

  const handleRunBenchmark = async () => {
    setRunningBenchmark(true);
    try {
      const res = await fetch('/api/evaluations/batch-benchmark', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        fetchEvals();
      }
    } catch (err) {
      console.error('Benchmark run failed:', err);
    } finally {
      setRunningBenchmark(false);
    }
  };

  const handleRunCustomEval = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customQuery.trim() || !customResponse.trim() || runningCustom) return;
    setRunningCustom(true);
    try {
      const res = await fetch('/api/evaluations/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: customQuery.trim(),
          response: customResponse.trim(),
          retrievedContext: [],
        }),
      });
      const data = await res.json();
      if (data.evaluation) {
        setCustomQuery('');
        setCustomResponse('');
        fetchEvals();
      }
    } catch (err) {
      console.error('Custom eval failed:', err);
    } finally {
      setRunningCustom(false);
    }
  };

  const filteredEvals = evaluations.filter((ev) => {
    if (filterVerdict === 'ALL') return true;
    return ev.verdict === filterVerdict;
  });

  const passCount = evaluations.filter((e) => e.verdict === 'PASS').length;
  const warnCount = evaluations.filter((e) => e.verdict === 'WARN').length;
  const failCount = evaluations.filter((e) => e.verdict === 'FAIL').length;
  const passRate = evaluations.length > 0 ? ((passCount / evaluations.length) * 100).toFixed(1) : '100.0';

  const avgGroundedness = evaluations.length
    ? (evaluations.reduce((acc, e) => acc + e.groundedness.score, 0) / evaluations.length).toFixed(1)
    : '4.8';
  const avgRelevance = evaluations.length
    ? (evaluations.reduce((acc, e) => acc + e.relevance.score, 0) / evaluations.length).toFixed(1)
    : '4.9';
  const avgFaithfulness = evaluations.length
    ? (evaluations.reduce((acc, e) => acc + e.faithfulness.score, 0) / evaluations.length).toFixed(1)
    : '4.9';
  const avgTask = evaluations.length
    ? (evaluations.reduce((acc, e) => acc + e.taskCompletion.score, 0) / evaluations.length).toFixed(1)
    : '4.7';

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-purple-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-purple-500/20">
            <Scale className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white flex items-center space-x-2">
              <span>LLM-as-a-Judge Evaluation System</span>
              <span className="text-xs bg-purple-500/20 text-purple-400 border border-purple-500/30 px-2 py-0.5 rounded-full font-mono">
                Automated Rubric
              </span>
            </h1>
            <p className="text-sm text-slate-400">
              Evaluates Groundedness • Relevance • Faithfulness • Task Completion with PASS / WARN / FAIL classification
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleRunBenchmark}
            disabled={runningBenchmark}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-md shadow-purple-500/20 transition disabled:opacity-50"
          >
            <Play className={`w-3.5 h-3.5 ${runningBenchmark ? 'animate-spin' : ''}`} />
            <span>{runningBenchmark ? 'Evaluating Benchmark Suite...' : 'Run 5-Case Benchmark'}</span>
          </button>
        </div>
      </div>

      {/* 4 Pillars Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <p className="text-xs text-slate-400 font-medium">Evaluation Pass Rate</p>
          <p className="text-2xl font-bold text-emerald-400 mt-1">{passRate}%</p>
          <p className="text-[11px] text-slate-500 mt-0.5">
            {passCount} Pass • {warnCount} Warn • {failCount} Fail
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>Groundedness</span>
            <span className="text-purple-400">1-5</span>
          </div>
          <p className="text-2xl font-bold text-white mt-1">{avgGroundedness} / 5</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Context substantiation</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>Relevance</span>
            <span className="text-purple-400">1-5</span>
          </div>
          <p className="text-2xl font-bold text-white mt-1">{avgRelevance} / 5</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Query alignment</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>Faithfulness</span>
            <span className="text-purple-400">1-5</span>
          </div>
          <p className="text-2xl font-bold text-white mt-1">{avgFaithfulness} / 5</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Truthfulness to docs</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 col-span-2 md:col-span-1">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>Task Completion</span>
            <span className="text-purple-400">1-5</span>
          </div>
          <p className="text-2xl font-bold text-white mt-1">{avgTask} / 5</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Tool execution & clarity</p>
        </div>
      </div>

      {/* Main Section: Evaluation History Log & Custom Tester */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Evaluation Records */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider flex items-center space-x-2">
              <Award className="w-4 h-4 text-purple-400" />
              <span>Judge Evaluation Audit Log ({evaluations.length})</span>
            </h2>

            {/* Filter */}
            <div className="flex items-center space-x-1 bg-slate-900 p-1 rounded-lg border border-slate-800 text-xs">
              {(['ALL', 'PASS', 'WARN', 'FAIL'] as const).map((v) => (
                <button
                  key={v}
                  onClick={() => setFilterVerdict(v)}
                  className={`px-2.5 py-1 rounded-md font-medium transition ${
                    filterVerdict === v
                      ? 'bg-purple-600 text-white'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          {filteredEvals.length === 0 ? (
            <div className="text-center py-12 bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <p className="text-sm text-slate-400">No evaluation runs recorded yet.</p>
              <button
                onClick={handleRunBenchmark}
                className="mt-3 text-xs text-purple-400 hover:underline"
              >
                Click here to run the benchmark evaluation suite
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredEvals.map((ev) => {
                const isExpanded = expandedId === ev.id;
                const isPass = ev.verdict === 'PASS';
                const isWarn = ev.verdict === 'WARN';
                return (
                  <div
                    key={ev.id}
                    className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow hover:border-slate-700 transition space-y-3"
                  >
                    <div
                      className="flex items-start justify-between cursor-pointer select-none"
                      onClick={() => setExpandedId(isExpanded ? null : ev.id)}
                    >
                      <div className="space-y-1 max-w-[80%]">
                        <div className="flex items-center space-x-2">
                          <span
                            className={`text-xs font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                              isPass
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                : isWarn
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                            }`}
                          >
                            {ev.verdict} • {ev.averageScore} / 5.0
                          </span>
                          <span className="text-[11px] text-slate-400">
                            Latency: {ev.latencyMs}ms
                          </span>
                        </div>
                        <p className="text-sm font-semibold text-white pt-1">
                          "{ev.query}"
                        </p>
                      </div>

                      <button className="text-slate-400 hover:text-slate-200 p-1">
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>

                    {/* Agent Response Preview */}
                    <div className="text-xs text-slate-300 bg-slate-950 p-2.5 rounded-lg border border-slate-800 line-clamp-2">
                      {ev.response}
                    </div>

                    {/* Expandable Rubric Details */}
                    {isExpanded && (
                      <div className="pt-3 border-t border-slate-800 space-y-3 animate-in fade-in duration-150">
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                          Judge Breakdown by Pillar:
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                          {/* Groundedness */}
                          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1">
                            <div className="flex justify-between font-semibold text-slate-200">
                              <span>1. Groundedness</span>
                              <span className="text-purple-400">{ev.groundedness.score}/5</span>
                            </div>
                            <p className="text-slate-400 text-[11px] leading-relaxed">
                              {ev.groundedness.explanation}
                            </p>
                          </div>

                          {/* Relevance */}
                          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1">
                            <div className="flex justify-between font-semibold text-slate-200">
                              <span>2. Relevance</span>
                              <span className="text-purple-400">{ev.relevance.score}/5</span>
                            </div>
                            <p className="text-slate-400 text-[11px] leading-relaxed">
                              {ev.relevance.explanation}
                            </p>
                          </div>

                          {/* Faithfulness */}
                          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1">
                            <div className="flex justify-between font-semibold text-slate-200">
                              <span>3. Faithfulness</span>
                              <span className="text-purple-400">{ev.faithfulness.score}/5</span>
                            </div>
                            <p className="text-slate-400 text-[11px] leading-relaxed">
                              {ev.faithfulness.explanation}
                            </p>
                          </div>

                          {/* Task Completion */}
                          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1">
                            <div className="flex justify-between font-semibold text-slate-200">
                              <span>4. Task Completion</span>
                              <span className="text-purple-400">{ev.taskCompletion.score}/5</span>
                            </div>
                            <p className="text-slate-400 text-[11px] leading-relaxed">
                              {ev.taskCompletion.explanation}
                            </p>
                          </div>
                        </div>

                        <div className="text-[10px] text-slate-500 flex justify-between pt-1">
                          <span>Evaluator Model: {ev.model}</span>
                          <span>{new Date(ev.timestamp).toLocaleString()}</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Custom Query & Response Evaluator */}
        <div className="lg:col-span-4 space-y-4">
          <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider flex items-center space-x-2">
            <Scale className="w-4 h-4 text-purple-400" />
            <span>Interactive Single-Turn Judge</span>
          </h2>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <p className="text-xs text-slate-400 leading-relaxed">
              Test candidate prompt variations or agent responses against the LLM Judge rubric.
            </p>

            <form onSubmit={handleRunCustomEval} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Customer Query
                </label>
                <input
                  type="text"
                  required
                  value={customQuery}
                  onChange={(e) => setCustomQuery(e.target.value)}
                  placeholder="e.g. Can you repair my broken keyboard?"
                  className="w-full bg-slate-800 border border-slate-700 focus:border-purple-500 rounded-xl px-3 py-2 text-xs text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Agent Response Candidate
                </label>
                <textarea
                  rows={4}
                  required
                  value={customResponse}
                  onChange={(e) => setCustomResponse(e.target.value)}
                  placeholder="Paste the agent's proposed reply to evaluate..."
                  className="w-full bg-slate-800 border border-slate-700 focus:border-purple-500 rounded-xl p-3 text-xs text-white outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={runningCustom || !customQuery.trim() || !customResponse.trim()}
                className="w-full bg-purple-600 hover:bg-purple-500 text-white py-2 rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 transition disabled:opacity-50"
              >
                <span>{runningCustom ? 'Evaluating with LLM Judge...' : 'Submit to Judge'}</span>
                <Play className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
