#!/bin/bash
set -e

# ─── ErrandHub Deploy Script ────────────────────────
# Run this on the VPS after pushing to GitHub.
# Usage: ./deploy.sh
# ────────────────────────────────────────────────────

APP_DIR="/opt/errandhub"
BRANCH="main"

echo "🚀 Deploying ErrandHub..."

# Navigate to app directory
cd "$APP_DIR"

# Pull latest code
echo "📥 Pulling latest code from $BRANCH..."
git pull origin "$BRANCH"

# Copy environment file if .env doesn't exist
if [ ! -f .env ]; then
    echo "⚠️  No .env found. Copying from .env.docker template..."
    cp .env.docker .env
    echo "📝 Edit .env with your actual values, then re-run this script."
    exit 1
fi

# Source .env for build args
export $(grep -v '^#' .env | xargs)

# Build and start containers
echo "🐳 Building and starting containers..."
docker compose down
docker compose build --no-cache
docker compose up -d

# Wait for MySQL to be healthy
echo "⏳ Waiting for MySQL to be healthy..."
sleep 10

# Run migrations inside backend container
echo "🗄️  Running migrations..."
docker compose exec -T backend php artisan migrate --force

# Cache config
echo "⚡ Caching config..."
docker compose exec -T backend php artisan config:cache
docker compose exec -T backend php artisan route:cache
docker compose exec -T backend php artisan view:cache || true

# Cleanup old images
echo "🧹 Cleaning up old Docker images..."
docker image prune -f

echo ""
echo "✅ Deploy complete!"
echo "🌐 Frontend: https://${TRAEFIK_DOMAIN:-errandhub.example.com}"
echo "🔌 Reverb:   https://${REVERB_DOMAIN:-reverb.errandhub.example.com}"
echo ""
