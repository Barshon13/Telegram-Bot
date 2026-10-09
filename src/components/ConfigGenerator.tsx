import React, { useState } from 'react';
import {
  Settings,
  Copy,
  Check,
  Download,
  AlertCircle,
  CheckCircle,
  HelpCircle,
  Sparkles,
  Lock,
  Share2,
  Cpu,
} from 'lucide-react';

export const ConfigGenerator: React.FC = () => {
  const [botToken, setBotToken] = useState('7123456789:AAHabcdef1234567890abcdef123456789');
  const [geminiKey, setGeminiKey] = useState('AIzaSyExampleKeyFromGoogleAIStudio123');
  const [geminiModel, setGeminiModel] = useState('gemini-2.5-flash');
  const [channelId, setChannelId] = useState('-1001987654321');
  const [channelUsername, setChannelUsername] = useState('MyOfficialChannel');
  const [channelInvite, setChannelInvite] = useState('https://t.me/MyOfficialChannel');
  const [sponsorText, setSponsorText] = useState('🔥 Join VIP Signals & Alpha');
  const [sponsorUrl, setSponsorUrl] = useState('https://t.me/MyOfficialChannel');
  const [maxSizeMb, setMaxSizeMb] = useState('50');
  const [concurrency, setConcurrency] = useState('2');
  const [logLevel, setLogLevel] = useState('INFO');
  const [copied, setCopied] = useState(false);

  // Validation checks
  const isBotTokenValid = /^\d{8,11}:[A-Za-z0-9_-]{35}$/.test(botToken.trim());
  const isChannelIdValid = channelId.trim().startsWith('-100');
  const isConcurrencySafe = parseInt(concurrency) <= 3;

  const generatedEnvContent = `# ==============================================================================
# Environment Configuration for OmniMedia Telegram Bot
# Generated via OmniMedia Bot Architect
# ==============================================================================

# Telegram Bot Token (from @BotFather)
BOT_TOKEN="${botToken.trim()}"

# Google AI Studio API Key (from https://aistudio.google.com/app/apikey)
GEMINI_API_KEY="${geminiKey.trim()}"

# Gemini Model Selection
GEMINI_MODEL="${geminiModel}"

# Monetization 1: Force Subscription Gate Settings
FORCE_CHANNEL_ID="${channelId.trim()}"
FORCE_CHANNEL_USERNAME="${channelUsername.trim().replace(/^@/, '')}"
FORCE_CHANNEL_INVITE_LINK="${channelInvite.trim()}"

# Monetization 2: Sponsored Affiliate Footer Settings
SPONSOR_TEXT="${sponsorText.trim()}"
SPONSOR_URL="${sponsorUrl.trim()}"

# BotKeep Container Resource & Rate Limit Optimization
MAX_FILE_SIZE_MB=${maxSizeMb || '50'}
MAX_CONCURRENT_DOWNLOADS=${concurrency || '2'}
LOG_LEVEL="${logLevel}"
`;

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedEnvContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([generatedEnvContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = '.env';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Settings className="w-5 h-5 text-cyan-400" />
            Interactive Environment & .env Builder
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Configure your Telegram tokens, channel gate IDs, and Gemini parameters with real-time syntax checking.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="py-2 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer shadow"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-slate-400" />}
            {copied ? 'Copied .env!' : 'Copy .env File'}
          </button>
          <button
            onClick={handleDownload}
            className="py-2 px-4 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer shadow"
          >
            <Download className="w-4 h-4" />
            Download .env
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form Inputs */}
        <div className="lg:col-span-7 space-y-5">
          {/* Section 1: Telegram Credentials */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-md space-y-4">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
              1. Telegram Bot Token
            </h3>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-medium text-slate-300">BOT_TOKEN:</label>
                {isBotTokenValid ? (
                  <span className="text-[11px] text-emerald-400 flex items-center gap-1 font-medium">
                    <CheckCircle className="w-3 h-3" /> Valid Token Pattern
                  </span>
                ) : (
                  <span className="text-[11px] text-amber-400 flex items-center gap-1 font-medium">
                    <AlertCircle className="w-3 h-3" /> Format: 123456789:ABC...
                  </span>
                )}
              </div>
              <input
                type="text"
                value={botToken}
                onChange={(e) => setBotToken(e.target.value)}
                placeholder="1234567890:ABCdefGHIjklMNOpqrsTUVwxyz1234567890"
                className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 font-mono focus:outline-none"
              />
              <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                <HelpCircle className="w-3 h-3 text-slate-400" />
                Obtain this from @BotFather on Telegram by sending <code>/newbot</code>.
              </p>
            </div>
          </div>

          {/* Section 2: Gemini AI Engine */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-md space-y-4">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              2. Google Gemini AI Engine
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">GEMINI_API_KEY:</label>
                <input
                  type="text"
                  value={geminiKey}
                  onChange={(e) => setGeminiKey(e.target.value)}
                  placeholder="AIzaSy..."
                  className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl px-3.5 py-2 text-xs text-slate-200 font-mono focus:outline-none"
                />
                <p className="text-[11px] text-slate-500 mt-1">Get free key at aistudio.google.com/app/apikey</p>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">GEMINI_MODEL:</label>
                <select
                  value={geminiModel}
                  onChange={(e) => setGeminiModel(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none"
                >
                  <option value="gemini-2.5-flash">gemini-2.5-flash (Recommended)</option>
                  <option value="gemini-3.8-flash">gemini-3.8-flash (Latest Default)</option>
                  <option value="gemini-3.1-flash-lite">gemini-3.1-flash-lite (Ultra Fast)</option>
                </select>
                <p className="text-[11px] text-slate-500 mt-1">Optimized for low-latency Q&A and TL;DR summarization</p>
              </div>
            </div>
          </div>

          {/* Section 3: Force-Sub Channel Gate */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-md space-y-4">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Lock className="w-4 h-4 text-emerald-400" />
              3. Monetization 1: Force-Subscription Gate
            </h3>

            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-medium text-slate-300">FORCE_CHANNEL_ID:</label>
                  {isChannelIdValid ? (
                    <span className="text-[11px] text-emerald-400 font-medium">Valid Channel ID (-100 prefix)</span>
                  ) : (
                    <span className="text-[11px] text-amber-400 font-medium">
                      ⚠️ Must start with -100 (e.g. -1001234567890)
                    </span>
                  )}
                </div>
                <input
                  type="text"
                  value={channelId}
                  onChange={(e) => setChannelId(e.target.value)}
                  placeholder="-1001987654321"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl px-3.5 py-2 text-xs text-slate-200 font-mono focus:outline-none"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  <b>Critical:</b> The bot must be added to this channel as an Administrator!
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">Channel Username:</label>
                  <input
                    type="text"
                    value={channelUsername}
                    onChange={(e) => setChannelUsername(e.target.value)}
                    placeholder="MyOfficialChannel"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">Invite URL Link:</label>
                  <input
                    type="text"
                    value={channelInvite}
                    onChange={(e) => setChannelInvite(e.target.value)}
                    placeholder="https://t.me/MyOfficialChannel"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Sponsored Footers & Resource Budget */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-md space-y-4">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Share2 className="w-4 h-4 text-purple-400" />
              4. Monetization 2 & BotKeep Budget
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">SPONSOR_TEXT:</label>
                <input
                  type="text"
                  value={sponsorText}
                  onChange={(e) => setSponsorText(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">SPONSOR_URL:</label>
                <input
                  type="text"
                  value={sponsorUrl}
                  onChange={(e) => setSponsorUrl(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">MAX_FILE_SIZE_MB:</label>
                <input
                  type="number"
                  value={maxSizeMb}
                  onChange={(e) => setMaxSizeMb(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl px-3 py-2 text-xs text-slate-200 font-mono focus:outline-none"
                />
                <span className="text-[10px] text-slate-500">Max 50 for Telegram</span>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">CONCURRENCY:</label>
                <input
                  type="number"
                  value={concurrency}
                  onChange={(e) => setConcurrency(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl px-3 py-2 text-xs text-slate-200 font-mono focus:outline-none"
                />
                <span
                  className={`text-[10px] ${
                    isConcurrencySafe ? 'text-emerald-400' : 'text-rose-400 font-semibold'
                  }`}
                >
                  {isConcurrencySafe ? 'Safe for 2GB RAM' : 'Risk of OOM crash!'}
                </span>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">LOG_LEVEL:</label>
                <select
                  value={logLevel}
                  onChange={(e) => setLogLevel(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none"
                >
                  <option value="INFO">INFO</option>
                  <option value="DEBUG">DEBUG</option>
                  <option value="WARNING">WARNING</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Live .env File Output */}
        <div className="lg:col-span-5 flex flex-col">
          <div className="bg-[#0b1017] border border-slate-800 rounded-2xl flex-1 flex flex-col overflow-hidden shadow-2xl">
            <div className="bg-[#101722] border-b border-slate-800/80 px-4 py-3 flex items-center justify-between text-xs text-slate-300 font-mono">
              <span className="font-semibold text-cyan-400 flex items-center gap-2">
                <Cpu className="w-4 h-4 text-cyan-400" />
                Live Generated .env Output
              </span>
              <span className="text-slate-500 text-[11px]">UTF-8</span>
            </div>

            <div className="flex-1 p-4 font-mono text-xs text-slate-300 leading-relaxed overflow-x-auto whitespace-pre bg-slate-950">
              {generatedEnvContent}
            </div>

            <div className="p-4 bg-[#101722] border-t border-slate-800/80 flex gap-2">
              <button
                onClick={handleCopy}
                className="flex-1 py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer shadow"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-slate-400" />}
                {copied ? 'Copied!' : 'Copy to Clipboard'}
              </button>
              <button
                onClick={handleDownload}
                className="flex-1 py-2.5 px-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer shadow"
              >
                <Download className="w-4 h-4" />
                Save .env File
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
