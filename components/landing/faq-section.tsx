"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { AnimatedSection } from "./animated-section";

const faqs = [
  {
    question: "What is StudyFetch?",
    answer:
      "StudyFetch is an AI-powered learning platform that transforms your course materials into interactive study tools including organized notes, quizzes, and video summaries. Our AI assistant helps you learn faster and more effectively.",
  },
  {
    question: "Can I upload my whole class lecture to StudyFetch?",
    answer:
      "Yes! You can upload PDFs or paste your lecture notes. Our AI will automatically process and create comprehensive study materials from them.",
  },
  {
    question: "What types of course material can I upload?",
    answer:
      "You can upload PDFs or paste text notes. Our AI processes these formats to create personalized study materials organized by topic.",
  },
  {
    question: "Does my course material automatically convert into other features?",
    answer:
      "Yes! Once you upload your materials, they're automatically organized into topics, and you can generate quizzes and video summaries with one click.",
  },
  {
    question: "How does the AI work?",
    answer:
      "Our AI uses advanced machine learning to analyze your course materials, extract key concepts, organize them into topics, and create personalized study tools. The AI assistant learns from your progress to provide tailored help.",
  },
  {
    question: "What is the AI assistant?",
    answer:
      "The AI assistant is your personal study companion who helps you learn by answering questions, explaining concepts, and providing real-time tutoring on your study material. It's available 24/7!",
  },
];

export function FaqSection() {
  return (
    <section id="faq" className="border-b border-border">
      <div className="mx-auto max-w-3xl px-6 py-20 lg:py-28">
        <AnimatedSection animation="fade-up" className="text-center mb-12">
          <h2 className="font-[family-name:var(--font-heading)] text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
            Frequently asked questions
          </h2>
          <p className="mt-4 text-muted-foreground">
            Everything you need to know about StudyFetch.
          </p>
        </AnimatedSection>

        <AnimatedSection animation="fade-up" delay={100}>
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="border-border"
              >
                <AccordionTrigger className="text-left text-base font-medium hover:no-underline py-5">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed pb-5">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </AnimatedSection>
      </div>
    </section>
  );
}
