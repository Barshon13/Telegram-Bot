# ==============================================================================
# Production Dockerfile for BotKeep Cloud Container
# Hardware Profile: 2GB RAM / 150% CPU limit / 2GB Disk
# Base: Python 3.11 Slim with FFmpeg
# ==============================================================================

FROM python:3.11-slim

# Set environment defaults
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1 \
    DEBIAN_FRONTEND=noninteractive

WORKDIR /app

# Install system dependencies (FFmpeg is required by yt-dlp for media merging)
RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg \
    ca-certificates \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install pinned Python dependencies
COPY requirements.txt .
RUN pip install --upgrade pip && \
    pip install -r requirements.txt

# Copy application source code
COPY bot.py .
COPY .env.example .

# Add non-root user for security and file permission cleanliness
RUN useradd -m -u 1000 botuser && \
    chown -R botuser:botuser /app
USER botuser

# Bot entrypoint command
CMD ["python", "bot.py"]
