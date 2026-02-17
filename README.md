# StudyFetch - AI-Powered Learning Platform

Transform your PDFs, presentations, and notes into organized study materials, interactive quizzes, and AI-powered tutoring instantly.

**[Try it now →](https://study-tool-frontend-prod.vercel.app/study/test)**

## Features

### 📝 Smart Notes
Upload your PDFs and presentations, and watch as our AI automatically generates organized notes, highlights key concepts, and creates a comprehensive study guide tailored to your learning needs.

![Course Interface](https://study-tool-frontend-prod.vercel.app/images/course-interface.png)

### 🤖 AI Tutoring & Quizzes
Generate unlimited practice quizzes from your study material and get real-time help from your AI assistant. It tracks your learning progress, provides instant feedback, and answers questions about any concept.

![Quiz Assistant](https://study-tool-frontend-prod.vercel.app/images/quiz-assistant.png)

### 🎥 Brainrot Videos
Turn boring lectures into viral brainrot videos! Powered by [Korpi.AI](https://korpi.ai), our AI generates engaging, meme-style explanation videos from your study material. Think Minecraft parkour gameplay with your biology notes narrated in brainrot style. Learning has never been this entertaining.

![Brainrot Video](https://study-tool-frontend-prod.vercel.app/videos/brainrot-video.mp4)

### Additional Features

- **Topic Organization**: Automatically break down your material into organized learning units
- **Progress Tracking**: Track which topics you've mastered and monitor your quiz performance over time
- **AI Chat Assistant**: Chat with your personal AI assistant about any topic in your study material

## Backend Repository

The backend API for this project is available at: [https://github.com/Reksely/study-tool-backend-prod](https://github.com/Reksely/study-tool-backend-prod)

## Getting Started

### Prerequisites

Create a `.env` file in the root directory with the following environment variables:

```bash
# Database Configuration
MONGODB_URI=your_mongodb_connection_string_here

# JWT Authentication
JWT_SECRET=your_jwt_secret_key_here

# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3005/api
```

### Running the Development Server

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
