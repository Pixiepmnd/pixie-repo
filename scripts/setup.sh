#!/bin/bash

# Pixie Setup Script

echo "🚀 Setting up Pixie..."

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js 18 or higher is required"
    exit 1
fi

echo "✅ Node.js version check passed"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build TypeScript
echo "🔨 Building TypeScript..."
npm run build:ts

# Check if Rust is installed
if command -v cargo &> /dev/null; then
    echo "🦀 Building Rust components..."
    cargo build --release
else
    echo "⚠️  Rust not found, skipping Rust build"
fi

# Run tests
echo "🧪 Running tests..."
npm test

echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Copy .env.example to .env"
echo "2. Add your wallet private key"
echo "3. Run: npm run dev"
