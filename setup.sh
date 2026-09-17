cat > setup.sh << 'EOF'
#!/bin/bash
set -e

echo "Setting up Resala Tracking System..."

pnpm install

cp .env.example .env.local

echo "Setup complete."
echo "Add your Supabase URL and anon key to .env.local, then run: pnpm dev"
EOF
chmod +x setup.sh
