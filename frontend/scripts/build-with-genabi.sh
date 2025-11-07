#!/bin/bash
set -e

# Navigate to project root
cd "$(dirname "$0")/../.."

# Install root dependencies and compile contracts
if [ -f "package.json" ]; then
  echo "Installing root dependencies..."
  npm install
  
  echo "Compiling contracts..."
  npm run compile
fi

# Navigate back to frontend
cd frontend

# Generate ABI files
echo "Generating ABI files..."
npm run genabi

# Build Next.js app
echo "Building Next.js app..."
npm run build

