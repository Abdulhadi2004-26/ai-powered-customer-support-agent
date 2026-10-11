import React, { useState, useEffect } from 'react';
import {
  Code2,
  Download,
  FolderTree,
  FileCode,
  Copy,
  Check,
  Terminal,
  Layers,
  Cpu,
  Database,
  ExternalLink,
  BookOpen,
} from 'lucide-react';
import JSZip from 'jszip';
import { RepoFile, PYTHON_PROJECT_FILES } from '../../server/pythonRepo';

export const ArchitectureAndCodeHub: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<RepoFile>(PYTHON_PROJECT_FILES[0]);
  const [copied, setCopied] = useState(false);
  const [downloadingZip, setDownloadingZip] = useState(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(selectedFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadZip = async () => {
    setDownloadingZip(true);
    try {
      const zip = new JSZip();

      // Add all files into the zip
      for (const file of PYTHON_PROJECT_FILES) {
        zip.file(file.path, file.content);
      }

      // Add .gitignore
      zip.file(
        '.gitignore',
        `__pycache__/
*.py[cod]
*$py.class
.env
.venv
env/
venv/
.pytest_cache/
.coverage
htmlcov/
postgres_data/
*.log
`
      );

      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'ai-customer-support-agent-python-edition.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to create ZIP:', err);
    } finally {
      setDownloadingZip(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
            <Code2 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white flex items-center space-x-2">
              <span>Python, FastAPI & Docker Enterprise Architecture</span>
              <span className="text-xs bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 px-2 py-0.5 rounded-full font-mono">
                Production Artifacts
              </span>
            </h1>
            <p className="text-sm text-slate-400">
              FastAPI • PostgreSQL pgvector • LangChain RAG • Pytest Test Suites • Docker Compose
            </p>
          </div>
        </div>

        <button
          onClick={handleDownloadZip}
          disabled={downloadingZip}
          className="flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-500/25 transition disabled:opacity-50"
        >
          <Download className={`w-4 h-4 ${downloadingZip ? 'animate-bounce' : ''}`} />
          <span>{downloadingZip ? 'Packaging Zip...' : 'Download Full Python Repo (.ZIP)'}</span>
        </button>
      </div>

      {/* Architecture Breakdown Diagram & Workflow */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <h2 className="text-base font-bold text-white flex items-center space-x-2">
          <Cpu className="w-5 h-5 text-cyan-400" />
          <span>End-to-End System Workflow & Component Architecture</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2">
          {/* Step 1 */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center space-x-2 text-cyan-400 text-xs font-bold font-mono">
              <span className="w-5 h-5 rounded-full bg-cyan-500/20 flex items-center justify-center">1</span>
              <span>RAG INGESTION</span>
            </div>
            <p className="text-xs text-slate-300 font-semibold">Recursive Text Chunking & Embeddings</p>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              PDFs and Markdown policies are chunked (450 chars with 60 chars overlap) and projected into dense vector embeddings stored in PostgreSQL pgvector.
            </p>
          </div>

          {/* Step 2 */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center space-x-2 text-emerald-400 text-xs font-bold font-mono">
              <span className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center">2</span>
              <span>AUTONOMOUS AGENT</span>
            </div>
            <p className="text-xs text-slate-300 font-semibold">Tool Calling & Policy Grounding</p>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Customer queries invoke tools (<code>check_order_status</code>, <code>search_product_catalog</code>, <code>create_support_ticket</code>) or ground answers strictly in retrieved chunks.
            </p>
          </div>

          {/* Step 3 */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center space-x-2 text-amber-400 text-xs font-bold font-mono">
              <span className="w-5 h-5 rounded-full bg-amber-500/20 flex items-center justify-center">3</span>
              <span>GUARDRAIL HANDOFF</span>
            </div>
            <p className="text-xs text-slate-300 font-semibold">Tier 2 Human Escalation</p>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              If confidence drops below threshold (0.65), information is missing, or customer expresses anger/dispute, session immediately transfers to a live Human Specialist.
            </p>
          </div>

          {/* Step 4 */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center space-x-2 text-purple-400 text-xs font-bold font-mono">
              <span className="w-5 h-5 rounded-full bg-purple-500/20 flex items-center justify-center">4</span>
              <span>LLM-AS-A-JUDGE</span>
            </div>
            <p className="text-xs text-slate-300 font-semibold">Continuous Quality Evaluation</p>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Every turn is scored across 4 pillars (Groundedness, Relevance, Faithfulness, Task Completion) with 1-5 ratings and classified as PASS, WARN, or FAIL.
            </p>
          </div>
        </div>
      </div>

      {/* Code Browser Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* File Tree on Left */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3">
          <div className="flex items-center justify-between px-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            <span className="flex items-center space-x-1.5">
              <FolderTree className="w-4 h-4 text-cyan-400" />
              <span>Project Repository</span>
            </span>
            <span className="text-[10px] font-mono text-slate-500">{PYTHON_PROJECT_FILES.length} Files</span>
          </div>

          <div className="space-y-1">
            {PYTHON_PROJECT_FILES.map((f) => {
              const isSelected = f.path === selectedFile.path;
              return (
                <button
                  key={f.path}
                  onClick={() => setSelectedFile(f)}
                  className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-mono transition flex items-center justify-between ${
                    isSelected
                      ? 'bg-blue-600/20 text-cyan-300 border border-cyan-500/40 shadow'
                      : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                  }`}
                >
                  <div className="flex items-center space-x-2 truncate">
                    <FileCode
                      className={`w-4 h-4 shrink-0 ${
                        f.category === 'backend'
                          ? 'text-cyan-400'
                          : f.category === 'docker'
                          ? 'text-blue-400'
                          : f.category === 'tests'
                          ? 'text-emerald-400'
                          : 'text-purple-400'
                      }`}
                    />
                    <span className="truncate">{f.path}</span>
                  </div>
                  <span className="text-[10px] uppercase font-sans text-slate-500 shrink-0">
                    {f.category}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Description Box */}
          <div className="mt-4 p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs space-y-1">
            <p className="font-semibold text-slate-200">About {selectedFile.filename}:</p>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              {selectedFile.description}
            </p>
          </div>
        </div>

        {/* Code Viewer on Right */}
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden flex flex-col h-[650px]">
          {/* Header */}
          <div className="bg-slate-800/90 border-b border-slate-700 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Terminal className="w-4 h-4 text-cyan-400" />
              <span className="font-mono text-xs font-semibold text-white">
                {selectedFile.path}
              </span>
            </div>
            <button
              onClick={handleCopyCode}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 bg-slate-700 hover:bg-slate-600 transition"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Code'}</span>
            </button>
          </div>

          {/* Code text */}
          <div className="flex-1 overflow-auto p-4 bg-slate-950 font-mono text-xs text-slate-200 leading-relaxed">
            <pre className="whitespace-pre-wrap">{selectedFile.content}</pre>
          </div>
        </div>
      </div>
    </div>
  );
};
