# 🎯 Career Counselor Chatbot

An AI-powered **career counseling chatbot** that helps users explore career paths, provides instant roadmaps, and engages in meaningful conversations.  
Built with **Next.js**, **Supabase PostgreSQL**, **Prisma**, **tRPC**, and **Google Gemini API**, it combines a modern tech stack with intelligent features.

🔗 **Live Demo**: [career-counselor-chatbot-ten.vercel.app](https://career-counselor-chatbot-ten.vercel.app)  
📂 **GitHub Repository**: (https://github.com/komolika05/career-counselor-chatbot)

---

## 📖 Project Overview

Choosing the right career can be overwhelming. This chatbot aims to simplify the process by:

- Providing **personalized career roadmaps** from the very first user message.
- Asking relevant **follow-up questions** to refine suggestions.
- Offering an **interactive, distraction-free chat experience** with a sleek modern UI.

The project demonstrates how **LLMs + structured data + modern web frameworks** can be combined to create intelligent applications.

---

## 🏗️ How It Works (Architecture)

Here’s the flow of the application:

1. **Frontend (Next.js + TailwindCSS)**

   - Provides a modern chat interface with conversation history, dark/light themes, typing indicators, and sidebar titles.

2. **tRPC API Layer**

   - Handles type-safe API calls between the frontend and backend.
   - Manages conversation CRUD operations (create, delete, fetch).

3. **Database (Supabase PostgreSQL + Prisma)**

   - Stores conversations, messages, and user-related schema (prepared for future authentication).
   - Prisma ORM provides type-safe queries and migrations.

4. **LLM Integration (Gemini API)**

   - User’s messages are sent to Google’s Gemini model (`gemini-2.5-flash`).
   - Response is streamed back and displayed with typing indicators.

5. **Deployment (Vercel)**
   - Both frontend and backend are serverless, deployed on Vercel.
   - Environment variables securely stored in Vercel’s dashboard.

**Architecture Diagram (Conceptual)**

User ──▶ Next.js UI ──▶ tRPC Backend ──▶ Prisma ORM ──▶ Supabase PostgreSQL
│ │
└──────────▶ Gemini API ◀───────┘

---

## 🚀 Key Features

- 🗑️ **Delete Conversation** – Remove unwanted chats anytime.
- 📌 **Relevant Chat Titles** – Conversations are auto-titled and shown in the sidebar.
- 🌙 **Light/Dark Themes** – Seamless UI theme switching.
- ✍️ **Typing Indicators** – See when the bot is responding.
- 🧭 **Career Roadmap from First Message** – Instant actionable guidance, refined through deeper interaction.
- ⚠️ **Hallucination Notes** – Current free-tier Gemini may hallucinate, but roadmap still provided.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/)
- **Styling**: [TailwindCSS](https://tailwindcss.com/)
- **Database**: [Supabase PostgreSQL](https://supabase.com/)
- **ORM**: [Prisma](https://www.prisma.io/)
- **API Layer**: [tRPC](https://trpc.io/)
- **AI/LLM**: [Google Gemini API](https://ai.google.dev/) (`gemini-2.5-flash` free tier)
- **Deployment**: [Vercel](https://vercel.com/)

---

## 📦 Setup & Installation

Follow these steps to run the project locally:

**Clone the repository**
git clone https://github.com/komolika05/career-counselor-chatbot.git
cd your-repo-name
Install dependencies

npm install

Configure environment variables
Create a .env file in the root directory:

env
DATABASE_URL="your-supabase-db-url"
GEMINI_API_KEY="your-gemini-api-key"
GEMINI_MODEL="gemini-2.5-flash"

Run Prisma

npx prisma generate

npx prisma migrate deploy # only if you have migrations

Start development server

npm run dev
Visit http://localhost:3000 🎉

**🔮 Future Enhancements**

**- Conversation Caching** – Store stringified conversations in sessionStorage for reduced latency and improved context when resuming chats.

**- Resume Parsing** – Parse resumes, extract key skills/experience, and provide career advice or mock interviews tailored to the candidate.

**- Improved LLM Reliability** – Switch from Gemini free tier to OpenAI’s paid models with fine-tuning for higher accuracy and reduced hallucinations.

**- User Authentication** – Schema already supports it; just need to add an authentication module for secure user accounts.\*\*

📜 License
This project is created for academic/assignment purposes.
