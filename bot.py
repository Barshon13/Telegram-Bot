"""
All-in-One Social Media Downloader & Gemini AI Assistant Telegram Bot
======================================================================
Architecture:
- Async Framework: aiogram v3 (Dispatcher, Router, F-filters, Callbacks)
- Media Engine: yt-dlp wrapped in ThreadPoolExecutor (non-blocking)
- AI Engine: google-genai SDK (Gemini 2.5 Flash via Google AI Studio)
- Host Environment: BotKeep cloud container (Linux, 2GB RAM / 150% CPU, 2GB disk)
- Storage Lifecycle: Ephemeral tempfile.TemporaryDirectory() with try...finally guarantee
- Monetization Gates: Force-Subscription Verification & Sponsored Footers
"""

import asyncio
import glob
import logging
import os
import re
import sys
import tempfile
from concurrent.futures import ThreadPoolExecutor
from dataclasses import dataclass
from typing import Optional, Tuple

import yt_dlp
from aiogram import Bot, Dispatcher, F, Router
from aiogram.client.default import DefaultBotProperties
from aiogram.enums import ChatMemberStatus, ParseMode
from aiogram.exceptions import TelegramBadRequest, TelegramRetryAfter
from aiogram.filters import Command, CommandStart
from aiogram.types import (
    CallbackQuery,
    FSInputFile,
    InlineKeyboardButton,
    InlineKeyboardMarkup,
    Message,
)
from dotenv import load_dotenv
from google import genai
from google.genai import types as genai_types

# ==============================================================================
# 1. CONFIGURATION & ENVIRONMENT VALIDATION
# ==============================================================================

load_dotenv()


@dataclass(frozen=True)
class Config:
    BOT_TOKEN: str = os.getenv("BOT_TOKEN", "")
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    GEMINI_MODEL: str = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
    FORCE_CHANNEL_ID: str = os.getenv("FORCE_CHANNEL_ID", "")
    FORCE_CHANNEL_USERNAME: str = os.getenv("FORCE_CHANNEL_USERNAME", "")
    FORCE_CHANNEL_INVITE_LINK: str = os.getenv("FORCE_CHANNEL_INVITE_LINK", "")
    SPONSOR_TEXT: str = os.getenv("SPONSOR_TEXT", "🚀 Powered by BotKeep & Gemini AI")
    SPONSOR_URL: str = os.getenv("SPONSOR_URL", "https://t.me/telegram")
    MAX_FILE_SIZE_MB: int = int(os.getenv("MAX_FILE_SIZE_MB", "50"))
    MAX_CONCURRENT_DOWNLOADS: int = int(os.getenv("MAX_CONCURRENT_DOWNLOADS", "2"))
    LOG_LEVEL: str = os.getenv("LOG_LEVEL", "INFO")


cfg = Config()

logging.basicConfig(
    level=getattr(logging, cfg.LOG_LEVEL.upper(), logging.INFO),
    format="%(asctime)s | [%(levelname)s] | %(name)s | %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)],
)
logger = logging.getLogger("OmniMediaBot")

# Startup assertion check
if not cfg.BOT_TOKEN:
    logger.critical("BOT_TOKEN is missing in environment variables. Bot cannot start.")
    sys.exit(1)

# Concurrency semaphore & thread pool to strictly honor BotKeep 2GB RAM / 150% CPU limit
download_semaphore = asyncio.Semaphore(cfg.MAX_CONCURRENT_DOWNLOADS)
thread_executor = ThreadPoolExecutor(
    max_workers=cfg.MAX_CONCURRENT_DOWNLOADS,
    thread_name_prefix="ytdlp_worker",
)

# Initialize Google GenAI client if key is present
ai_client: Optional[genai.Client] = None
if cfg.GEMINI_API_KEY:
    try:
        ai_client = genai.Client(api_key=cfg.GEMINI_API_KEY)
        logger.info("Google GenAI client initialized with model: %s", cfg.GEMINI_MODEL)
    except Exception as exc:
        logger.error("Failed to initialize Google GenAI client: %s", exc)
else:
    logger.warning("GEMINI_API_KEY not configured. AI companion will run in fallback mode.")


