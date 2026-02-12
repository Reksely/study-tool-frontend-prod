import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BookOpen, Brain, Sparkles, Target } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Top Bar */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-primary" />
            <span className="font-semibold text-foreground">StudyTool</span>
          </Link>
          <div className="flex items-center gap-3">
            <Button variant="ghost" asChild>
              <Link href="/login">Sign in</Link>
            </Button>
            <Button asChild>
              <Link href="/register">Sign up</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="relative mx-auto max-w-5xl px-6 py-24 sm:py-32">
          <div className="flex flex-col items-center text-center">
            <div className="mb-6 flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-sm text-primary">
              <Sparkles className="h-4 w-4" />
              <span>Your personal learning companion</span>
            </div>
            <h1 className="font-serif text-5xl font-bold tracking-tight text-foreground sm:text-7xl">
              Master Any Subject
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
              Transform the way you learn with intelligent flashcards, spaced
              repetition, and progress tracking. Built for serious learners.
            </p>
            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Button size="lg" asChild>
                <Link href="/register">Get Started</Link>
              </Button>
              <Button size="lg" variant="outline">
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="mx-auto max-w-5xl px-6 py-24">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Brain className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Spaced Repetition</CardTitle>
              <CardDescription>
                Our algorithm schedules reviews at optimal intervals to maximize
                retention.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-chart-2/10">
                <BookOpen className="h-6 w-6 text-chart-2" />
              </div>
              <CardTitle>Smart Flashcards</CardTitle>
              <CardDescription>
                Create rich flashcards with images, code snippets, and markdown
                support.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="sm:col-span-2 lg:col-span-1">
            <CardHeader>
              <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-chart-1/10">
                <Target className="h-6 w-6 text-chart-1" />
              </div>
              <CardTitle>Progress Tracking</CardTitle>
              <CardDescription>
                Visualize your learning journey with detailed statistics and
                insights.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>

      {/* CTA Section */}
      <div className="mx-auto max-w-5xl px-6 pb-24">
        <Card>
          <CardContent className="flex flex-col items-center gap-6 py-12 text-center">
            <h2 className="text-3xl font-bold text-card-foreground">
              Ready to accelerate your learning?
            </h2>
            <p className="max-w-md text-muted-foreground">
              Join thousands of learners who have transformed their study habits
              with our platform.
            </p>
            <Button size="lg" asChild>
              <Link href="/register">Start Learning Today</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
