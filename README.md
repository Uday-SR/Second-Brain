## About

Second Brain is an AI-powered knowledge system that transforms YouTube videos into structured, queryable information.

It ingests video content using yt-dlp, processes it with local LLMs via Ollama, and enables semantic search, summarization, and a Q&A system over the extracted content.

The goal is to turn passive video consumption into an active, searchable knowledge base.

## Tech Stack

**Frontend**
- React
- TypeScript

**Backend**
- Node.js
- TypeScript
- Prisma (postgresql)

**AI Layer**
- Python (served via Uvicorn)
- yt-dlp (Caption extraction)
- Ollama (local LLM inference)

## Key Features

- Ingest YouTube videos via link
- Semantic search over extracted content (not just keyword matching)
- AI-powered Q&A system based on video context
- Fast and interactive UI for knowledge exploration
- User authentication (Sign up / Sign in)
- Uses Prisma to store user content

## How It Works

1. User provides a YouTube link
3. Brain stores the Link for the signed up user  
2. yt-dlp extracts audio/transcript  
3. Content is processed using Ollama (LLM)  
4. Data is transformed into semantically searchable format  
5. Users can:
   - Ask questions  
   - Get summaries   

## Getting Started

```bash
# frontend
cd client
npm install
npm run dev

# backend
cd server
npm install
npm run dev

# ai service
cd ai-service
pip install -r requirements.txt
uvicorn main:app --reload