# ==============================================================================
# 2. URL DETECTION PATTERNS
# ==============================================================================

URL_REGEX = re.compile(
    r"(https?://(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|"
    r"www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|"
    r"https?://[^\s]+)"
)

SUPPORTED_MEDIA_DOMAINS = (
    "youtube.com",
    "youtu.be",
    "tiktok.com",
    "instagram.com",
    "facebook.com",
    "fb.watch",
    "twitter.com",
    "x.com",
    "threads.net",
    "reddit.com",
    "vimeo.com",
    "pinterest.com",
)


def extract_media_url(text: str) -> Optional[str]:
    """Scan message text and extract supported media URL."""
    if not text:
        return None
    matches = URL_REGEX.findall(text)
    for url in matches:
        lower_url = url.lower()
        if any(domain in lower_url for domain in SUPPORTED_MEDIA_DOMAINS):
            return url.strip()
    return None


# ==============================================================================
# 3. MONETIZATION GATES (FORCE-SUB & SPONSORED FOOTERS)
# ==============================================================================

async def is_user_subscribed(bot: Bot, user_id: int) -> bool:
    """
    Check if user is a member of the mandatory channel.
    If channel ID is not configured, bypass gate.
    """
    if not cfg.FORCE_CHANNEL_ID:
        return True

    try:
        channel_id_val = int(cfg.FORCE_CHANNEL_ID)
    except ValueError:
        channel_id_val = cfg.FORCE_CHANNEL_ID  # type: ignore

    try:
        member = await bot.get_chat_member(chat_id=channel_id_val, user_id=user_id)
        valid_statuses = {
            ChatMemberStatus.MEMBER,
            ChatMemberStatus.ADMINISTRATOR,
            ChatMemberStatus.CREATOR,
            ChatMemberStatus.RESTRICTED,
        }
        return member.status in valid_statuses
    except TelegramBadRequest as exc:
        logger.warning("Failed to verify membership for user %s: %s", user_id, exc)
        # If bot is not admin in the channel or channel not found, allow pass-through to prevent lockouts
        return True
    except Exception as exc:
        logger.error("Unexpected error in membership verification: %s", exc)
        return True


def get_force_sub_keyboard(payload: str = "check") -> InlineKeyboardMarkup:
    """Build the interactive Join + Verify inline keyboard."""
    invite_link = cfg.FORCE_CHANNEL_INVITE_LINK or (
        f"https://t.me/{cfg.FORCE_CHANNEL_USERNAME.lstrip('@')}"
        if cfg.FORCE_CHANNEL_USERNAME
        else "https://t.me"
    )

    buttons = [
        [InlineKeyboardButton(text="📢 Join Our Official Channel", url=invite_link)],
        [
            InlineKeyboardButton(
                text="✅ Verify Subscription",
                callback_data=f"verify:{payload[:40]}",
            )
        ],
    ]
    return InlineKeyboardMarkup(inline_keyboard=buttons)


def format_sponsor_footer() -> str:
    """Create sponsor footer for video captions and AI responses."""
    if not cfg.SPONSOR_TEXT:
        return ""
    url = cfg.SPONSOR_URL or "https://t.me"
    return f"\n\n━━━━━━━━━━━━━━━\n📢 <i>Sponsored: <a href=\"{url}\">{cfg.SPONSOR_TEXT}</a></i>"


# ==============================================================================
# 4. MEDIA ENGINE (YT-DLP WITH THREADPOOL & EPHEMERAL DISK CLEANUP)
# ==============================================================================

