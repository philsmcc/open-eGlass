#!/bin/bash

# eGlass Fusion Deployment Script
# This script helps push changes to GitHub

echo "🚀 eGlass Fusion - GitHub Deployment"
echo "======================================"

# Check if we're in the right directory
if [ ! -f "index.html" ]; then
    echo "❌ Error: Not in the webapp directory"
    exit 1
fi

echo "📋 Current Git Status:"
git status --short

echo ""
echo "To push to GitHub, you'll need to:"
echo "1. Set up a Personal Access Token (PAT) at: https://github.com/settings/tokens"
echo "2. Use the token as your password when pushing"
echo ""
echo "Run these commands:"
echo "  git remote set-url origin https://github.com/philsmcc/open-eGlass.git"
echo "  git push -u origin main"
echo ""
echo "Alternatively, set up SSH keys for easier pushing:"
echo "  https://docs.github.com/en/authentication/connecting-to-github-with-ssh"
echo ""
echo "Your repository will be at: https://github.com/philsmcc/open-eGlass"
