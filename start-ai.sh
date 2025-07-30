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

# Load API key from .env file
if [ -f .env ]; then
    source .env
else
    echo "❌ File .env tidak ditemukan!"
    echo "💡 Buat file .env dan tambahkan: FORGE_KEY=your_api_key_here"
    exit 1
fi

# Check if API key is set
if [ -z "$FORGE_KEY" ]; then
    echo "❌ FORGE_KEY tidak ditemukan di file .env!"
    echo "💡 Edit file .env dan set FORGE_KEY=your_api_key_here"
    exit 1
fi

echo "🔑 API Key loaded from .env file"
echo "📚 Loading project context and memory..."

# Load project context
if [ -f "FORGE-AI-CONTEXT.md" ]; then
    echo "✅ Project context loaded"
    echo "📋 Rules & standards active"
    echo "🧠 AI memory system ready"
else
    echo "⚠️  Warning: FORGE-AI-CONTEXT.md not found"
fi

echo "🚀 Starting Forge with full project context..."
echo ""
echo "💡 Quick Commands:"
echo "   - 'refresh context' = reload project memory"
echo "   - 'load memory' = scan all documentation"
echo "   - 'check rules' = verify ESLint & standards"
echo ""

# Start forge with project context and API key from .env
npx forgecode@latest