"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Volume2, VolumeX } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { AnimatedSection } from "./animated-section";
import { useState, useRef } from "react";

interface ShowcaseSectionProps {
  badge: string;
  title: string;
  description: string;
  imageSrc?: string;
  imageAlt?: string;
  videoSrc?: string;
  reversed?: boolean;
  id?: string;
}

export function ShowcaseSection({
  badge,
  title,
  description,
  imageSrc,
  imageAlt,
  videoSrc,
  reversed = false,
  id,
}: ShowcaseSectionProps) {
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  return (
    <section id={id} className="border-b border-border">
      <div className="mx-auto max-w-6xl px-6 py-20 lg:py-28">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
          <div className={reversed ? "lg:order-2" : ""}>
            <AnimatedSection animation={reversed ? "slide-in-right" : "slide-in-left"}>
              <Badge variant="outline" className="mb-6 rounded-full px-3 py-1 text-xs">
                {badge}
              </Badge>
              <h2 className="font-[family-name:var(--font-heading)] text-3xl sm:text-4xl font-bold text-foreground tracking-tight text-balance leading-tight">
                {title}
              </h2>
              <p className="mt-4 text-lg text-muted-foreground leading-relaxed max-w-lg">
                {description}
              </p>
              <Button size="lg" asChild className="mt-8 rounded-full h-11 px-6">
                <Link href="/register">
                  Start For Free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </AnimatedSection>
          </div>
          <div className={reversed ? "lg:order-1" : ""}>
            <AnimatedSection animation={reversed ? "slide-in-left" : "slide-in-right"} delay={150}>
              {videoSrc ? (
                <div className="relative flex justify-center">
                  <video
                    ref={videoRef}
                    src={videoSrc}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="h-[520px] w-auto rounded-2xl shadow-2xl shadow-foreground/5"
                  />
                  <button
                    onClick={toggleMute}
                    className="absolute bottom-4 right-4 p-3 rounded-full bg-background/80 backdrop-blur-sm border border-border hover:bg-background/90 transition-colors"
                    aria-label={isMuted ? "Unmute video" : "Mute video"}
                  >
                    {isMuted ? (
                      <VolumeX className="h-5 w-5 text-foreground" />
                    ) : (
                      <Volume2 className="h-5 w-5 text-foreground" />
                    )}
                  </button>
                </div>
              ) : (
                <div className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-2xl shadow-foreground/5">
                  <Image
                    src={imageSrc!}
                    alt={imageAlt!}
                    width={1200}
                    height={780}
                    className="w-full h-auto"
                  />
                </div>
              )}
            </AnimatedSection>
          </div>
        </div>
      </div>
    </section>
  );
}