def _blocking_download_media(url: str, temp_dir: str, max_size_mb: int) -> Tuple[Optional[str], Optional[str], Optional[int]]:
    """
    Synchronous worker executed in ThreadPoolExecutor to prevent blocking aiogram event loop.
    Strictly constraints resolution and filesize to respect BotKeep 2GB disk & Telegram 50MB limit.
    """
    max_bytes = max_size_mb * 1024 * 1024
    outtmpl = os.path.join(temp_dir, "%(id)s.%(ext)s")

    # Format selector: Prioritize best mp4 video under Telegram 50MB limit
    ydl_opts = {
        "outtmpl": outtmpl,
        "format": f"best[filesize<={max_bytes}]/bestvideo[filesize<={int(max_bytes * 0.8)}]+bestaudio/best",
        "max_filesize": max_bytes,
        "merge_output_format": "mp4",
        "noplaylist": True,
        "quiet": True,
        "no_warnings": True,
        "nocheckcertificate": True,
        "ignoreerrors": False,
        "socket_timeout": 30,
        "retries": 3,
        # Restrict memory-heavy post-processing
        "postprocessors": [
            {
                "key": "FFmpegVideoConvertor",
                "preferedformat": "mp4",
            }
        ],
    }

    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=True)
            if not info:
                return None, None, None

            title = info.get("title", "Media Download")
            duration = info.get("duration", 0)

            # Find generated file in temp directory
            downloaded_files = glob.glob(os.path.join(temp_dir, "*.*"))
            if not downloaded_files:
                return None, title, duration

            # Pick largest/target media file
            chosen_file = max(downloaded_files, key=os.path.getsize)
            file_size = os.path.getsize(chosen_file)

            if file_size > max_bytes:
                logger.warning("Downloaded file size (%d bytes) exceeds %d MB limit", file_size, max_size_mb)
                return None, title, duration

            return chosen_file, title, duration
    except yt_dlp.utils.DownloadError as err:
        logger.warning("yt-dlp download error for %s: %s", url, err)
        return None, None, None
    except Exception as exc:
        logger.error("Unexpected error in yt-dlp execution: %s", exc)
        return None, None, None


def _blocking_extract_metadata(url: str) -> Optional[dict]:
    """Extract metadata and description/transcript for AI summarization."""
    ydl_opts = {
        "skip_download": True,
        "quiet": True,
        "no_warnings": True,
        "nocheckcertificate": True,
        "socket_timeout": 20,
    }
    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            return ydl.extract_info(url, download=False)
    except Exception as exc:
        logger.warning("Failed to extract metadata for summarizer: %s", exc)
        return None


async def download_media_async(url: str, temp_dir: str) -> Tuple[Optional[str], Optional[str], Optional[int]]:
    """Non-blocking async wrapper with concurrency semaphore."""
    async with download_semaphore:
        loop = asyncio.get_running_loop()
        return await loop.run_in_executor(
            thread_executor,
            _blocking_download_media,
            url,
            temp_dir,
            cfg.MAX_FILE_SIZE_MB,
        )


async def extract_metadata_async(url: str) -> Optional[dict]:
    """Non-blocking metadata extraction wrapper."""
    loop = asyncio.get_running_loop()
    return await loop.run_in_executor(thread_executor, _blocking_extract_metadata, url)


# ==============================================================================
# 5. AI ENGINE (GOOGLE-GENAI GEMINI 2.5 FLASH)
# ==============================================================================

async def ask_gemini(prompt: str, system_instruction: Optional[str] = None) -> str:
    """Generate concise, intelligent response using official Google GenAI SDK."""
    if not ai_client:
        return (
            "🤖 <b>AI Companion Offline</b>\n\n"
            "The Gemini API key is not configured on this instance. "
            "Please provide a valid <code>GEMINI_API_KEY</code> in the bot configuration."
        )

    try:
        config = genai_types.GenerateContentConfig(
            temperature=0.7,
            max_output_tokens=1000,
            system_instruction=system_instruction
            or (
                "You are an ultra-smart, helpful, concise AI companion embedded in an All-in-One "
                "Telegram Bot. Answer clearly using readable Telegram HTML formatting (<b>bold</b>, "
                "<code>code</code>, bullet points). Keep answers direct and well-structured."
            ),
        )

        # Non-blocking executor for SDK call
        loop = asyncio.get_running_loop()
        response = await loop.run_in_executor(
            thread_executor,
            lambda: ai_client.models.generate_content(
                model=cfg.GEMINI_MODEL,
                contents=prompt,
                config=config,
            ),
        )

        reply_text = response.text or "I could not generate an answer for that query."
        return reply_text.strip()
    except Exception as exc:
        logger.error("Gemini API call failed: %s", exc)
        return (
            "⚠️ <b>AI Processing Notice</b>\n"
            "An error occurred while communicating with Gemini 2.5 Flash. "
            "Please try again in a few moments."
        )


