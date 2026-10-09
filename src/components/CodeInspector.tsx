import React, { useState, useEffect } from 'react';
import {
  FileCode,
  Copy,
  Check,
  Download,
  Search,
  FileText,
  Boxes,
  Terminal,
  ShieldAlert,
  Server,
  Layers,
} from 'lucide-react';
import { INITIAL_FILES, ProjectFile } from '../data/codeFiles';

export const CodeInspector: React.FC = () => {
  const [files, setFiles] = useState<ProjectFile[]>(INITIAL_FILES);
  const [activeFileName, setActiveFileName] = useState<string>('bot.py');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  // Sync with /api/files if available
  useEffect(() => {
    fetch('/api/files')
      .then((res) => res.json())
      .then((data) => {
        if (data.files && Array.isArray(data.files) && data.files.length > 0) {
          setFiles((prev) =>
            prev.map((f) => {
              const remote = data.files.find((rf: any) => rf.name === f.name);
              return remote && remote.content ? { ...f, content: remote.content } : f;
            })
          );
        }
      })
      .catch((err) => console.log('Loaded local fallback code files', err));
  }, []);

  const activeFile = files.find((f) => f.name === activeFileName) || files[0];

  const handleCopy = () => {
    navigator.clipboard.writeText(activeFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadFile = () => {
    const blob = new Blob([activeFile.content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = activeFile.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDownloadAll = () => {
    files.forEach((file) => {
      const blob = new Blob([file.content], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = file.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    });
  };

  const lines = activeFile.content.split('\n');
  const filteredLines = searchQuery
    ? lines.map((line, idx) => ({ line, idx, matches: line.toLowerCase().includes(searchQuery.toLowerCase()) }))
    : lines.map((line, idx) => ({ line, idx, matches: true }));

  const lineCount = lines.length;
  const byteCount = new Blob([activeFile.content]).size;

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* Top Action Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
              <FileCode className="w-5 h-5 text-cyan-400" />
              Production Codebase Inspector
            </h2>
            <span className="text-xs bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 px-2 py-0.5 rounded-full font-mono">
              Python 3.10+ / aiogram v3
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Complete, un-truncated production files tested for BotKeep low-spec cloud containers (2GB RAM / 150% CPU / 2GB disk).
          </p>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <button
            onClick={handleCopy}
            className="flex-1 md:flex-initial py-2 px-3.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer shadow"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-slate-400" />}
            {copied ? 'Copied to Clipboard!' : `Copy ${activeFile.name}`}
          </button>
          <button
            onClick={handleDownloadFile}
            className="flex-1 md:flex-initial py-2 px-3.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer shadow"
          >
            <Download className="w-4 h-4" />
            Download File
          </button>
          <button
            onClick={handleDownloadAll}
            className="hidden sm:flex py-2 px-3.5 bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-xl text-xs font-semibold items-center justify-center gap-2 transition-all cursor-pointer"
            title="Download all files in this project"
          >
            <Boxes className="w-4 h-4 text-cyan-400" />
            Download All
          </button>
        </div>
      </div>

      {/* File Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-2">
        {files.map((file) => {
          const isActive = file.name === activeFileName;
          return (
            <button
              key={file.name}
              onClick={() => {
                setActiveFileName(file.name);
                setSearchQuery('');
              }}
              className={`py-2 px-4 rounded-xl text-xs font-medium flex items-center gap-2 transition-all cursor-pointer ${
                isActive
                  ? 'bg-cyan-600/20 text-cyan-300 border border-cyan-500/50 shadow-sm'
                  : 'bg-slate-900/60 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {file.name === 'bot.py' && <Terminal className="w-3.5 h-3.5 text-cyan-400" />}
              {file.name === 'requirements.txt' && <Layers className="w-3.5 h-3.5 text-emerald-400" />}
              {file.name === '.env.example' && <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />}
              {file.name === 'Dockerfile' && <Server className="w-3.5 h-3.5 text-blue-400" />}
              {file.name === 'Procfile' && <FileText className="w-3.5 h-3.5 text-purple-400" />}
              {file.name === 'README.md' && <FileText className="w-3.5 h-3.5 text-pink-400" />}
              <span>{file.name}</span>
            </button>
          );
        })}
      </div>

      {/* Active File Metadata & Search Banner */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <span className="bg-slate-800 px-2.5 py-1 rounded-md text-slate-300 font-mono text-[11px]">
            {activeFile.badge}
          </span>
          <span className="text-slate-400 hidden sm:inline">{activeFile.description}</span>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-56">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search in file..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none"
            />
          </div>
          <div className="text-[11px] text-slate-400 font-mono shrink-0">
            {lineCount} lines • {(byteCount / 1024).toFixed(1)} KB
          </div>
        </div>
      </div>

      {/* Code Viewer Viewport */}
      <div className="bg-[#0b1017] border border-slate-800 rounded-2xl overflow-hidden shadow-2xl relative">
        <div className="flex items-center justify-between px-4 py-2.5 bg-[#101722] border-b border-slate-800/80 text-xs text-slate-400 font-mono">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80"></span>
            </div>
            <span className="ml-2 text-slate-300 font-semibold">{activeFile.name}</span>
          </div>
          <span className="text-slate-500 uppercase tracking-widest text-[10px]">
            {activeFile.language}
          </span>
        </div>

        <div className="overflow-x-auto max-h-[600px] p-4 font-mono text-xs text-slate-200 leading-relaxed scrollbar-thin scrollbar-thumb-slate-700">
          <pre className="table w-full">
            <code>
              {filteredLines.map(({ line, idx, matches }) => {
                if (!matches && searchQuery) return null;
                return (
                  <div
                    key={idx}
                    className={`table-row hover:bg-slate-800/40 transition-colors ${
                      searchQuery && matches ? 'bg-cyan-950/40' : ''
                    }`}
                  >
                    <span className="table-cell pr-4 text-right text-slate-600 select-none w-10 text-[11px]">
                      {idx + 1}
                    </span>
                    <span className="table-cell whitespace-pre font-normal text-slate-200">
                      {line || ' '}
                    </span>
                  </div>
                );
              })}
            </code>
          </pre>
        </div>
      </div>
    </div>
  );
};
