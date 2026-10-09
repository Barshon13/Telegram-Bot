import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Bot,
  User,
  ShieldCheck,
  ExternalLink,
  Sparkles,
  Download,
  AlertTriangle,
  CheckCircle2,
  Lock,
  RefreshCw,
  Radio,
  FileVideo,
  Play,
  Share2,
  Trash2,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
  mediaCard?: {
    platform: string;
    title: string;
    sizeMb: number;
    duration: string;
    thumbnailUrl: string;
    sponsorText: string;
    sponsorUrl: string;
  };
  forceSubCard?: {
    inviteUrl: string;
    channelName: string;
    targetUrl: string;
  };
  isError?: boolean;
}

export const TelegramSimulator: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      sender: 'bot',
      text:
        `👋 <b>Welcome, Friend!</b>\n\n` +
        `⚡ <b>All-in-One Downloader & Gemini 2.5 AI Assistant</b>\n\n` +
        `📥 <b>Media Downloader:</b>\n` +
        `Send any public video or reel link from:\n` +
        `• YouTube / Shorts\n` +
        `• TikTok (Watermark-free)\n` +
        `• Instagram Reels / Posts\n` +
        `• Facebook Watch / Reels\n` +
        `• Twitter / X Videos\n\n` +
        `🧠 <b>AI Assistant Commands:</b>\n` +
        `• <code>/ask [question]</code> — Ask Gemini 2.5 Flash anything\n` +
        `• <code>/summarize [URL]</code> — Extract video summary & key insights\n` +
        `• Or simply text me directly to chat!\n\n` +
        `━━━━━━━━━━━━━━━\n📢 <i>Sponsored: <a href="https://t.me/telegram">🚀 Powered by BotKeep & Gemini AI</a></i>`,
      timestamp: '10:00 AM',
    },
  ]);

  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingStatus, setTypingStatus] = useState<string>('typing...');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [simulateLargeFile, setSimulateLargeFile] = useState(false);
  const [sponsorText, setSponsorText] = useState('🔥 Join VIP Signals & Alpha');
  const [sponsorUrl, setSponsorUrl] = useState('https://t.me/telegram');
  const [toastAlert, setToastAlert] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const triggerToast = (msg: string) => {
    setToastAlert(msg);
    setTimeout(() => setToastAlert(null), 3500);
  };

  const handleSend = async (customText?: string) => {
    const textToSend = (customText !== undefined ? customText : input).trim();
    if (!textToSend) return;

    if (customText === undefined) {
      setInput('');
    }

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Append User Message
    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: timeStr,
    };
    setMessages((prev) => [...prev, userMsg]);

    const isUrl = /(https?:\/\/[^\s]+)/gi.test(textToSend);
    const lower = textToSend.toLowerCase();

    // 1. /start command
    if (lower === '/start') {
      setIsTyping(true);
      setTypingStatus('bot is writing...');
      setTimeout(() => {
        setIsTyping(false);
        setMessages((prev) => [
          ...prev,
          {
            id: `bot-${Date.now()}`,
            sender: 'bot',
            text:
              `👋 <b>Welcome back!</b>\n\n` +
              `Send any video link (YouTube, TikTok, Reels, Shorts) or ask Gemini 2.5 Flash with <code>/ask</code>!\n\n` +
              `━━━━━━━━━━━━━━━\n📢 <i>Sponsored: <a href="${sponsorUrl}">${sponsorText}</a></i>`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      }, 500);
      return;
    }

    // 2. /help command
    if (lower === '/help') {
      setIsTyping(true);
      setTypingStatus('bot is writing...');
      setTimeout(() => {
        setIsTyping(false);
        setMessages((prev) => [
          ...prev,
          {
            id: `bot-${Date.now()}`,
            sender: 'bot',
            text:
              `📖 <b>OmniMedia Bot Help Guide:</b>\n\n` +
              `• <b>Download:</b> Simply paste a video link.\n` +
              `• <b>Ask AI:</b> <code>/ask [question]</code>\n` +
              `• <b>Summarize:</b> <code>/summarize [URL]</code>\n` +
              `• <b>Channel Gate:</b> You must join our channel if required.\n` +
              `• <b>File Size:</b> Capped strictly at 50MB (Telegram limit).\n\n` +
              `━━━━━━━━━━━━━━━\n📢 <i>Sponsored: <a href="${sponsorUrl}">${sponsorText}</a></i>`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      }, 500);
      return;
    }

    // 3. /summarize command
    if (lower.startsWith('/summarize')) {
      const urlPart = textToSend.replace(/\/summarize/i, '').trim();
      setIsTyping(true);
      setTypingStatus('🔍 extracting video insights & transcript...');

      try {
        const prompt = `Summarize this media content URL: "${urlPart || 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'}". Provide an executive TL;DR and 4 key bullet points takeaways. Format with Telegram HTML (<b>bold</b>, bullet points).`;
        const res = await fetch('/api/gemini/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt }),
        });
        const data = await res.json();
        setIsTyping(false);

        const reply =
          (data.reply || `<b>📑 Video Summary:</b> Key Trends in Media\n\n• Video explores viral distribution patterns\n• Outlines content retention strategies\n• Highlights audio algorithm shifts\n• Actionable tips for creator monetisation.`) +
          `\n\n━━━━━━━━━━━━━━━\n📢 <i>Sponsored: <a href="${sponsorUrl}">${sponsorText}</a></i>`;

        setMessages((prev) => [
          ...prev,
          {
            id: `bot-${Date.now()}`,
            sender: 'bot',
            text: reply,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      } catch {
        setIsTyping(false);
        setMessages((prev) => [
          ...prev,
          {
            id: `bot-${Date.now()}`,
            sender: 'bot',
            text: `📑 <b>Video Summary:</b> Video Breakdown\n\n• <b>TL;DR:</b> High engagement short-form content breakdown.\n• Analyzes optimal video hook in first 3 seconds.\n• Explains sound selection strategies.\n• Review of audio royalty metrics.\n\n━━━━━━━━━━━━━━━\n📢 <i>Sponsored: <a href="${sponsorUrl}">${sponsorText}</a></i>`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      }
      return;
    }

    // 4. Media Downloader Path (URL detected)
    if (isUrl) {
      // Check Force-Subscription Gate
      if (!isSubscribed) {
        setIsTyping(true);
        setTypingStatus('checking channel membership...');
        setTimeout(() => {
          setIsTyping(false);
          setMessages((prev) => [
            ...prev,
            {
              id: `bot-${Date.now()}`,
              sender: 'bot',
              text:
                `🔒 <b>Mandatory Subscription Required!</b>\n\n` +
                `To unlock unlimited high-speed downloads, please join our official channel below. ` +
                `Once joined, tap <b>Verify Subscription</b> to proceed.`,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              forceSubCard: {
                channelName: 'AlphaSignalsChannel',
                inviteUrl: sponsorUrl,
                targetUrl: textToSend,
              },
            },
          ]);
        }, 600);
        return;
      }

      // Check 50MB Size Simulation
      if (simulateLargeFile) {
        setIsTyping(true);
        setTypingStatus('⚡ downloading & checking file size...');
        setTimeout(() => {
          setIsTyping(false);
          setMessages((prev) => [
            ...prev,
            {
              id: `bot-${Date.now()}`,
              sender: 'bot',
              isError: true,
              text:
                `⚠️ <b>File Exceeds Telegram Limit</b>\n\n` +
                `Extracted media is <b>78.4 MB</b>. ` +
                `Telegram native bot API strictly caps video uploads at <b>50.0 MB</b>.\n\n` +
                `💡 <i>Tip: For long podcasts/videos, use /summarize to extract notes instead of downloading full video.</i>\n\n` +
                `━━━━━━━━━━━━━━━\n📢 <i>Sponsored: <a href="${sponsorUrl}">${sponsorText}</a></i>`,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            },
          ]);
        }, 1200);
        return;
      }

      // Successful Download Simulation
      setIsTyping(true);
      setTypingStatus('⏳ connecting to media stream...');

      setTimeout(() => {
        setTypingStatus('⚡ downloading media (<50MB) via yt-dlp...');
        setTimeout(() => {
          setTypingStatus('📤 uploading video to Telegram...');
          setTimeout(() => {
            setIsTyping(false);

            let platform = 'YouTube Shorts';
            if (textToSend.includes('tiktok')) platform = 'TikTok (No Watermark)';
            else if (textToSend.includes('instagram')) platform = 'Instagram Reel';
            else if (textToSend.includes('facebook') || textToSend.includes('fb.watch')) platform = 'Facebook Reel';
            else if (textToSend.includes('twitter') || textToSend.includes('x.com')) platform = 'X (Twitter) Video';

            setMessages((prev) => [
              ...prev,
              {
                id: `bot-${Date.now()}`,
                sender: 'bot',
                text:
                  `🎬 <b>Trending Viral Clip [Full HD]</b>\n` +
                  `📦 <b>Size:</b> 18.4 MB | ⏱️ <b>Duration:</b> 42s\n` +
                  `⚡ <i>Streamed via yt-dlp thread worker • Ephemeral temp cleaned</i>\n\n` +
                  `━━━━━━━━━━━━━━━\n📢 <i>Sponsored: <a href="${sponsorUrl}">${sponsorText}</a></i>`,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                mediaCard: {
                  platform,
                  title: 'Trending Viral Clip [Full HD]',
                  sizeMb: 18.4,
                  duration: '00:42',
                  thumbnailUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80',
                  sponsorText,
                  sponsorUrl,
                },
              },
            ]);
          }, 800);
        }, 1000);
      }, 700);
      return;
    }

    // 5. Conversational Gemini AI Path
    const queryPrompt = textToSend.replace(/\/ask/i, '').trim() || textToSend;
    setIsTyping(true);
    setTypingStatus('🧠 thinking with Gemini 2.5 Flash...');

    try {
      const res = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: queryPrompt }),
      });
      const data = await res.json();
      setIsTyping(false);

      const reply =
        (data.reply || `🤖 <b>Gemini 2.5 Flash:</b>\n\nThat's an insightful question! Under low-latency asynchronous processing, Gemini 2.5 Flash streams responses rapidly with high reasoning fidelity.`) +
        `\n\n━━━━━━━━━━━━━━━\n📢 <i>Sponsored: <a href="${sponsorUrl}">${sponsorText}</a></i>`;

      setMessages((prev) => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          sender: 'bot',
          text: reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } catch {
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          sender: 'bot',
          text:
            `🤖 <b>Gemini 2.5 Flash:</b>\n\n` +
            `I've analyzed your query: "<b>${queryPrompt}</b>".\n\n` +
            `• <b>High Efficiency:</b> Low memory footprint on BotKeep container.\n` +
            `• <b>Structured Answers:</b> Bullet points and bold headers for instant readability.\n` +
            `• <b>Real-time Engine:</b> Powered by Google AI Studio.\n\n` +
            `━━━━━━━━━━━━━━━\n📢 <i>Sponsored: <a href="${sponsorUrl}">${sponsorText}</a></i>`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }
  };

  const handleVerifyCallback = (card: { targetUrl: string }) => {
    if (!isSubscribed) {
      triggerToast('❌ You have not joined the channel yet! Please join first.');
      return;
    }

    triggerToast('✅ Verification successful! Resuming media download...');

    // Replace the force-sub card message with progress & download
    setIsTyping(true);
    setTypingStatus('⚡ verification confirmed! Starting yt-dlp download...');

    setTimeout(() => {
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          sender: 'bot',
          text:
            `✅ <b>Verification Confirmed!</b>\n\n` +
            `🎬 <b>Downloaded Video:</b> ${card.targetUrl}\n` +
            `📦 <b>Size:</b> 16.2 MB | ⏱️ <b>Duration:</b> 35s\n` +
            `⚡ <i>Streamed via yt-dlp thread worker • Ephemeral temp cleaned</i>\n\n` +
            `━━━━━━━━━━━━━━━\n📢 <i>Sponsored: <a href="${sponsorUrl}">${sponsorText}</a></i>`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          mediaCard: {
            platform: 'Media Stream',
            title: 'Verified Channel Media Download',
            sizeMb: 16.2,
            duration: '00:35',
            thumbnailUrl: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=600&auto=format&fit=crop&q=80',
            sponsorText,
            sponsorUrl,
          },
        },
      ]);
    }, 1200);
  };

  const clearChat = () => {
    setMessages([
      {
        id: 'reset-1',
        sender: 'bot',
        text: `🧹 <b>Chat cleared.</b> Send /start or any media link to begin!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 w-full max-w-7xl mx-auto">
      {/* Simulation Controls Sidebar */}
      <div className="w-full lg:w-80 flex-shrink-0 space-y-4">
        {/* State Control Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl backdrop-blur-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
              Simulator Controls
            </h3>
            <button
              onClick={clearChat}
              className="text-xs text-slate-400 hover:text-rose-400 flex items-center gap-1 transition-colors"
              title="Clear chat history"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Reset
            </button>
          </div>

          {/* Force Sub Gate Toggle */}
          <div className="mb-4 p-3 bg-slate-950/70 border border-slate-800/80 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                <Lock className={`w-3.5 h-3.5 ${isSubscribed ? 'text-emerald-400' : 'text-amber-400'}`} />
                Channel Subscription Gate:
              </span>
              <span
                className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                  isSubscribed ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-300'
                }`}
              >
                {isSubscribed ? 'Subscribed' : 'Not Joined'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Test how the bot blocks media downloads and displays the inline Join & Verify keyboard.
            </p>
            <button
              onClick={() => setIsSubscribed(!isSubscribed)}
              className={`w-full py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                isSubscribed
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30'
                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
              }`}
            >
              {isSubscribed ? 'Simulate User Unsubscribed' : 'Simulate User Subscribed'}
            </button>
          </div>

          {/* 50MB File Size Limit Toggle */}
          <div className="mb-4 p-3 bg-slate-950/70 border border-slate-800/80 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                <AlertTriangle className={`w-3.5 h-3.5 ${simulateLargeFile ? 'text-rose-400' : 'text-emerald-400'}`} />
                Simulated File Size:
              </span>
              <span
                className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                  simulateLargeFile ? 'bg-rose-500/20 text-rose-300' : 'bg-emerald-500/20 text-emerald-300'
                }`}
              >
                {simulateLargeFile ? '78.4 MB (>50MB)' : '18.4 MB (Pass)'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Telegram native bots reject files over 50MB. Toggle to test the size guard.
            </p>
            <button
              onClick={() => setSimulateLargeFile(!simulateLargeFile)}
              className="w-full py-2 px-3 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all cursor-pointer"
            >
              Toggle: {simulateLargeFile ? 'Normal (18.4 MB)' : 'Oversized (78.4 MB)'}
            </button>
          </div>

          {/* Quick Preset Actions */}
          <div className="space-y-2">
            <span className="text-xs font-medium text-slate-300 block">Quick Simulation Triggers:</span>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                onClick={() => handleSend('/start')}
                className="py-1.5 px-2 bg-slate-800/80 hover:bg-slate-700/80 text-cyan-300 rounded-lg text-[11px] font-mono text-left truncate transition-colors border border-slate-700/60"
              >
                /start
              </button>
              <button
                onClick={() => handleSend('/help')}
                className="py-1.5 px-2 bg-slate-800/80 hover:bg-slate-700/80 text-cyan-300 rounded-lg text-[11px] font-mono text-left truncate transition-colors border border-slate-700/60"
              >
                /help
              </button>
              <button
                onClick={() => handleSend('https://youtube.com/shorts/sample123')}
                className="py-1.5 px-2 bg-red-950/40 hover:bg-red-900/40 text-red-300 rounded-lg text-[11px] font-medium text-left truncate transition-colors border border-red-800/40 flex items-center gap-1"
              >
                <Play className="w-3 h-3 text-red-400 shrink-0" />
                YT Shorts
              </button>
              <button
                onClick={() => handleSend('https://tiktok.com/@creator/video/987654321')}
                className="py-1.5 px-2 bg-pink-950/40 hover:bg-pink-900/40 text-pink-300 rounded-lg text-[11px] font-medium text-left truncate transition-colors border border-pink-800/40 flex items-center gap-1"
              >
                <Download className="w-3 h-3 text-pink-400 shrink-0" />
                TikTok Video
              </button>
              <button
                onClick={() => handleSend('https://instagram.com/reel/C123456789/')}
                className="py-1.5 px-2 bg-purple-950/40 hover:bg-purple-900/40 text-purple-300 rounded-lg text-[11px] font-medium text-left truncate transition-colors border border-purple-800/40 flex items-center gap-1"
              >
                <FileVideo className="w-3 h-3 text-purple-400 shrink-0" />
                Instagram Reel
              </button>
              <button
                onClick={() => handleSend('/summarize https://youtu.be/dQw4w9WgXcQ')}
                className="py-1.5 px-2 bg-amber-950/40 hover:bg-amber-900/40 text-amber-300 rounded-lg text-[11px] font-mono text-left truncate transition-colors border border-amber-800/40 flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3 text-amber-400 shrink-0" />
                /summarize
              </button>
            </div>
          </div>
        </div>

        {/* Sponsor Customizer */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl backdrop-blur-sm space-y-3">
          <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Share2 className="w-3.5 h-3.5 text-cyan-400" />
            Monetization 2: Sponsor Footer
          </h4>
          <div>
            <label className="text-[11px] text-slate-400 block mb-1">Affiliate / Sponsor Slogan:</label>
            <input
              type="text"
              value={sponsorText}
              onChange={(e) => setSponsorText(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
            />
          </div>
          <div>
            <label className="text-[11px] text-slate-400 block mb-1">Affiliate Link:</label>
            <input
              type="text"
              value={sponsorUrl}
              onChange={(e) => setSponsorUrl(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>
      </div>

      {/* Main Telegram Chat Viewport */}
      <div className="flex-1 flex flex-col bg-[#0e1621] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden min-h-[640px] max-h-[760px] relative">
        {/* Telegram Top Bar */}
        <div className="bg-[#17212b] border-b border-slate-800/80 px-4 py-3 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center text-white shadow-md">
                <Bot className="w-5 h-5" />
              </div>
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-[#17212b] rounded-full"></span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-sm font-bold text-slate-100">OmniMedia Downloader</h2>
                <span className="text-[10px] bg-blue-500/20 text-blue-400 font-semibold px-1.5 py-0.2 rounded border border-blue-500/30">
                  BOT
                </span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 font-mono px-1.5 py-0.2 rounded">
                  aiogram v3
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {isTyping ? (
                  <span className="text-cyan-400 animate-pulse font-medium">{typingStatus}</span>
                ) : (
                  'online • yt-dlp & Gemini 2.5 Flash'
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="hidden sm:inline-flex items-center gap-1 bg-slate-800/70 px-2.5 py-1 rounded-full border border-slate-700/50">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
              50MB Telegram Guard Active
            </span>
          </div>
        </div>

        {/* Telegram Toast Alert for Callbacks */}
        {toastAlert && (
          <div className="absolute top-16 left-1/2 -translate-x-1/2 z-30 bg-slate-900/95 border border-cyan-500/50 text-cyan-200 text-xs px-4 py-2 rounded-xl shadow-2xl backdrop-blur-md flex items-center gap-2 animate-bounce">
            <AlertTriangle className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>{toastAlert}</span>
          </div>
        )}

        {/* Telegram Messages Scroll Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-[#0e1621] to-[#121c27]">
          {messages.map((msg) => {
            const isBot = msg.sender === 'bot';

            return (
              <div key={msg.id} className={`flex ${isBot ? 'justify-start' : 'justify-end'}`}>
                <div
                  className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-3.5 text-xs sm:text-sm leading-relaxed shadow-md ${
                    isBot
                      ? msg.isError
                        ? 'bg-[#2b1720] border border-rose-800/60 text-rose-200'
                        : 'bg-[#182533] border border-slate-700/60 text-slate-200'
                      : 'bg-[#2b5278] border border-blue-600/40 text-white'
                  }`}
                >
                  {/* HTML Formatted Telegram Content */}
                  <div
                    className="whitespace-pre-wrap break-words prose prose-invert prose-xs max-w-none [&_b]:font-semibold [&_b]:text-white [&_code]:bg-black/30 [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-cyan-300 [&_a]:text-cyan-400 [&_a]:underline"
                    dangerouslySetInnerHTML={{ __html: msg.text }}
                  />

                  {/* Force-Sub Gating Card with Inline Buttons */}
                  {msg.forceSubCard && (
                    <div className="mt-3 pt-3 border-t border-slate-700/60 space-y-2">
                      <div className="flex items-center justify-between text-[11px] text-amber-300 font-medium">
                        <span className="flex items-center gap-1">
                          <Lock className="w-3 h-3 text-amber-400" />
                          Gate Status: Membership Required
                        </span>
                        <span className="text-slate-400">@AlphaSignals</span>
                      </div>

                      <div className="space-y-1.5 pt-1">
                        <a
                          href={msg.forceSubCard.inviteUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="w-full py-2 px-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium text-xs flex items-center justify-center gap-1.5 shadow transition-colors"
                        >
                          📢 Join Our Official Channel
                          <ExternalLink className="w-3 h-3" />
                        </a>
                        <button
                          onClick={() => handleVerifyCallback(msg.forceSubCard!)}
                          className="w-full py-2 px-3 bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-emerald-500/40 rounded-lg font-semibold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          ✅ Verify Subscription
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Media Downloaded Card */}
                  {msg.mediaCard && (
                    <div className="mt-3 pt-3 border-t border-slate-700/60">
                      <div className="rounded-xl overflow-hidden bg-slate-950/80 border border-slate-800">
                        <div className="relative aspect-video w-full bg-slate-900 overflow-hidden">
                          <img
                            src={msg.mediaCard.thumbnailUrl}
                            alt="Video Thumbnail"
                            className="w-full h-full object-cover opacity-90 hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-2.5 justify-between">
                            <span className="text-[11px] font-mono bg-black/60 backdrop-blur-sm text-white px-2 py-0.5 rounded">
                              {msg.mediaCard.duration}
                            </span>
                            <span className="text-[10px] font-bold bg-cyan-600 text-white px-2 py-0.5 rounded shadow">
                              {msg.mediaCard.platform}
                            </span>
                          </div>
                        </div>
                        <div className="p-2.5 flex items-center justify-between text-xs text-slate-300">
                          <span className="font-medium truncate max-w-[180px]">{msg.mediaCard.title}</span>
                          <span className="text-[11px] text-cyan-400 font-mono">{msg.mediaCard.sizeMb} MB</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Message Timestamp */}
                  <div
                    className={`text-[10px] text-right mt-1.5 ${
                      isBot ? 'text-slate-400' : 'text-blue-200/80'
                    }`}
                  >
                    {msg.timestamp}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-[#182533] border border-slate-700/50 rounded-2xl px-4 py-3 text-xs text-cyan-300 flex items-center gap-2 shadow">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-cyan-400" />
                <span>{typingStatus}</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Telegram Input Bar */}
        <div className="bg-[#17212b] border-t border-slate-800/80 p-3 flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSend();
            }}
            placeholder="Send /ask, /summarize, or paste a video link..."
            className="flex-1 bg-[#0e1621] border border-slate-700/70 focus:border-cyan-500 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-200 placeholder-slate-500 focus:outline-none transition-colors"
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim()}
            className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white flex items-center justify-center transition-all shadow-md cursor-pointer"
            title="Send Message"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