# ==============================================================================
# 6. ROUTERS & MESSAGE HANDLERS
# ==============================================================================

router = Router(name="main_router")


@router.message(CommandStart())
async def handle_start(message: Message):
    """Handle /start command with rich greeting and monetization teaser."""
    user_name = message.from_user.first_name if message.from_user else "Friend"
    welcome_msg = (
        f"👋 <b>Welcome, {user_name}!</b>\n\n"
        "⚡ <b>All-in-One Downloader & Gemini 2.5 AI Assistant</b>\n\n"
        "📥 <b>Media Downloader:</b>\n"
        "Send any public video or reel link from:\n"
        "• YouTube / Shorts\n"
        "• TikTok (Watermark-free)\n"
        "• Instagram Reels / Posts\n"
        "• Facebook Watch / Reels\n"
        "• Twitter / X Videos\n\n"
        "🧠 <b>AI Assistant Commands:</b>\n"
        "• <code>/ask [question]</code> — Ask Gemini 2.5 Flash anything\n"
        "• <code>/summarize [URL]</code> — Extract video summary & key insights\n"
        "• Or simply text me directly to chat!\n"
        f"{format_sponsor_footer()}"
    )
    await message.answer(welcome_msg, parse_mode=ParseMode.HTML, disable_web_page_preview=True)


@router.message(Command("help"))
async def handle_help(message: Message):
    """Provide command usage and support details."""
    help_text = (
        "📖 <b>Bot Usage & Capabilities Guide</b>\n\n"
        "<b>1. Downloading Videos:</b>\n"
        "Simply paste any supported link directly into chat. The bot will automatically "
        "download and stream the video back to you under the 50MB limit.\n\n"
        "<b>2. Gemini AI Companion:</b>\n"
        "• <code>/ask What are smart contracts?</code>\n"
        "• <code>/summarize https://youtu.be/...</code>\n"
        "• Send plain text questions anytime.\n\n"
        "<b>3. Monetization & Channel Access:</b>\n"
        "If the channel gate is active, you must subscribe to our official channel before "
        "media processing begins.\n"
        f"{format_sponsor_footer()}"
    )
    await message.answer(help_text, parse_mode=ParseMode.HTML, disable_web_page_preview=True)


@router.message(Command("ask"))
async def handle_ask_command(message: Message):
    """Handle /ask command for Gemini query."""
    user_prompt = message.text.replace("/ask", "", 1).strip() if message.text else ""
    if not user_prompt:
        await message.reply(
            "💡 <b>Usage:</b> <code>/ask [your question]</code>\n"
            "<i>Example: /ask Explain quantum computing in 3 bullets</i>",
            parse_mode=ParseMode.HTML,
        )
        return

    status_msg = await message.reply("🧠 <i>Consulting Gemini 2.5 Flash...</i>", parse_mode=ParseMode.HTML)
    ai_response = await ask_gemini(user_prompt)
    final_output = f"{ai_response}{format_sponsor_footer()}"

    await status_msg.edit_text(final_output, parse_mode=ParseMode.HTML, disable_web_page_preview=True)


