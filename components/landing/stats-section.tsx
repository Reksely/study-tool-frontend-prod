"use client";

import { AnimatedSection } from "./animated-section";

const stats = [
  { value: "92%", label: "of students improved their grades" },
  { value: "30%", label: "reduction in study time" },
  { value: "92%", label: "success rate for active users" },
  { value: "24/7", label: "AI tutoring availability" },
];

export function StatsSection() {
  return (
    <section className="border-y border-border">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-border">
          {stats.map((stat, i) => (
            <AnimatedSection
              key={stat.label}
              animation="fade-up"
              delay={i * 100}
              className="py-12 px-6 text-center"
            >
              <p className="font-[family-name:var(--font-heading)] text-4xl sm:text-5xl font-bold text-foreground tracking-tight">
                {stat.value}
              </p>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                {stat.label}
              </p>
            </AnimatedSection>
          ))}
        </div>
      </div>
      <div className="border-t border-border">
        <p className="text-center text-xs text-muted-foreground py-4">
          *Based on a study of 1,000+ StudyFetch users during finals, December 2024
        </p>
      </div>
    </section>
  );
}
