import { Header } from "@/components/landing/header";
import { HeroSection } from "@/components/landing/hero-section";
import { StatsSection } from "@/components/landing/stats-section";
import { ShowcaseSection } from "@/components/landing/showcase-section";
import { FeaturesSection } from "@/components/landing/features-section";
import { FaqSection } from "@/components/landing/faq-section";
import { CtaSection } from "@/components/landing/cta-section";
import { Footer } from "@/components/landing/footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main>
        <HeroSection />
        <StatsSection />

        <ShowcaseSection
          id="how-it-works"
          badge="Smart Notes"
          title="Your course material to an entire study set in one click"
          description="Upload your PDFs and presentations, and watch as our AI automatically generates organized notes, highlights key concepts, and creates a comprehensive study guide tailored to your learning needs."
          imageSrc="/images/course-interface.png"
          imageAlt="StudyFetch course interface showing organized topics on the left and AI-generated notes from PDFs and presentations on the right"
        />

        <ShowcaseSection
          badge="AI Tutoring"
          title="Practice with AI quizzes and get instant expert guidance"
          description="Generate unlimited practice quizzes from your study material and get real-time help from your AI assistant. It tracks your learning progress, provides instant feedback, and answers questions about any concept."
          imageSrc="/images/quiz-assistant.png"
          imageAlt="StudyFetch quiz interface with multiple choice questions on the left and an AI chat assistant providing explanations on the right"
          reversed
        />

        <ShowcaseSection
          badge="Brainrot Videos"
          title="Turn boring lectures into viral brainrot videos"
          description="Our AI generates engaging, meme-style explanation videos from your study material. Think Minecraft parkour gameplay with your biology notes narrated in brainrot style. Learning has never been this entertaining."
          videoSrc="/videos/brainrot-video.mp4"
        />

        <FeaturesSection />
        <FaqSection />
        <CtaSection />
      </main>

      <Footer />
    </div>
  );
}