@router.message(Command("summarize"))
async def handle_summarize_command(message: Message):
    """Extract metadata and summarize content via Gemini 2.5 Flash."""
    text_content = message.text.replace("/summarize", "", 1).strip() if message.text else ""
    target_url = extract_media_url(text_content)

    if not target_url:
        await message.reply(
            "📹 <b>Usage:</b> <code>/summarize [URL]</code>\n"
            "<i>Example: /summarize https://www.youtube.com/watch?v=...</i>",
            parse_mode=ParseMode.HTML,
        )
        return

    status_msg = await message.reply("🔍 <i>Extracting video metadata & insights...</i>", parse_mode=ParseMode.HTML)
    info = await extract_metadata_async(target_url)

    if not info:
        await status_msg.edit_text("❌ Could not extract video information for summarization. Ensure the URL is public.")
        return

    title = info.get("title", "Untitled Video")
    description = info.get("description", "")[:2500]  # Cap token usage
    uploader = info.get("uploader", "Unknown Creator")
    duration = info.get("duration", 0)

    summary_prompt = (
        f"Please provide an executive summary and 4 key bullet point takeaways for this video:\n\n"
        f"Title: {title}\n"
        f"Creator: {uploader}\n"
        f"Duration: {duration}s\n"
        f"Description/Content:\n{description}"
    )

    ai_summary = await ask_gemini(
        summary_prompt,
        system_instruction="You are a senior analyst summarizing media. Provide a catchy TL;DR followed by 4 concise bullet points."
    )

    formatted_msg = (
        f"📑 <b>Video Summary:</b> {title}\n"
        f"👤 <b>Creator:</b> {uploader}\n\n"
        f"{ai_summary}"
        f"{format_sponsor_footer()}"
    )
    await status_msg.edit_text(formatted_msg, parse_mode=ParseMode.HTML, disable_web_page_preview=True)


# ==============================================================================
# 7. DOWNLOADER WORKFLOW & SUB-VERIFY CALLBACK
# ==============================================================================

async def process_media_download(bot: Bot, chat_id: int, user_id: int, url: str, status_msg: Message):
    """
    Core download lifecycle:
    1. Checks Force-Sub gate
    2. Creates clean temporary directory
    3. Runs yt-dlp in threadpool
    4. Streams video to Telegram
    5. try...finally ensures 100% ephemeral cleanup on 2GB disk
    """
    # Force-Subscription Gate Check
    is_subbed = await is_user_subscribed(bot, user_id)
    if not is_subbed:
        await status_msg.edit_text(
            "🔒 <b>Mandatory Subscription Required!</b>\n\n"
            "To unlock unlimited high-speed downloads, please join our official channel below. "
            "Once joined, tap <b>Verify Subscription</b> to proceed.",
            parse_mode=ParseMode.HTML,
            reply_markup=get_force_sub_keyboard(payload=url),
        )
        return

    # Update status
    await status_msg.edit_text("⏳ <i>Connecting to media stream...</i>", parse_mode=ParseMode.HTML)

    # Ephemeral Temp Directory with guaranteed cleanup
    with tempfile.TemporaryDirectory(prefix="bot_media_") as temp_dir:
        try:
            await status_msg.edit_text("⚡ <i>Downloading & processing media (<50MB)...</i>", parse_mode=ParseMode.HTML)
            file_path, title, duration = await download_media_async(url, temp_dir)

            if not file_path or not os.path.exists(file_path):
                await status_msg.edit_text(
                    "❌ <b>Download Failed</b>\n\n"
                    "Possible reasons:\n"
                    "• The file exceeds Telegram's <b>50MB limit</b>.\n"
                    "• The video is private, age-restricted, or geo-blocked.\n"
                    "• The platform modified their streaming cipher.",
                    parse_mode=ParseMode.HTML,
                )
                return

            # Check filesize before upload
            size_mb = os.path.getsize(file_path) / (1024 * 1024)
            if size_mb > cfg.MAX_FILE_SIZE_MB:
                await status_msg.edit_text(
                    f"⚠️ <b>File Exceeds Telegram Limit</b>\n\n"
                    f"Extracted media is <b>{size_mb:.1f} MB</b>. "
                    f"Telegram bots can only upload files under <b>{cfg.MAX_FILE_SIZE_MB} MB</b>.",
                    parse_mode=ParseMode.HTML,
                )
                return

            await status_msg.edit_text("📤 <i>Uploading video to Telegram...</i>", parse_mode=ParseMode.HTML)

            caption = (
                f"🎬 <b>{title or 'Media'}</b>\n"
                f"📦 <b>Size:</b> {size_mb:.1f} MB"
                f"{format_sponsor_footer()}"
            )

            # Upload video file
            media_input = FSInputFile(path=file_path, filename=os.path.basename(file_path))
            try:
                await bot.send_video(
                    chat_id=chat_id,
                    video=media_input,
                    caption=caption,
                    parse_mode=ParseMode.HTML,
                    supports_streaming=True,
                    duration=duration or 0,
                )
                await status_msg.delete()
            except TelegramRetryAfter as retry:
                logger.warning("Telegram flood limit hit. Sleeping %s seconds", retry.retry_after)
                await asyncio.sleep(retry.retry_after)
                await bot.send_video(
                    chat_id=chat_id,
                    video=media_input,
                    caption=caption,
                    parse_mode=ParseMode.HTML,
                )
                await status_msg.delete()
        except Exception as exc:
            logger.error("Error during media streaming lifecycle: %s", exc)
            await status_msg.edit_text("⚠️ An error occurred during media dispatch. Please try again.")
        finally:
            logger.debug("Temp directory %s deleted. Local disk storage preserved.", temp_dir)


