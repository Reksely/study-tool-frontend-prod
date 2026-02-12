"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import "katex/dist/katex.min.css";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  FileText,
  Brain,
  ArrowLeft,
  Loader2,
  PanelRightClose,
  PanelRight,
  Video,
} from "lucide-react";
import Link from "next/link";
import { Study, QuestionRecommendation } from "./types";
import {
  DocumentTab,
  QuizTab,
  TikTokVideoTab,
  ChatPanel,
  TopicsSidebar,
} from "./components";

const API_URL = "http://localhost:3005/api";

export default function StudyPage() {
  const params = useParams(); 
  const router = useRouter();
  const [study, setStudy] = useState<Study | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [recommendation, setRecommendation] = useState<QuestionRecommendation | null>(null);
  const [activeTab, setActiveTab] = useState("document");
  const [showChatPanel, setShowChatPanel] = useState(true);

  // Topic state
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [activeScrollTopic, setActiveScrollTopic] = useState<string | null>(null);
  const documentContentRef = useRef<HTMLDivElement>(null);

  // Quiz state for chat panel
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answeredQuestions, setAnsweredQuestions] = useState<boolean[]>([]);
  const [selectedAnswers, setSelectedAnswers] = useState<(number | null)[]>([]);

  // Resizer state
  const containerRef = useRef<HTMLDivElement>(null);
  const chatPanelRef = useRef<HTMLDivElement>(null);
  const isResizingRef = useRef(false);

  // Resizer handlers - using refs for smooth performance (no re-renders)
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    isResizingRef.current = true;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizingRef.current || !containerRef.current || !chatPanelRef.current) return;
      
      const containerRect = containerRef.current.getBoundingClientRect();
      const newWidth = containerRect.right - e.clientX;
      
      // Clamp between 280px and 70% of container
      const minWidth = 280;
      const maxWidth = containerRect.width * 0.7;
      const clampedWidth = Math.max(minWidth, Math.min(maxWidth, newWidth));
      
      // Direct DOM manipulation - no React state updates = smooth!
      chatPanelRef.current.style.width = `${clampedWidth}px`;
    };

    const handleMouseUp = () => {
      isResizingRef.current = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, []);

  useEffect(() => {
    fetchStudy();
  }, [params.id]);

  const fetchStudy = async () => {
    try {
      const res = await fetch(`${API_URL}/studies/${params.id}`, {
        credentials: "include",
      });

      if (!res.ok) {
        if (res.status === 401) {
          router.push("/login");
          return;
        }
        throw new Error("Failed to fetch study");
      }

      const data = await res.json();
      setStudy(data.study);
      setRecommendation(data.questionRecommendation);
      
      if (data.study.quizQuestions?.length) {
        setSelectedAnswers(new Array(data.study.quizQuestions.length).fill(null));
        setAnsweredQuestions(new Array(data.study.quizQuestions.length).fill(false));
      }
    } catch (err) {
      setError("Failed to load study");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !study) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background">
        <p className="text-destructive">{error || "Study not found"}</p>
        <Button asChild>
          <Link href="/dashboard">Back to Dashboard</Link>
        </Button>
      </div>
    );
  }

  const currentQuizQuestion = study.quizQuestions?.[currentQuestionIndex];

  return (
    <div className="flex h-screen flex-col bg-background overflow-hidden">
      {/* Header */}
      <header className="shrink-0 border-b border-border bg-background/80 backdrop-blur">
        <div className="flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Link>
            </Button>
            <div>
              <h1 className="font-semibold text-foreground">{study.title}</h1>
            </div>
          </div>
          {activeTab !== "video" && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowChatPanel(!showChatPanel)}
          >
            {showChatPanel ? (
              <PanelRightClose className="h-4 w-4" />
            ) : (
              <PanelRight className="h-4 w-4" />
            )}
          </Button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <div ref={containerRef} className="flex flex-1 overflow-hidden">
        {/* Topics Sidebar - only show if topics exist and on document tab */}
        {activeTab === "document" && (
          <TopicsSidebar
            study={study}
            setStudy={setStudy}
            studyId={params.id as string}
            selectedTopic={selectedTopic}
            setSelectedTopic={setSelectedTopic}
            documentContentRef={documentContentRef}
            activeScrollTopic={activeScrollTopic}
            setActiveScrollTopic={setActiveScrollTopic}
          />
        )}

        {/* Left Panel - Document/Quiz/Video */}
        <div className="flex-1 flex flex-col overflow-hidden relative">
          {/* Sticky Tabs */}
          <div className="shrink-0 sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border px-6 py-3">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full max-w-md grid-cols-3">
                <TabsTrigger value="document" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Document
                </TabsTrigger>
                <TabsTrigger value="quiz" className="flex items-center gap-2">
                  <Brain className="h-4 w-4" />
                  Quiz
                </TabsTrigger>
                <TabsTrigger value="video" className="flex items-center gap-2">
                  <Video className="h-4 w-4" />
                  TikTok Video
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Scrollable Content */}
          <div ref={documentContentRef} className="flex-1 overflow-auto scrollbar-custom">
            <div className="mx-auto max-w-4xl p-6">
              <Tabs value={activeTab} className="w-full">
                {/* Document Tab */}
                <TabsContent value="document" className="mt-0">
                  <DocumentTab study={study} selectedTopic={selectedTopic} scrollContainerRef={documentContentRef} />
                </TabsContent>

              {/* Quiz Tab */}
              <TabsContent value="quiz" className="mt-0">
                  <QuizTab
                    study={study}
                    setStudy={setStudy}
                    studyId={params.id as string}
                    recommendation={recommendation}
                  />
              </TabsContent>

              {/* TikTok Video Tab */}
              <TabsContent value="video" className="mt-0">
                  <TikTokVideoTab
                    study={study}
                    setStudy={setStudy}
                    studyId={params.id as string}
                  />
              </TabsContent>
            </Tabs>
          </div>
        </div>
        </div>

        {/* Right Panel - Chat */}
        {showChatPanel && activeTab !== "video" && (
          <ChatPanel
            study={study}
            studyId={params.id as string}
            activeTab={activeTab}
            currentQuizQuestion={currentQuizQuestion}
            hasAnswered={answeredQuestions[currentQuestionIndex]}
            selectedAnswer={selectedAnswers[currentQuestionIndex]}
            currentTopicIndex={
              activeScrollTopic && study.topics
                ? study.topics.findIndex(t => t.id === activeScrollTopic)
                : selectedTopic && study.topics
                  ? study.topics.findIndex(t => t.id === selectedTopic)
                  : null
            }
            onClose={() => setShowChatPanel(false)}
            handleMouseDown={handleMouseDown}
          />
        )}
      </div>
    </div>
  );
}
