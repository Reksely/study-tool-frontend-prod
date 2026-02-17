"use client";

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  BookOpen,
  Brain,
  FileText,
  MessageSquare,
  TrendingUp,
  Video,
} from "lucide-react";
import { AnimatedSection } from "./animated-section";

const features = [
  {
    icon: FileText,
    title: "Smart Notes",
    description:
      "Upload PDFs or paste your notes to create organized study materials instantly.",
  },
  {
    icon: Brain,
    title: "AI Quizzes",
    description:
      "Generate unlimited practice quizzes from your course material with instant feedback.",
  },
  {
    icon: MessageSquare,
    title: "AI Chat Assistant",
    description:
      "Chat with your personal AI assistant about any topic in your study material.",
  },
  {
    icon: BookOpen,
    title: "Topic Organization",
    description:
      "Automatically break down your material into organized learning units.",
  },
  {
    icon: Video,
    title: "Brainrot Videos",
    description:
      "Generate viral TikTok-style brainrot videos that explain your subject in an engaging, meme-worthy way.",
  },
  {
    icon: TrendingUp,
    title: "Progress Tracking",
    description:
      "Track which topics you've mastered and monitor your quiz performance over time.",
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="border-b border-border">
      <div className="mx-auto max-w-6xl px-6 py-20 lg:py-28">
        <AnimatedSection animation="fade-up" className="text-center mb-16">
          <h2 className="font-[family-name:var(--font-heading)] text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
            Everything you need to study smarter
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Powerful AI tools that transform how you learn, practice, and retain
            information.
          </p>
        </AnimatedSection>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <AnimatedSection
              key={feature.title}
              animation="fade-up"
              delay={index * 80}
            >
              <Card className="group h-full border-border/60 bg-card hover:border-foreground/20 hover:shadow-lg hover:shadow-foreground/5 transition-all duration-300">
                <CardHeader className="gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-foreground/5 group-hover:bg-foreground/10 transition-colors duration-300">
                    <feature.icon className="h-5 w-5 text-foreground" />
                  </div>
                  <CardTitle className="text-base font-semibold">
                    {feature.title}
                  </CardTitle>
                  <CardDescription className="text-sm leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}
