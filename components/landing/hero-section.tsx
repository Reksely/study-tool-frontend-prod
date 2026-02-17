"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { AnimatedSection } from "./animated-section";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      {/* Subtle grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-30" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,var(--background)_70%)]" />

      <div className="relative mx-auto max-w-6xl px-6 py-24 sm:py-36">
        <div className="flex flex-col items-center text-center">
          <AnimatedSection animation="fade-up" delay={0}>
            <Badge variant="secondary" className="mb-8 px-4 py-1.5 text-sm font-medium rounded-full">
              AI-Powered Learning Platform
            </Badge>
          </AnimatedSection>

          <AnimatedSection animation="fade-up" delay={100}>
            <h1 className="font-[family-name:var(--font-heading)] font-bold tracking-tight text-foreground text-4xl sm:text-6xl lg:text-7xl max-w-4xl text-balance leading-[1.1]">
              Create accurate lecture notes{" "}
              <span className="text-muted-foreground">from your course material</span>{" "}
              in seconds
            </h1>
          </AnimatedSection>

          <AnimatedSection animation="fade-up" delay={200}>
            <p className="mt-6 text-lg text-muted-foreground max-w-2xl leading-relaxed text-pretty">
              Transform your PDFs, presentations, and notes into organized study
              materials, interactive quizzes, and AI-powered tutoring instantly.
            </p>
          </AnimatedSection>

          <AnimatedSection animation="fade-up" delay={300}>
            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <Button size="lg" asChild className="h-12 px-8 text-base rounded-full">
                <Link href="/register">
                  Try For Free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-12 px-8 text-base rounded-full"
                asChild
              >
                <Link href="/study/test">
                  Try Interface
                </Link>
              </Button>
            </div>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
}
