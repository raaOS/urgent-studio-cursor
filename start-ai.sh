#!/bin/bash
# AI Agent Starter Script
# Usage: ./start-ai.sh or npm run myai

echo "🤖 Starting AI Agent for Urgent Studio Project..."
echo "📁 Current directory: $(pwd)"
echo "🔧 Project: Next.js + Go + PostgreSQL"
echo ""

# Check if npx is available
if ! command -v npx &> /dev/null; then
    echo "❌ NPX not found. Please install Node.js first."
    echo "💡 Visit: https://nodejs.org for installation instructions"
    exit 1
fi

echo "✅ Starting Forge AI Agent..."
echo "📌 Remember: I can help with:"
echo "   - Frontend/Backend development"
echo "   - Database queries" 
echo "   - Debugging & fixes"
echo "   - File analysis"
echo ""
echo "🖼️  To share images: Save to project folder and tell me the path"
echo "🔄  To restart: Run 'npm run myai' again"
echo ""

# Start forge with project context and API key
FORGE_KEY=sk-fg-v1-8ec0c0402e31111ef85d51edb04d231c7c8d156ec1df82829a70c89543f38559 npx forgecode@latest