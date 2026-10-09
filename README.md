# 🚀 OmniMedia Downloader & Gemini AI Assistant Telegram Bot

> **Production-ready, async Python Telegram Bot engineered for BotKeep Cloud Containers (2GB RAM, 150% CPU limit, 2GB disk).**  
> Features multi-platform media downloading via `yt-dlp`, intelligent queries & video summarization via Google's `google-genai` SDK (`gemini-2.5-flash`), Force-Subscription channel gating, and sponsored monetized footers.

---

## 📑 Table of Contents
1. [Architecture Overview](#-architecture-overview)
2. [Hardware & Container Resource Budget (BotKeep)](#-hardware--container-resource-budget-botkeep)
3. [Key Features & Specifications](#-key-features--specifications)
4. [Project Structure](#-project-structure)
5. [Prerequisites & Token Acquisition](#-prerequisites--token-acquisition)
6. [Local Development Setup](#-local-development-setup)
7. [GitHub Repository Initialization](#-github-repository-initialization)
8. [BotKeep Cloud Deployment Guide](#-botkeep-cloud-deployment-guide)
9. [Configuration Variables (.env)](#-configuration-variables-env)
10. [Troubleshooting & Best Practices](#-troubleshooting--best-practices)

---

## 🏛 Architecture Overview

```
                           +------------------------------+
                           |     Telegram Bot API         |
                           +--------------+---------------+
                                          |
                                          | Long-Polling (aiogram v3)
                                          v
+-------------------------------------------------------------------------+
|  BotKeep Cloud Container (2GB RAM / 150% CPU / 2GB Ephemeral Disk)      |
|                                                                         |
|  +-------------------------+         +-------------------------------+  |
|  | Main Async Dispatcher   | <-----> | Force-Subscription Gate       |  |
|  | (aiogram v3 Main Loop)  |         | (get_chat_member & callbacks) |  |
|  +------------+------------+         +-------------------------------+  |
|               |                                                         |
|               +-----------------------+                                 |
|               |                       |                                 |
|               v                       v                                 |
|  +--------------------------+  +-------------------------------------+  |
|  | ThreadPoolExecutor       |  | Google GenAI Engine                 |  |
|  | (max_workers=2)          |  | (gemini-2.5-flash)                  |  |
|  | - yt-dlp media extraction|  | - /ask text Q&A                     |  |
|  | - FFmpeg muxing (<50MB)  |  | - /summarize video metadata & TL;DR |  |
|  +------------+-------------+  +------------------+------------------+  |
|               |                                   |                     |
|               v                                   v                     |
|  +--------------------------+       +--------------------------------+  |
|  | tempfile.TemporaryDir()  |       | Sponsored Monetization Footer  |  |
|  | (Strict auto-cleanup on  |       | (Affiliate link injection)     |  |
|  | upload success or error) |       +--------------------------------+  |
+---------------+---------------------------------------------------------+
                |
                v
       Telegram Video Send (FSInputFile under 50MB)
```

---

## ⚡ Hardware & Container Resource Budget (BotKeep)

BotKeep provides container environments with constrained specifications:
* **Memory Ceiling:** 2GB RAM.
* **CPU Limit:** 150% (1.5 vCPU).
* **Storage:** 2GB Ephemeral disk.

### How this Codebase is Engineered for BotKeep:
1. **Bounded Concurrency Semaphore (`asyncio.Semaphore(2)`):** Prevents simultaneous yt-dlp processes from spawning uncontrolled threads that cause Out-Of-Memory (OOM) container restarts.
2. **Dedicated ThreadPoolExecutor:** `yt-dlp` download operations are CPU-bound and synchronous. Running them inside `loop.run_in_executor()` keeps the `aiogram` event loop smooth and responsive to incoming user messages.
3. **Zero-Disk-Leak Lifecycle:** All media files are written into Python's `tempfile.TemporaryDirectory()`. The `with` block and `try...finally` pattern guarantees directory destruction immediately after upload, preventing disk exhaustion on BotKeep's 2GB disk.
4. **50MB Pre- & Post-Download Check:** Native Telegram bots cannot upload media files larger than 50MB. `yt-dlp`'s format filter (`best[filesize<=50M]`) and secondary file size guard reject oversized files before exhausting network or disk bandwidth.

---

## ✨ Key Features & Specifications

* **Multi-Platform Downloader:** Public media extraction from **YouTube** (Shorts & Standard), **TikTok** (watermark-free), **Instagram** (Reels & Posts), **Facebook** (Reels & Watch), and **Twitter/X**.
* **Gemini 2.5 Flash Companion:** Fast, high-accuracy conversational AI powered by Google AI Studio's `google-genai` SDK.
* **Smart Media Summarizer (`/summarize`):** Extracts metadata, creator notes, and descriptions from a video URL and returns a structured executive summary with 4 actionable takeaways.
* **Monetization 1 (Force-Subscription Channel Gate):** Checks user membership status against your Telegram channel before initiating downloads. Includes dynamic inline buttons ("📢 Join Channel" and "✅ Verify Subscription").
* **Monetization 2 (Sponsored Affiliate Footers):** Injects customized affiliate links and sponsor slogans into video captions and bot responses.
* **Resilient Error Recovery:** Handles `TelegramRetryAfter` (rate limit backoff), extraction errors, age-restricted/private media notices, and network timeouts.

---

## 📂 Project Structure

```
├── .env.example             # Environment configuration template
├── .gitignore               # Ignored files (virtualenvs, .env, __pycache__)
├── Dockerfile               # Production Docker container image with FFmpeg
├── Procfile                 # Worker definition for BotKeep/Heroku-style PaaS
├── requirements.txt         # Pin-compatible Python 3.10+ dependencies
├── bot.py                   # Complete, modular, un-truncated production bot
└── README.md                # Deployment and operations manual
```

---

## 🔑 Prerequisites & Token Acquisition

### 1. Telegram Bot Token:
1. Message [@BotFather](https://t.me/BotFather) on Telegram.
2. Send `/newbot`, choose a display name and username ending in `bot`.
3. Copy your HTTP API token (e.g., `1234567890:ABCdefGHIjklMNOpqrsTUVwxyz1234567890`).
4. (Recommended) Send `/setprivacy` -> Select your bot -> Choose **Disable** if you plan to use it in group chats, or leave enabled for private chats.

### 2. Mandatory Channel Setup (Force-Subscription):
1. Create a public or private Telegram Channel (e.g., `MyAlphaChannel`).
2. Add your bot to the channel as an **Administrator** with at least **"Invite Users via Link"** permissions.
3. Retrieve your numeric Channel ID:
   * Forward any post from your channel to [@userinfobot](https://t.me/userinfobot) or [@JsonDumpBot](https://t.me/JsonDumpBot).
   * Note the ID (must start with `-100`, e.g., `-1001987654321`).

### 3. Google Gemini API Key:
1. Visit [Google AI Studio](https://aistudio.google.com/app/apikey).
2. Click **Create API Key** and copy the generated key string.

---

## 💻 Local Development Setup

```bash
# 1. Clone your repository
git clone https://github.com/YOUR_USERNAME/omni-media-bot.git
cd omni-media-bot

# 2. Create Python 3.10+ virtual environment
python3 -m venv venv
source venv/bin/activate   # On Windows: venv\Scripts\activate

# 3. Ensure system FFmpeg is installed
# macOS: brew install ffmpeg
# Ubuntu/Debian: sudo apt update && sudo apt install -y ffmpeg

# 4. Install dependencies
pip install --upgrade pip
pip install -r requirements.txt

# 5. Configure environment
cp .env.example .env
nano .env  # Or edit with VS Code

# 6. Run the bot locally
python bot.py
```

---

## 🐙 GitHub Repository Initialization

Run these commands in your project root to push the clean codebase to GitHub:

```bash
# 1. Initialize git
git init -b main

# 2. Stage all files (ensure .env is NOT committed)
git add .
git commit -m "feat: initial production commit for OmniMedia Telegram Bot"

# 3. Link remote repository and push
git remote add origin https://github.com/YOUR_USERNAME/omni-media-bot.git
git branch -M main
git push -u origin main
```

---

## ☁️ BotKeep Cloud Deployment Guide

[BotKeep](https://botkeep.com) provides managed 24/7 container hosting for Telegram and Discord bots.

### Step-by-Step Deployment on BotKeep:

1. **Log in to BotKeep Dashboard:**
   * Go to [https://botkeep.com](https://botkeep.com) and log in with GitHub.

2. **Create New Bot Service:**
   * Click **"+ New Container"** / **"+ Create Bot"**.
   * Select **"Import from GitHub"** and choose your `omni-media-bot` repository.

3. **Select Environment & Build Configuration:**
   * **Runtime:** Select `Docker` (BotKeep will automatically detect the provided `Dockerfile`).
   * Alternatively, select `Python 3.11` with the `Procfile` (`worker: python bot.py`).
   * **Hardware Tier:** 2GB RAM / 150% CPU limit.

4. **Configure Environment Variables in BotKeep:**
   In the **Environment Variables** / **Secrets** section of your BotKeep dashboard, add:

   | Key | Example Value | Description |
   |---|---|---|
   | `BOT_TOKEN` | `7123456789:AAH...` | Telegram bot token from BotFather |
   | `GEMINI_API_KEY` | `AIzaSy...` | Google AI Studio API key |
   | `GEMINI_MODEL` | `gemini-2.5-flash` | Selected Gemini model |
   | `FORCE_CHANNEL_ID` | `-1001987654321` | Telegram channel numeric ID |
   | `FORCE_CHANNEL_USERNAME` | `YourChannel` | Channel username (no @) |
   | `FORCE_CHANNEL_INVITE_LINK` | `https://t.me/YourChannel` | Channel invite URL |
   | `SPONSOR_TEXT` | `🔥 Join Alpha Signals` | Sponsor footer link text |
   | `SPONSOR_URL` | `https://t.me/YourChannel` | Affiliate or sponsor link |
   | `MAX_FILE_SIZE_MB` | `50` | Maximum media upload size (MB) |
   | `MAX_CONCURRENT_DOWNLOADS`| `2` | Worker concurrency limit |
   | `LOG_LEVEL` | `INFO` | Console log verbosity |

5. **Deploy & Inspect Container Logs:**
   * Click **"Deploy"**.
   * Watch the deployment log stream. You should see:
     ```
     [INFO] | OmniMediaBot | Google GenAI client initialized with model: gemini-2.5-flash
     [INFO] | OmniMediaBot | Bot verified: @YourBotName (ID: 7123456789)
     [INFO] | OmniMediaBot | Starting polling loop with concurrency limit 2...
     ```
   * Open Telegram and send `/start` to verify full operation!

---

## ⚙️ Configuration Variables (.env)

| Variable | Required | Default | Purpose |
|---|---|---|---|
| `BOT_TOKEN` | **Yes** | `""` | Telegram authentication token |
| `GEMINI_API_KEY` | Recommended | `""` | Key for `/ask` and `/summarize` |
| `GEMINI_MODEL` | No | `gemini-2.5-flash` | Gemini model alias |
| `FORCE_CHANNEL_ID` | Optional | `""` | Enforces mandatory channel subscription |
| `FORCE_CHANNEL_USERNAME` | Optional | `""` | Fallback URL username |
| `FORCE_CHANNEL_INVITE_LINK`| Optional | `""` | Target link on Join Channel button |
| `SPONSOR_TEXT` | Optional | `""` | Text injected at the footer of captions |
| `SPONSOR_URL` | Optional | `""` | Target URL for sponsor footer |
| `MAX_FILE_SIZE_MB` | No | `50` | Rejects files larger than Telegram limit |
| `MAX_CONCURRENT_DOWNLOADS`| No | `2` | Safeguards BotKeep 2GB RAM ceiling |
| `LOG_LEVEL` | No | `INFO` | `DEBUG`, `INFO`, `WARNING`, `ERROR` |

---

## 🛠 Troubleshooting & Best Practices

1. **"File too large for Telegram (exceeds 50MB)":**
   * The official Telegram Bot API has a hard upload limit of 50MB for bots. Our format selector attempts to grab sub-50MB qualities. Videos that are too long will trigger the user warning.
2. **"Bot cannot check membership (TelegramBadRequest)":**
   * Verify that the bot is added as an **Administrator** in the target channel. Regular bot membership cannot inspect user lists.
3. **yt-dlp "Sign in to confirm you’re not a bot" on YouTube:**
   * YouTube frequently updates bot-detection headers. Run `pip install --upgrade yt-dlp` in your container or commit updated `requirements.txt` to fetch the latest yt-dlp release.
4. **Container Out of Memory (OOM) on BotKeep:**
   * Keep `MAX_CONCURRENT_DOWNLOADS=2`. Avoid raising this above 3 unless upgrading beyond 2GB RAM.
