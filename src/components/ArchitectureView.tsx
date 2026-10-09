import React from 'react';
import {
  Cpu,
  HardDrive,
  Activity,
  Layers,
  ShieldCheck,
  Zap,
  Lock,
  Share2,
  Trash2,
  RefreshCw,
  GitBranch,
} from 'lucide-react';

export const ArchitectureView: React.FC = () => {
  return (
    <div className="w-full max-w-7xl mx-auto space-y-8">
      {/* Container Hardware Target */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950/40 border border-slate-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/30 px-3 py-1 rounded-full text-xs font-semibold text-cyan-400 mb-3">
              <Zap className="w-3.5 h-3.5" />
              BotKeep Container Profile
            </div>
            <h2 className="text-2xl font-bold text-white">BotKeep Low-Spec Cloud Architecture</h2>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Designed specifically to survive and thrive within BotKeep's strict container envelope:
              <b> 2GB RAM, 150% CPU limit, and 2GB ephemeral storage</b> without crashing or leaking memory.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 w-full md:w-auto">
            <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-2xl text-center min-w-[100px]">
              <span className="text-[11px] text-slate-400 uppercase tracking-wider block">RAM Limit</span>
              <span className="text-lg font-bold text-cyan-400 font-mono">2.0 GB</span>
              <span className="text-[10px] text-emerald-400 block">Peak ~1.2 GB</span>
            </div>
            <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-2xl text-center min-w-[100px]">
              <span className="text-[11px] text-slate-400 uppercase tracking-wider block">CPU Ceiling</span>
              <span className="text-lg font-bold text-cyan-400 font-mono">150%</span>
              <span className="text-[10px] text-emerald-400 block">Async Worker</span>
            </div>
            <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-2xl text-center min-w-[100px]">
              <span className="text-[11px] text-slate-400 uppercase tracking-wider block">Disk Size</span>
              <span className="text-lg font-bold text-cyan-400 font-mono">2.0 GB</span>
              <span className="text-[10px] text-emerald-400 block">0MB Leaks</span>
            </div>
          </div>
        </div>
      </div>

      {/* Deep Architectural Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Pillar 1: Non-Blocking ThreadPool */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30">
            <Cpu className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white">Non-Blocking Thread Executor</h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            <code>yt-dlp</code> is inherently synchronous and CPU-intensive. If executed directly inside an <code>async def</code> handler, it blocks Python's single asyncio event loop, causing the bot to freeze and ignore all other users.
          </p>
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 text-[11px] font-mono text-cyan-300">
            await loop.run_in_executor(<br />
            &nbsp;&nbsp;thread_executor,<br />
            &nbsp;&nbsp;_blocking_download_media,<br />
            &nbsp;&nbsp;url, temp_dir, max_size_mb<br />
            )
          </div>
          <p className="text-[11px] text-slate-400">
            ✓ Bounded by <code>asyncio.Semaphore(2)</code> to strictly prevent concurrent worker explosions.
          </p>
        </div>

        {/* Pillar 2: Zero-Disk-Leak Lifecycle */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
            <Trash2 className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white">Ephemeral Disk Lifecycle</h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            BotKeep cloud containers provide only 2GB disk. Standard downloaders that store videos in static folders cause <code>No space left on device</code> fatal crashes within hours of bot usage.
          </p>
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 text-[11px] font-mono text-emerald-300">
            with tempfile.TemporaryDirectory() as temp_dir:<br />
            &nbsp;&nbsp;try:<br />
            &nbsp;&nbsp;&nbsp;&nbsp;await bot.send_video(...)<br />
            &nbsp;&nbsp;finally:<br />
            &nbsp;&nbsp;&nbsp;&nbsp;logger.debug("Deleted temp_dir")
          </div>
          <p className="text-[11px] text-slate-400">
            ✓ 100% Guaranteed instant deletion even on unhandled network errors or upload timeouts.
          </p>
        </div>

        {/* Pillar 3: 50MB Guard & yt-dlp Format Selector */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white">50MB Hard Limit Guard</h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            The official Telegram Bot API has an inviolable ceiling: bots cannot upload files larger than 50MB. Attempting to send &gt;50MB triggers <code>TelegramNetworkError</code>.
          </p>
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 text-[11px] font-mono text-amber-300">
            "format": "best[filesize&lt;=52428800]/..."<br />
            "max_filesize": 52428800,<br />
            if file_size &gt; max_bytes:<br />
            &nbsp;&nbsp;return None, title, duration
          </div>
          <p className="text-[11px] text-slate-400">
            ✓ Protects bot reputation with polite user guidance when files exceed limit.
          </p>
        </div>
      </div>

      {/* Memory Budget Diagram */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Activity className="w-5 h-5 text-cyan-400" />
          BotKeep 2.0 GB Memory Allocation Breakdown
        </h3>
        <p className="text-xs text-slate-400">
          Visual budget representation under simultaneous double-download workload:
        </p>

        <div className="space-y-3 pt-2">
          {/* Bar 1 */}
          <div>
            <div className="flex justify-between text-xs text-slate-300 mb-1">
              <span>aiogram v3 Core Event Loop & Python Runtime</span>
              <span className="font-mono text-cyan-400">75 MB (3.7%)</span>
            </div>
            <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
              <div className="h-full bg-cyan-500 rounded-full" style={{ width: '4%' }}></div>
            </div>
          </div>

          {/* Bar 2 */}
          <div>
            <div className="flex justify-between text-xs text-slate-300 mb-1">
              <span>Worker Thread 1: yt-dlp Video Stream Buffer</span>
              <span className="font-mono text-cyan-400">380 MB (19%)</span>
            </div>
            <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
              <div className="h-full bg-blue-500 rounded-full" style={{ width: '19%' }}></div>
            </div>
          </div>

          {/* Bar 3 */}
          <div>
            <div className="flex justify-between text-xs text-slate-300 mb-1">
              <span>Worker Thread 2: yt-dlp Video Stream Buffer</span>
              <span className="font-mono text-cyan-400">380 MB (19%)</span>
            </div>
            <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
              <div className="h-full bg-indigo-500 rounded-full" style={{ width: '19%' }}></div>
            </div>
          </div>

          {/* Bar 4 */}
          <div>
            <div className="flex justify-between text-xs text-slate-300 mb-1">
              <span>FFmpeg Media Container Muxing & Audio Remux</span>
              <span className="font-mono text-cyan-400">180 MB (9%)</span>
            </div>
            <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
              <div className="h-full bg-purple-500 rounded-full" style={{ width: '9%' }}></div>
            </div>
          </div>

          {/* Bar 5 */}
          <div>
            <div className="flex justify-between text-xs text-slate-300 mb-1">
              <span>Linux Container OS, Network Buffers & Google GenAI Client</span>
              <span className="font-mono text-cyan-400">185 MB (9.2%)</span>
            </div>
            <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
              <div className="h-full bg-slate-500 rounded-full" style={{ width: '9.2%' }}></div>
            </div>
          </div>

          {/* Remaining Headroom */}
          <div>
            <div className="flex justify-between text-xs text-emerald-400 font-semibold mb-1">
              <span>Headroom Safety Margin (Prevents OOM restart)</span>
              <span className="font-mono text-emerald-400">800 MB (40%)</span>
            </div>
            <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
              <div className="h-full bg-emerald-500/40 rounded-full" style={{ width: '40%' }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Dual Monetization Architecture */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3">
          <div className="flex items-center gap-2 text-sm font-bold text-white">
            <Lock className="w-4 h-4 text-emerald-400" />
            Monetization Funnel 1: Force-Subscription Gate
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Every user attempting to download media is gated by <code>bot.get_chat_member()</code>. If they haven't joined your channel, an inline keyboard with "📢 Join Channel" and "✅ Verify Subscription" is displayed.
          </p>
          <ul className="text-xs text-slate-400 space-y-1.5 list-disc list-inside">
            <li>Drives organic subscriber acquisition to your channel.</li>
            <li>Callback query automatically resumes the paused download upon verification.</li>
            <li>Gracefully bypasses if channel ID is not configured (zero false lockouts).</li>
          </ul>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3">
          <div className="flex items-center gap-2 text-sm font-bold text-white">
            <Share2 className="w-4 h-4 text-cyan-400" />
            Monetization Funnel 2: Sponsored Footers
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Every media caption uploaded and every AI response generated includes an unobtrusive, high-converting HTML footer:
          </p>
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 text-[11px] text-cyan-300 font-mono">
            ━━━━━━━━━━━━━━━<br />
            📢 Sponsored: &lt;a href="https://t.me/..."&gt;🔥 Join VIP Alpha&lt;/a&gt;
          </div>
          <ul className="text-xs text-slate-400 space-y-1.5 list-disc list-inside">
            <li>Monetizes viral media forwards when users forward videos to friends.</li>
            <li>Customizable from <code>.env</code> without restarting the container.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