@router.callback_query(F.data.startswith("verify:"))
async def handle_sub_verification(query: CallbackQuery, bot: Bot):
    """Handle verification callback button from force-sub gate."""
    user_id = query.from_user.id
    payload = query.data.split("verify:", 1)[1] if query.data else ""

    is_subbed = await is_user_subscribed(bot, user_id)
    if not is_subbed:
        await query.answer("❌ You have not joined the channel yet! Please join first.", show_alert=True)
        return

    await query.answer("✅ Verification successful! Starting download...", show_alert=False)
    if query.message and isinstance(query.message, Message):
        if payload and payload.startswith("http"):
            await process_media_download(
                bot=bot,
                chat_id=query.message.chat.id,
                user_id=user_id,
                url=payload,
                status_msg=query.message,
            )
        else:
            await query.message.edit_text(
                "✅ <b>Verification Confirmed!</b>\n\n"
                "You now have full access to downloads. Send any media URL to start downloading!",
                parse_mode=ParseMode.HTML,
            )


@router.message(F.text)
async def handle_text_messages(message: Message, bot: Bot):
    """
    Dispatcher router:
    - If URL detected -> Launch media downloader lifecycle
    - If regular text -> Launch conversational Gemini 2.5 Flash query
    """
    user_text = message.text.strip() if message.text else ""
    extracted_url = extract_media_url(user_text)

    # 1. Media Downloader Path
    if extracted_url:
        status_msg = await message.reply("🔄 <i>Analyzing media link...</i>", parse_mode=ParseMode.HTML)
        await process_media_download(
            bot=bot,
            chat_id=message.chat.id,
            user_id=message.from_user.id if message.from_user else 0,
            url=extracted_url,
            status_msg=status_msg,
        )
        return

    # 2. Conversational Gemini AI Path
    status_msg = await message.reply("🧠 <i>Thinking with Gemini 2.5...</i>", parse_mode=ParseMode.HTML)
    ai_response = await ask_gemini(user_text)
    await status_msg.edit_text(
        f"{ai_response}{format_sponsor_footer()}",
        parse_mode=ParseMode.HTML,
        disable_web_page_preview=True,
    )


# ==============================================================================
# 8. APP ENTRYPOINT & CLEAN SHUTDOWN
# ==============================================================================

async def main():
    """Bot initialization and long-polling runner."""
    logger.info("Initializing OmniMedia Downloader & AI Assistant Telegram Bot...")

    bot = Bot(
        token=cfg.BOT_TOKEN,
        default=DefaultBotProperties(parse_mode=ParseMode.HTML),
    )
    dp = Dispatcher()
    dp.include_router(router)

    # Clean previous webhook to allow clean polling
    try:
        await bot.delete_webhook(drop_pending_updates=True)
        bot_info = await bot.get_me()
        logger.info("Bot verified: @%s (ID: %s)", bot_info.username, bot_info.id)
        logger.info("Starting polling loop with concurrency limit %d...", cfg.MAX_CONCURRENT_DOWNLOADS)
        await dp.start_polling(bot)
    except Exception as exc:
        logger.critical("Fatal error in bot lifecycle: %s", exc)
    finally:
        logger.info("Shutting down worker threads...")
        thread_executor.shutdown(wait=False)
        await bot.session.close()
        logger.info("Bot cleanly stopped.")


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except (KeyboardInterrupt, SystemExit):
        logger.info("Process terminated by signal.")
