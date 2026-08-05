# ControL-D: AI Health Assistant & Diabetes Companion

ControL-D is a comprehensive, production-ready digital health companion designed for diabetes care. It features real-time glucose tracking, medication and hydration reminders, tailored South Indian meal planning, and an AI Health Coach powered by Groq's ultra-fast Llama-3 models.

## 🌟 Key Features

- **AI Health Coach**: Instant (sub-200ms) answers to health, diet, and lifestyle questions using Groq API and Llama 3.
- **Glucose & Vitals Tracking**: Log your fasting, post-meal, and random blood sugar readings.
- **Smart Reminders**: Browser-based audio and visual alarms for medications and hydration.
- **Tailored Diet Planner**: Customized South Indian diabetic diet suggestions (e.g., Pesarattu, Ragi, Foxtail Millets).
- **Secure Authentication**: Robust user authentication and database management powered by Supabase.
- **Production-Ready**: Secured with HTTP security headers and rate-limited API routes to prevent abuse.

## 🛠️ Technology Stack

- **Framework**: Next.js (App Router, v16)
- **UI Library**: React (v19), Tailwind CSS (v4), Shadcn UI, Framer Motion / GSAP
- **Database & Auth**: Supabase (PostgreSQL)
- **AI Integration**: Groq API (llama-3.1-8b-instant)

## 📋 Prerequisites

Before you begin, ensure you have the following installed on your machine:
- [Node.js](https://nodejs.org/en/download/) (v18 or higher)
- npm (comes with Node.js)
- A [Supabase](https://supabase.com/) Account (for database and authentication)
- A [Groq](https://console.groq.com/) Account (for the AI API Key)

## 🚀 Installation & Setup

1. **Clone the repository** (if you haven't already):
   ```bash
   git clone https://github.com/rahulachari/ControL-D.git
   cd ControL-D
   ```

2. **Install the dependencies**:
   ```bash
   npm install
   ```
   *Note: Next.js and React 19 dependencies are heavily used. Ensure you have no legacy peer dependency conflicts.*

3. **Set up Environment Variables**:
   Create a `.env.local` file in the root directory and add the following keys. 
   
   ```env
   # Supabase Setup
   NEXT_PUBLIC_SUPABASE_URL="your-supabase-project-url"
   NEXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key"
   
   # Groq AI Setup (Server-side ONLY)
   GROQ_API_KEY="your-groq-api-key"
   ```
   > ⚠️ **Security Note**: Never prefix your `GROQ_API_KEY` with `NEXT_PUBLIC_` as it will expose your private key to the client browser.

4. **Initialize Database** (Optional):
   If you need to set up the database schema, run the SQL commands found in `supabase/schema.sql` within your Supabase project's SQL editor.

## 💻 Running the App

To start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result. The application supports hot-reloading.

## 📦 Building for Production

To build the optimized production version of the application:

```bash
npm run build
```

To start the production server:
```bash
npm run start
```

## 🔒 Security & Best Practices Implemented

- **No Exposed Keys**: AI API keys are strictly kept server-side in Next.js API Routes.
- **Rate Limiting**: An in-memory rate limiter protects the `/api/chat` route from bot abuse.
- **Security Headers**: X-Frame-Options, Strict-Transport-Security, Content-Security-Policy, and other critical headers are configured in `next.config.ts`.
- **Hydration Protections**: `suppressHydrationWarning` flags protect forms and navigational components from breaking when users have password manager extensions installed.
