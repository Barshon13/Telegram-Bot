import React, { useState } from 'react';
import {
  Rocket,
  CheckCircle2,
  Circle,
  Copy,
  Check,
  ExternalLink,
  Terminal,
  ShieldCheck,
  Server,
  Key,
} from 'lucide-react';

export const DeploymentWizard: React.FC = () => {
  const [completedSteps, setCompletedSteps] = useState<number[]>([1]);
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);

  const toggleStep = (stepNum: number) => {
    if (completedSteps.includes(stepNum)) {
      setCompletedSteps(completedSteps.filter((s) => s !== stepNum));
    } else {
      setCompletedSteps([...completedSteps, stepNum]);
    }
  };

  const copyCommand = (cmd: string, id: string) => {
    navigator.clipboard.writeText(cmd);
    setCopiedCmd(id);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Rocket className="w-5 h-5 text-cyan-400" />
            Interactive BotKeep Cloud Deployment Guide
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Follow this step-by-step checklist to deploy your Telegram bot 24/7 on BotKeep cloud containers.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Progress:</span>
          <span className="text-xs font-bold text-cyan-400 bg-cyan-500/10 border border-cyan-500/30 px-2.5 py-1 rounded-full">
            {completedSteps.length} / 6 Completed
          </span>
        </div>
      </div>

      {/* Steps List */}
      <div className="space-y-4">
        {/* Step 1: Telegram BotFather */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-md">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <button
                onClick={() => toggleStep(1)}
                className="mt-0.5 text-cyan-400 hover:text-cyan-300 cursor-pointer"
              >
                {completedSteps.includes(1) ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                ) : (
                  <Circle className="w-5 h-5 text-slate-600" />
                )}
              </button>
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  Step 1: Create Telegram Bot & Token via @BotFather
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Open Telegram and search for the official <code>@BotFather</code>. Send <code>/newbot</code> and follow instructions to name your bot.
                </p>
              </div>
            </div>
            <a
              href="https://t.me/BotFather"
              target="_blank"
              rel="noreferrer"
              className="py-1 px-2.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 rounded-lg text-xs font-medium flex items-center gap-1 shrink-0"
            >
              Open @BotFather <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="mt-3 ml-8 p-3 bg-slate-950 rounded-xl border border-slate-800/80 text-xs text-slate-300 space-y-1">
            <p>1. Send: <code>/newbot</code></p>
            <p>2. Bot Name: <code>OmniMedia Downloader & Assistant</code></p>
            <p>3. Bot Username: <code>MyOmniMedia_bot</code> (must end in "bot")</p>
            <p>4. Save the HTTP API Token to your <code>.env</code> file under <code>BOT_TOKEN</code>.</p>
          </div>
        </div>

        {/* Step 2: Channel Administrator Setup */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-md">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <button
                onClick={() => toggleStep(2)}
                className="mt-0.5 text-cyan-400 hover:text-cyan-300 cursor-pointer"
              >
                {completedSteps.includes(2) ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                ) : (
                  <Circle className="w-5 h-5 text-slate-600" />
                )}
              </button>
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  Step 2: Add Bot as Administrator to Force-Subscription Channel
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  To check user memberships, Telegram requires the bot to be an Administrator in your channel.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-3 ml-8 p-3 bg-slate-950 rounded-xl border border-slate-800/80 text-xs text-slate-300 space-y-1.5">
            <p>1. Open your channel settings &gt; <b>Administrators</b> &gt; <b>Add Administrator</b>.</p>
            <p>2. Search for your bot's username and add it with permission: <b>Invite Users via Link</b>.</p>
            <p>
              3. Retrieve your numeric channel ID (starts with <code>-100...</code>). You can forward any post to{' '}
              <a href="https://t.me/userinfobot" target="_blank" rel="noreferrer" className="text-cyan-400 underline">
                @userinfobot
              </a>{' '}
              to obtain the channel ID.
            </p>
          </div>
        </div>

        {/* Step 3: Google AI Studio Key */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-md">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <button
                onClick={() => toggleStep(3)}
                className="mt-0.5 text-cyan-400 hover:text-cyan-300 cursor-pointer"
              >
                {completedSteps.includes(3) ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                ) : (
                  <Circle className="w-5 h-5 text-slate-600" />
                )}
              </button>
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  Step 3: Generate Gemini 2.5 Flash API Key
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Empower your bot with video metadata summarization and smart Q&A via Google AI Studio.
                </p>
              </div>
            </div>
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noreferrer"
              className="py-1 px-2.5 bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/30 rounded-lg text-xs font-medium flex items-center gap-1 shrink-0"
            >
              Get Gemini Key <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="mt-3 ml-8 p-3 bg-slate-950 rounded-xl border border-slate-800/80 text-xs text-slate-300 space-y-1">
            <p>1. Go to Google AI Studio and click <b>Create API Key</b>.</p>
            <p>2. Copy the key string and assign it to <code>GEMINI_API_KEY</code>.</p>
          </div>
        </div>

        {/* Step 4: GitHub Repo Init */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-md">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <button
                onClick={() => toggleStep(4)}
                className="mt-0.5 text-cyan-400 hover:text-cyan-300 cursor-pointer"
              >
                {completedSteps.includes(4) ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                ) : (
                  <Circle className="w-5 h-5 text-slate-600" />
                )}
              </button>
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  Step 4: Initialize GitHub Repository & Push Code
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Push your repository to GitHub so BotKeep can continuously deploy it.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-3 ml-8 p-3 bg-slate-950 rounded-xl border border-slate-800/80 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-mono text-[11px]">Git Initialization Commands:</span>
              <button
                onClick={() =>
                  copyCommand(
                    'git init -b main\ngit add .\ngit commit -m "feat: initial production commit for OmniMedia Telegram Bot"\ngit remote add origin https://github.com/YOUR_USERNAME/omni-media-bot.git\ngit push -u origin main',
                    'git'
                  )
                }
                className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 text-[11px]"
              >
                {copiedCmd === 'git' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                {copiedCmd === 'git' ? 'Copied!' : 'Copy Commands'}
              </button>
            </div>
            <pre className="font-mono text-[11px] text-slate-300 leading-relaxed overflow-x-auto whitespace-pre">
              git init -b main{'\n'}
              git add .{'\n'}
              git commit -m "feat: initial production commit for OmniMedia Telegram Bot"{'\n'}
              git remote add origin https://github.com/YOUR_USERNAME/omni-media-bot.git{'\n'}
              git push -u origin main
            </pre>
          </div>
        </div>

        {/* Step 5: BotKeep Cloud Container Deploy */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-md">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <button
                onClick={() => toggleStep(5)}
                className="mt-0.5 text-cyan-400 hover:text-cyan-300 cursor-pointer"
              >
                {completedSteps.includes(5) ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                ) : (
                  <Circle className="w-5 h-5 text-slate-600" />
                )}
              </button>
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  Step 5: Deploy on BotKeep Cloud Container
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Create a new container on BotKeep and connect your GitHub repository.
                </p>
              </div>
            </div>
            <a
              href="https://botkeep.com"
              target="_blank"
              rel="noreferrer"
              className="py-1 px-2.5 bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/30 rounded-lg text-xs font-medium flex items-center gap-1 shrink-0"
            >
              Open BotKeep <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="mt-3 ml-8 p-3 bg-slate-950 rounded-xl border border-slate-800/80 text-xs text-slate-300 space-y-2">
            <p>1. Log in to <b>BotKeep Dashboard</b> &gt; Click <b>+ Create Container / Bot</b>.</p>
            <p>2. Select <b>Import from GitHub</b> &gt; choose your <code>omni-media-bot</code> repository.</p>
            <p>3. Select <b>Docker</b> runtime (BotKeep will automatically detect our provided <code>Dockerfile</code> with FFmpeg).</p>
            <p>4. Add your Environment Variables in the <b>Container Secrets</b> panel:</p>
            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-[11px] text-slate-300 border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-500">
                    <th className="py-1 pr-4">Key</th>
                    <th className="py-1 pr-4">Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900">
                  <tr><td className="py-1 text-cyan-400">BOT_TOKEN</td><td>Your Telegram Bot Token</td></tr>
                  <tr><td className="py-1 text-cyan-400">GEMINI_API_KEY</td><td>Your Google AI Studio Key</td></tr>
                  <tr><td className="py-1 text-cyan-400">FORCE_CHANNEL_ID</td><td>-100xxxxxxxxxx</td></tr>
                  <tr><td className="py-1 text-cyan-400">MAX_CONCURRENT_DOWNLOADS</td><td>2 (Honors 2GB RAM budget)</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Step 6: Verify Live Polling */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-md">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <button
                onClick={() => toggleStep(6)}
                className="mt-0.5 text-cyan-400 hover:text-cyan-300 cursor-pointer"
              >
                {completedSteps.includes(6) ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                ) : (
                  <Circle className="w-5 h-5 text-slate-600" />
                )}
              </button>
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  Step 6: Inspect Container Logs & Test Live on Telegram
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Verify clean startup and test media downloading.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-3 ml-8 p-3 bg-slate-950 rounded-xl border border-slate-800/80 text-xs text-slate-300 space-y-1.5">
            <p className="text-slate-400">You should see the following in BotKeep console output:</p>
            <div className="p-2 bg-black/60 rounded-lg font-mono text-[11px] text-emerald-400">
              [INFO] | OmniMediaBot | Google GenAI client initialized with model: gemini-2.5-flash<br />
              [INFO] | OmniMediaBot | Bot verified: @MyOmniMedia_bot (ID: 7123456789)<br />
              [INFO] | OmniMediaBot | Starting polling loop with concurrency limit 2...
            </div>
            <p className="text-slate-400 pt-1">
              🎉 Open Telegram, message your bot <code>/start</code>, and test downloading any YouTube Short or TikTok!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
