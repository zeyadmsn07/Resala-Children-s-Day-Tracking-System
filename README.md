# Resala Children's Day Tracking System 🎈

A mobile-first web application built to help Resala's facilitators seamlessly track student attendance, behavior, and academic progress across Children's Day modules without the hassle of spreadsheets.

## 🛠 Tech Stack

- **Frontend:** Next.js 16 (App Router)
- **Styling:** Tailwind CSS + `shadcn/ui`
- **Charts:** Recharts
- **Backend & Auth:** Supabase (PostgreSQL, Row Level Security)
- **Deployment:** Vercel

## 🚀 Getting Started

Follow these steps to set up your local development environment.

### 1. Clone the repository

```bash
git clone https://github.com/zeyadmsn07/Resala-Children-s-Day-Tracking-System.git
cd Resala-Children-s-Day-Tracking-System
```

### 2. Run the automated setup

If you are using Mac, Linux, or WSL, make the script executable first:

```bash
chmod +x setup.sh
./setup.sh
```

This script automatically enables `pnpm`, installs all project dependencies, and generates your `.env.local` file.

### 3. Add your Environment Variables

Open the newly created `.env.local` file in VS Code and paste the secure keys provided by the team lead:

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

⚠️ **CRITICAL:** Never commit your `.env.local` file to GitHub or share the Service Role Key publicly!

### 4. Start the Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result. (Note: This command is for UI/frontend development and will not be used during database SQL tasks).

## 🎨 Design & Theming

- **Core Theme:** Clean, crisp white backgrounds with Resala's corporate shades of blue for primary navigation and active states.
- **Children's Day Vibe:** Use bubbly yellows and energetic oranges for interactive elements (attentiveness sliders, behavior point buttons, and Recharts graphs) to keep the system feeling friendly and welcoming.

## 🤖 Development Philosophy ("Vibe Coding")

Our stack utilizes some advanced concepts (Server Actions, Supabase RLS). If you are new to these, do not stress.

- **AI is Encouraged:** You are fully empowered to use Claude, Gemini, ChatGPT, Codex, or AntiGravity to generate boilerplate, figure out components, or squash bugs.
- **Verify Everything:** Do not blindly copy-paste. You must test your UI in the browser, verify your database writes, and understand the core logic of what you are committing. You own the code!

## 📋 Task Workflow & Communication

Most tasks are isolated, but if your assignment relies on a backend table or UI screen being built first, please wait for the green light.

- When you finish a task, test it locally.
- Once verified, send this exact confirmation message in the team WhatsApp group: `Task XX: Done ✅`

## 👥 Team

- **Zeyad:** Team Lead, Backend Architecture & Deployment
- **Omar Eslam:** Route Protection, Auth & Entity Management
- **Omar Gouda:** UI/UX, Tracking Workflows & Analytics
