import React, { useState } from 'react';
import {
  Bot,
  MessageSquare,
  FileCode,
  Settings,
  Cpu,
  Rocket,
  Shield,
  ExternalLink,
  Download,
  Github,
  Zap,
} from 'lucide-react';
import { TelegramSimulator } from './components/TelegramSimulator';
import { CodeInspector } from './components/CodeInspector';
import { ConfigGenerator } from './components/ConfigGenerator';
import { ArchitectureView } from './components/ArchitectureView';
import { DeploymentWizard } from './components/DeploymentWizard';

type ActiveTab = 'simulator' | 'code' | 'config' | 'architecture' | 'deployment';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('simulator');

  const downloadAllZip = () => {
    // Download all key files sequentially
    const fileUrls = ['/bot.py', '/requirements.txt', '/.env.example', '/Dockerfile', '/Procfile', '/README.md'];
    fileUrls.forEach((name) => {
      const link = document.createElement('a');
      link.href = name;
      link.download = name.replace('/', '');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-black">
      {/* Top Global Navigation Bar */}
      <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">
          {/* Logo & Platform Info */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  OmniMedia Bot Architect
                </h1>
                <span className="hidden sm:inline-flex items-center text-[10px] bg-cyan-500/10 text-cyan-400 font-semibold px-2 py-0.5 rounded-full border border-cyan-500/30">
                  aiogram v3 • Gemini 2.5 Flash
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Production-Ready Telegram Downloader & AI Suite for BotKeep (2GB RAM)
              </p>
            </div>
          </div>

          {/* Quick Metrics / Action */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden lg:flex items-center gap-2 text-xs bg-slate-800/60 border border-slate-700/60 rounded-xl px-3 py-1.5 text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>BotKeep Ready: <b>2GB RAM / 50MB Guard</b></span>
            </div>

            <button
              onClick={() => setActiveTab('code')}
              className="py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow cursor-pointer"
            >
              <FileCode className="w-3.5 h-3.5 text-cyan-400" />
              <span>Get Python Code</span>
            </button>
          </div>
        </div>

        {/* Tab Strip */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex overflow-x-auto gap-1 border-t border-slate-800/60 py-1.5 scrollbar-none">
          <button
            onClick={() => setActiveTab('simulator')}
            className={`py-2 px-3.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all shrink-0 cursor-pointer ${
              activeTab === 'simulator'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <MessageSquare className="w-4 h-4 text-cyan-400" />
            <span>1. Live Telegram Simulator</span>
          </button>

          <button
            onClick={() => setActiveTab('code')}
            className={`py-2 px-3.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all shrink-0 cursor-pointer ${
              activeTab === 'code'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <FileCode className="w-4 h-4 text-emerald-400" />
            <span>2. Codebase & Files (bot.py)</span>
          </button>

          <button
            onClick={() => setActiveTab('config')}
            className={`py-2 px-3.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all shrink-0 cursor-pointer ${
              activeTab === 'config'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Settings className="w-4 h-4 text-amber-400" />
            <span>3. Config & .env Generator</span>
          </button>

          <button
            onClick={() => setActiveTab('architecture')}
            className={`py-2 px-3.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all shrink-0 cursor-pointer ${
              activeTab === 'architecture'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Cpu className="w-4 h-4 text-purple-400" />
            <span>4. BotKeep 2GB Architecture</span>
          </button>

          <button
            onClick={() => setActiveTab('deployment')}
            className={`py-2 px-3.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all shrink-0 cursor-pointer ${
              activeTab === 'deployment'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Rocket className="w-4 h-4 text-rose-400" />
            <span>5. BotKeep Deploy Wizard</span>
          </button>
        </div>
      </header>

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {activeTab === 'simulator' && <TelegramSimulator />}
        {activeTab === 'code' && <CodeInspector />}
        {activeTab === 'config' && <ConfigGenerator />}
        {activeTab === 'architecture' && <ArchitectureView />}
        {activeTab === 'deployment' && <DeploymentWizard />}
      </main>

      {/* Global Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-6 px-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
            <span className="text-slate-400">
              OmniMedia Telegram Bot Architecture • Engineered for <b>aiogram v3</b>, <b>yt-dlp</b>, and <b>Gemini 2.5 Flash</b>
            </span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <button
              onClick={() => setActiveTab('deployment')}
              className="hover:text-cyan-400 transition-colors cursor-pointer"
            >
              Deployment Guide
            </button>
            <button
              onClick={() => setActiveTab('architecture')}
              className="hover:text-cyan-400 transition-colors cursor-pointer"
            >
              Hardware Specs (2GB RAM)
            </button>
            <button
              onClick={() => setActiveTab('config')}
              className="hover:text-cyan-400 transition-colors cursor-pointer"
            >
              .env Builder
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
