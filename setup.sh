#!/bin/bash
set -e

echo "Setting up Resala Children's Day Tracking System..."

# Check if pnpm is installed
if ! command -v pnpm &> /dev/null; then
    echo "pnpm not found. Installing pnpm via corepack..."
    corepack enable
    corepack prepare pnpm@latest --activate
fi

echo "Installing project dependencies..."
pnpm install

if [ ! -f .env.local ]; then
    if [ -f .env.example ]; then
        echo "Creating .env.local from .env.example..."
        cp .env.example .env.local
    else
        echo "Creating default .env.local..."
        cat <<EOT >> .env.local
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
EOT
    fi
    echo "Please populate .env.local with your real Supabase credentials."
else
    echo ".env.local already exists. Skipping creation."
fi

echo "Setup complete! Run 'pnpm dev' to start the local development server."
