import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  Users,
  CheckCircle,
  AlertTriangle,
  Clock,
  Star,
  Activity,
  Layers,
  ArrowUpRight,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import { AnalyticsMetrics } from '../types';

export const AnalyticsDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<AnalyticsMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchMetrics = async () => {
    try {
      const res = await fetch('/api/analytics');
      const data = await res.json();
      if (data.metrics) {
        setMetrics(data.metrics);
      }
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white flex items-center space-x-2">
              <span>Customer Support Operations & AI Analytics</span>
              <span className="text-xs bg-blue-500/20 text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded-full font-mono">
                Live Telemetry
              </span>
            </h1>
            <p className="text-sm text-slate-400">
              Autonomous Deflection Rate • Resolution Latency • CSAT Satisfaction • Escalation Trends
            </p>
          </div>
        </div>

        <button
          onClick={fetchMetrics}
          className="flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Metrics</span>
        </button>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* KPI 1 */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>AI Deflection Rate</span>
            <span className="text-emerald-400 flex items-center font-mono">
              <TrendingUp className="w-3.5 h-3.5 mr-0.5" /> +4.2%
            </span>
          </div>
          <p className="text-3xl font-extrabold text-white mt-2">
            {metrics?.aiDeflectionRate || 87.5}%
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Inquiries resolved without human intervention
          </p>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all"
              style={{ width: `${metrics?.aiDeflectionRate || 87.5}%` }}
            />
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Customer CSAT Score</span>
            <span className="text-amber-400 flex items-center font-mono">
              <Star className="w-3.5 h-3.5 mr-0.5 fill-amber-400" /> 4.82/5
            </span>
          </div>
          <p className="text-3xl font-extrabold text-white mt-2">
            {metrics?.averageCsat || 4.82}
            <span className="text-sm font-normal text-slate-500"> / 5.0</span>
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Based on post-resolution feedback
          </p>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-amber-400 h-full rounded-full transition-all"
              style={{ width: '96.4%' }}
            />
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Average Agent Latency</span>
            <span className="text-cyan-400 font-mono">P95: 780ms</span>
          </div>
          <p className="text-3xl font-extrabold text-white mt-2">
            {metrics?.averageResponseTimeMs || 460}
            <span className="text-sm font-normal text-slate-500"> ms</span>
          </p>
          <p className="text-xs text-slate-400 mt-1">
            RAG retrieval + Gemini 3.8 inference
          </p>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-cyan-500 h-full rounded-full transition-all"
              style={{ width: '85%' }}
            />
          </div>
        </div>

        {/* KPI 4 */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Human Escalations</span>
            <span className="text-rose-400 font-mono">
              {metrics?.humanEscalationRate || 12.5}%
            </span>
          </div>
          <p className="text-3xl font-extrabold text-white mt-2">
            {metrics?.activeEscalationsCount || 0}
            <span className="text-sm font-normal text-slate-500"> active</span>
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Currently in Tier 2 Specialist Queue
          </p>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-rose-500 h-full rounded-full transition-all"
              style={{ width: `${metrics?.humanEscalationRate || 12.5}%` }}
            />
          </div>
        </div>
      </div>

      {/* Two Column Layout: Daily Resolution Volume + Topic Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Daily Resolution Chart */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white">Weekly Resolution Breakdown</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Comparison of AI Autonomous Resolution vs Human Escalated Handling
              </p>
            </div>
            <div className="flex items-center space-x-3 text-xs">
              <span className="flex items-center space-x-1.5 text-cyan-400">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 inline-block" />
                <span>AI Resolved</span>
              </span>
              <span className="flex items-center space-x-1.5 text-rose-400">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
                <span>Human Handled</span>
              </span>
            </div>
          </div>

          {/* Bar Chart Representation */}
          <div className="space-y-4 pt-2">
            {metrics?.dailyVolume.map((item, idx) => {
              const total = item.aiResolved + item.humanHandled;
              const aiPct = (item.aiResolved / total) * 100;
              const humanPct = (item.humanHandled / total) * 100;

              return (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs text-slate-300">
                    <span className="font-semibold">{item.date}</span>
                    <span className="text-slate-400 text-[11px]">
                      {item.aiResolved} AI ({aiPct.toFixed(0)}%) • {item.humanHandled} Human ({humanPct.toFixed(0)}%)
                    </span>
                  </div>
                  <div className="flex h-3 rounded-full overflow-hidden bg-slate-800">
                    <div
                      style={{ width: `${aiPct}%` }}
                      className="bg-cyan-500 h-full transition-all"
                    />
                    <div
                      style={{ width: `${humanPct}%` }}
                      className="bg-rose-500 h-full transition-all"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Intent Topic Distribution */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
          <div>
            <h2 className="text-base font-bold text-white">Customer Inquiry Categorization</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Natural language intent clustering from customer chat sessions
            </p>
          </div>

          <div className="space-y-4">
            {metrics?.queryTopics.map((top, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="font-medium text-slate-200">{top.topic}</span>
                  <span className="text-cyan-400 font-mono font-bold">{top.percentage}%</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-cyan-400 h-full rounded-full"
                    style={{ width: `${top.percentage}%` }}
                  />
                </div>
                <p className="text-[11px] text-slate-500">
                  {top.count} recorded sessions this week
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
