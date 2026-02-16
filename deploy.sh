#!/bin/bash

# Configuration
USER="cefikuqu"
HOST="s104.cyon.net"
REMOTE_DIR="/home/cefikuqu/public_html/snow.burn.codes"
LOCAL_FRONTEND_DIR="frontend"

echo "🚀 Starting deployment to $HOST..."

# 1. Build the frontend
echo "📦 Building frontend..."
cd $LOCAL_FRONTEND_DIR
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed. Aborting deployment."
    exit 1
fi

# 2. Sync to server
echo "📤 Syncing dist/ folder to server..."
# Using rsync to efficiently sync only changed files
# --delete ensures old files are removed from server
rsync -avz --delete dist/ $USER@$HOST:$REMOTE_DIR

if [ $? -eq 0 ]; then
    echo "✅ Deployment successful! Visit https://snow.burn.codes"
else
    echo "❌ Deployment failed."
    exit 1
fi
