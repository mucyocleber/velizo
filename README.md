# VELIZO

**Connecting Global Employers with Exceptional Talent**

An AI-powered international recruitment platform built with Next.js, Express.js, Supabase, and Google Gemini AI.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js, React, TypeScript, Tailwind CSS |
| Backend | Node.js, Express.js, TypeScript |
| Database | Supabase PostgreSQL |
| Authentication | Supabase Auth + JWT |
| Storage | Supabase Storage |
| Search Engine | Meilisearch |
| AI | Google Gemini API |
| Payments | Stripe, Flutterwave |
| SMS | Africa's Talking |

## Project Structure

```
├── client/          # Next.js Frontend
├── server/          # Express.js Backend
├── .env.example     # Environment variables template
└── README.md
```

## Getting Started

### Prerequisites
- Node.js v18+
- npm v9+
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/mucyocleber/velizo.git

# Install frontend dependencies
cd client && npm install

# Install backend dependencies
cd ../server && npm install

# Copy environment variables
cp .env.example .env
# Fill in your API keys in .env

# Start frontend (in client/)
npm run dev

# Start backend (in server/)
npm run dev
```

## Author
**Mucyo Cleberé** — CodeMateRwa LTD

## License
Confidential — All Rights Reserved © 2026
