"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { 
  BookOpen, 
  Brain, 
  Sparkles, 
  FileText, 
  MessageSquare, 
  Video, 
  GraduationCap, 
  Image as ImageIcon, 
  Mic, 
  FileCheck, 
  Phone, 
  Headphones, 
  PlayCircle, 
  Calendar, 
  ChevronDown,
  TrendingUp,
  Clock,
  CheckCircle,
  BarChart3
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function Home() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const features = [
    {
      icon: FileText,
      title: "Smart Notes",
      description: "Upload PDFs or paste your notes to create organized study materials instantly."
    },
    {
      icon: Brain,
      title: "AI Quizzes",
      description: "Generate unlimited practice quizzes from your course material with instant feedback."
    },
    {
      icon: MessageSquare,
      title: "AI Chat Assistant",
      description: "Chat with your personal AI assistant about any topic in your study material."
    },
    {
      icon: BookOpen,
      title: "Topic Organization",
      description: "Automatically break down your material into organized learning units."
    },
    {
      icon: Video,
      title: "Video Summaries",
      description: "Generate short TikTok-style educational videos from your study content."
    },
    {
      icon: TrendingUp,
      title: "Progress Tracking",
      description: "Track which topics you've mastered and monitor your quiz performance over time."
    }
  ];

  const faqs = [
    {
      question: "What is StudyFetch?",
      answer: "StudyFetch is an AI-powered learning platform that transforms your course materials into interactive study tools including organized notes, quizzes, and video summaries. Our AI assistant helps you learn faster and more effectively."
    },
    {
      question: "Can I upload my whole class lecture to StudyFetch?",
      answer: "Yes! You can upload PDFs or paste your lecture notes. Our AI will automatically process and create comprehensive study materials from them."
    },
    {
      question: "What types of course material can I upload?",
      answer: "You can upload PDFs or paste text notes. Our AI processes these formats to create personalized study materials organized by topic."
    },
    {
      question: "Does my course material automatically convert into other features?",
      answer: "Yes! Once you upload your materials, they're automatically organized into topics, and you can generate quizzes and video summaries with one click."
    },
    {
      question: "How do I upload my material?",
      answer: "Simply click the create button, then either upload PDF files or paste your notes. Our system processes them instantly to create your personalized study set."
    },
    {
      question: "How does the AI work?",
      answer: "Our AI uses advanced machine learning to analyze your course materials, extract key concepts, organize them into topics, and create personalized study tools. The AI assistant learns from your progress to provide tailored help."
    },
    {
      question: "What is the AI assistant?",
      answer: "The AI assistant is your personal study companion who helps you learn by answering questions, explaining concepts, and providing real-time tutoring on your study material. It's available 24/7!"
    }
  ];

  return (
    <div className="landing-page min-h-screen bg-background">
      {/* Top Bar */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2 group">
            <BookOpen className="h-6 w-6 text-primary transition-transform group-hover:scale-110" />
            <span className="font-bold text-foreground text-lg">StudyFetch</span>
          </Link>
          <div className="flex items-center gap-3">
            <Button variant="ghost" asChild>
              <Link href="/login">Sign in</Link>
            </Button>
            <Button asChild className="animate-in fade-in slide-in-from-top-2 duration-500">
              <Link href="/register">Try For Free</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
        <div className="relative mx-auto max-w-7xl px-6 py-20 sm:py-32">
          <div className="flex flex-col items-center text-center animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <h1 className="font-bold tracking-tight text-foreground text-4xl sm:text-6xl lg:text-7xl max-w-4xl">
              Create accurate lecture notes
              <br />
              <span className="text-primary">from your course material</span> in seconds.
            </h1>
            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <Button size="lg" asChild className="text-base h-12 px-8">
                <Link href="/register">Try For Free</Link>
              </Button>
              <Button size="lg" variant="outline" className="text-base h-12 px-8">
                Watch Video
              </Button>
            </div>
            <div className="mt-6 flex flex-wrap justify-center gap-4">
              <Button size="sm" variant="secondary">
                Watch a Demo
              </Button>
              <Button size="sm" variant="secondary">
                Get My Study Plan
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Statement */}
      <section className="border-b border-border bg-muted/30">
        <div className="mx-auto max-w-7xl px-6 py-16 text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">Learning is hard</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            We make learning faster and more effective, without shortcuts.
          </p>
          <div className="mt-8">
            <Button size="lg" asChild>
              <Link href="/register">Start For Free</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <div className="grid gap-8 md:grid-cols-3">
            <Card className="text-center animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
              <CardHeader>
                <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                  <TrendingUp className="h-10 w-10 text-primary" />
                </div>
                <CardTitle className="text-5xl font-bold text-primary">92%</CardTitle>
                <CardDescription className="text-base mt-2">
                  of Students Improved Their Grades
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
              <CardHeader>
                <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                  <Clock className="h-10 w-10 text-primary" />
                </div>
                <CardTitle className="text-5xl font-bold text-primary">30%</CardTitle>
                <CardDescription className="text-base mt-2">
                  Reduction in Study Time
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
              <CardHeader>
                <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                  <CheckCircle className="h-10 w-10 text-primary" />
                </div>
                <CardTitle className="text-5xl font-bold text-primary">92%</CardTitle>
                <CardDescription className="text-base mt-2">
                  Success Rate for Regular Active Users
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
          <p className="text-center text-sm text-muted-foreground mt-8">
            *Study of 1000 StudyFetch users over finals in December 2024
          </p>
        </div>
      </section>

      {/* Study Insights Section */}
      <section className="border-b border-border bg-muted/30">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <div className="grid gap-12 lg:grid-cols-2 items-center">
            <div className="space-y-6 animate-in fade-in slide-in-from-left duration-700">
              <h2 className="text-4xl font-bold text-foreground">
                Study Insights
              </h2>
              <h3 className="text-2xl font-semibold text-primary">
                Get insights.
              </h3>
              <p className="text-lg text-muted-foreground">
                Practice what matters. Track your progress.
              </p>
              <p className="text-base text-muted-foreground">
                StudyFetch automatically tracks your progress, providing insights into your strengths and weaknesses and creating study tools that match them.
              </p>
              <Button size="lg" asChild>
                <Link href="/register">Start For Free</Link>
              </Button>
            </div>
            <div className="flex items-center justify-center animate-in fade-in slide-in-from-right duration-700">
              <div className="relative w-full max-w-md aspect-square">
                <div className="absolute inset-0 rounded-3xl bg-primary/5 border-2 border-primary/20 flex items-center justify-center">
                  <BarChart3 className="h-32 w-32 text-primary/40" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Course to Study Set Section */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <div className="grid gap-12 lg:grid-cols-2 items-center">
            <div className="order-2 lg:order-1 flex items-center justify-center animate-in fade-in slide-in-from-left duration-700">
              <div className="relative w-full max-w-md aspect-square">
                <div className="absolute inset-0 rounded-3xl bg-primary/5 border-2 border-primary/20 flex items-center justify-center">
                  <Sparkles className="h-32 w-32 text-primary/40" />
                </div>
              </div>
            </div>
            <div className="order-1 lg:order-2 space-y-6 animate-in fade-in slide-in-from-right duration-700">
              <h2 className="text-4xl font-bold text-foreground">
                Your course material to an entire study set in 1 click
              </h2>
              <p className="text-lg text-muted-foreground">
                Automatically receive flashcards, quizzes, and personalized chat help from your notes, videos, and PowerPoints.
              </p>
              <Button size="lg" asChild>
                <Link href="/register">Start For Free</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* AI Tutor Section */}
      <section className="border-b border-border bg-muted/30">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <div className="grid gap-12 lg:grid-cols-2 items-center">
            <div className="space-y-6 animate-in fade-in slide-in-from-left duration-700">
              <h2 className="text-4xl font-bold text-foreground">
                Be Prepared with AI Tutoring
              </h2>
              <p className="text-lg text-muted-foreground">
                Your AI assistant tracks your learning, provides instant feedback on quizzes, and answers questions about your study material.
              </p>
              <Button size="lg" asChild>
                <Link href="/register">Start For Free</Link>
              </Button>
            </div>
            <div className="flex items-center justify-center animate-in fade-in slide-in-from-right duration-700">
              <div className="relative w-full max-w-md aspect-square">
                <div className="absolute inset-0 rounded-3xl bg-primary/5 border-2 border-primary/20 flex items-center justify-center">
                  <Brain className="h-32 w-32 text-primary/40" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Study Tools Section */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Lecture Summaries, Interactive Quizzes, and Flashcards
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Get study tools tailored to you from your lectures and course materials in seconds.
            </p>
            <Button size="lg" asChild className="mt-6">
              <Link href="/register">Upload My Materials</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="border-b border-border bg-muted/30">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">Explore Features</h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {features.map((feature, index) => (
              <Card 
                key={index} 
                className="group hover:shadow-lg transition-all duration-300 hover:scale-105 hover:border-primary/50 animate-in fade-in slide-in-from-bottom-4"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <CardHeader>
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                  <CardDescription className="text-sm">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
          <div className="text-center mt-12">
            <Button size="lg" asChild>
              <Link href="/register">Start For Free</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-4xl px-6 py-20">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-foreground mb-4">Common Questions</h2>
          </div>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <Card 
                key={index}
                className="overflow-hidden transition-all duration-300 hover:shadow-md"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full text-left"
                >
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                    <CardTitle className="text-lg font-semibold">
                      {faq.question}
                    </CardTitle>
                    <ChevronDown 
                      className={`h-5 w-5 text-muted-foreground transition-transform duration-300 ${
                        openFaq === index ? 'rotate-180' : ''
                      }`}
                    />
                  </CardHeader>
                </button>
                <div 
                  className={`transition-all duration-300 ease-in-out ${
                    openFaq === index 
                      ? 'max-h-96 opacity-100' 
                      : 'max-h-0 opacity-0 overflow-hidden'
                  }`}
                >
                  <CardContent className="pt-0">
                    <p className="text-muted-foreground">{faq.answer}</p>
                  </CardContent>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="bg-muted/30">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <Card className="border-2 border-primary/20 bg-background">
            <CardContent className="flex flex-col items-center gap-8 py-16 text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 animate-pulse">
                <BookOpen className="h-10 w-10 text-primary" />
              </div>
              <div className="space-y-4">
                <h2 className="text-4xl font-bold text-foreground">
                  Ready to ace the test?
                </h2>
                <p className="text-xl text-muted-foreground max-w-2xl">
                  Sign up to revolutionize your learning.
                </p>
              </div>
              <Button size="lg" asChild className="text-base h-12 px-8">
                <Link href="/register">Start For Free</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <div className="flex flex-col items-center justify-center gap-4 text-center">
            <Link href="/" className="flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-primary" />
              <span className="font-bold text-foreground text-lg">StudyFetch</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              © 2024 StudyFetch. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
