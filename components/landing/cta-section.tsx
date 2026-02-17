"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { AnimatedSection } from "./animated-section";

export function CtaSection() {
  return (
    <section className="border-b border-border">
      <div className="mx-auto max-w-6xl px-6 py-20 lg:py-28">
        <AnimatedSection animation="scale-in">
          <div className="relative overflow-hidden rounded-3xl bg-foreground px-8 py-16 sm:px-16 sm:py-24 text-center">
            {/* Subtle texture */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:3rem_3rem]" />
            <div className="relative">
              <h2 className="font-[family-name:var(--font-heading)] text-3xl sm:text-4xl lg:text-5xl font-bold text-background tracking-tight text-balance leading-tight">
                Ready to ace your next exam?
              </h2>
              <p className="mt-4 text-lg text-background/60 max-w-xl mx-auto">
                Join thousands of students already studying smarter with
                AI-powered tools.
              </p>
              <Button
                size="lg"
                variant="secondary"
                asChild
                className="mt-8 rounded-full h-12 px-8 text-base bg-background text-foreground hover:bg-background/90"
              >
                <Link href="/register">
                  Start For Free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}
