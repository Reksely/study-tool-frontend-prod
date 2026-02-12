"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Brain,
  Loader2,
  CheckCircle,
  XCircle,
  RotateCcw,
  Lightbulb,
  Sparkles,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  History,
  Eye,
  X,
  Check,
} from "lucide-react";
import { Study, QuizQuestion, QuestionRecommendation, QuizHistoryEntry } from "../types";

const API_URL = "http://localhost:3005/api";

interface QuizTabProps {
  study: Study;
  setStudy: React.Dispatch<React.SetStateAction<Study | null>>;
  studyId: string;
  recommendation: QuestionRecommendation | null;
}

export function QuizTab({ study, setStudy, studyId, recommendation }: QuizTabProps) {
  // Quiz state
  const [quizLoading, setQuizLoading] = useState(false);
  const [numQuestions, setNumQuestions] = useState(10);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<(number | null)[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [answeredQuestions, setAnsweredQuestions] = useState<boolean[]>([]);
  const [showHint, setShowHint] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showQuestionSelector, setShowQuestionSelector] = useState(false);
  const questionSelectorRef = useRef<HTMLDivElement>(null);
  const [selectedQuizTopics, setSelectedQuizTopics] = useState<string[]>([]);
  const [quizMode, setQuizMode] = useState<'all' | 'to_learn' | 'review' | 'custom'>('all');
  const [quizAnalysis, setQuizAnalysis] = useState<string | null>(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [wrongConceptIds, setWrongConceptIds] = useState<string[]>([]);
  const [quizHistory, setQuizHistory] = useState<QuizHistoryEntry[]>(study.quizHistory || []);
  const [selectedHistoryIds, setSelectedHistoryIds] = useState<string[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [viewingHistoryEntry, setViewingHistoryEntry] = useState<QuizHistoryEntry | null>(null);
  const [avoidKnownConcepts, setAvoidKnownConcepts] = useState(false);
  const [showMasteredConcepts, setShowMasteredConcepts] = useState(false);

  // Initialize quiz state when study changes
  useEffect(() => {
    if (study.quizQuestions?.length) {
      setSelectedAnswers(new Array(study.quizQuestions.length).fill(null));
      setAnsweredQuestions(new Array(study.quizQuestions.length).fill(false));
    }
    if (study.quizHistory) {
      setQuizHistory(study.quizHistory);
    }
  }, [study.quizQuestions?.length, study.quizHistory]);

  // Update numQuestions when recommendation changes
  useEffect(() => {
    if (recommendation) {
      setNumQuestions(recommendation.suggested);
    }
  }, [recommendation?.suggested]);

  // Calculate dynamic recommendation based on selected topics
  const dynamicRecommendation = useMemo(() => {
    if (!recommendation) return null;
    
    const totalTopics = study.topics?.length || 1;
    
    // Determine selected count based on quiz mode
    let selectedCount: number;
    if (quizMode === 'all') {
      selectedCount = totalTopics;
    } else if (quizMode === 'custom' && selectedQuizTopics.length === 0) {
      // Custom mode with nothing selected - use minimum
      selectedCount = 1;
    } else {
      selectedCount = selectedQuizTopics.length || totalTopics;
    }
    
    // 10 questions per topic
    const questionsPerTopic = 10;
    const scaledMin = Math.max(5, selectedCount * 5);
    const scaledMax = selectedCount * 15;
    const scaledSuggested = selectedCount * questionsPerTopic;
    
    const label = quizMode === 'all' 
      ? `All ${totalTopics} topics` 
      : quizMode === 'custom' && selectedQuizTopics.length === 0
        ? 'Select topics'
        : `${selectedCount} of ${totalTopics} topics`;
    
    return {
      min: scaledMin,
      max: scaledMax,
      suggested: scaledSuggested,
      label
    };
  }, [recommendation, selectedQuizTopics, study.topics?.length, quizMode]);

  // Calculate mastered concepts from quiz history with topic info
  const masteredConcepts = useMemo(() => {
    if (quizHistory.length === 0) return [];
    
    // Collect all correctly answered questions - show the CORRECT ANSWER as the mastered concept
    const conceptMap = new Map<string, { answer: string; question: string; topicId?: string; topicTitle?: string; count: number }>();
    
    quizHistory.forEach(entry => {
      entry.answers.filter(a => a.isCorrect).forEach(ans => {
        // Get the correct answer text
        const correctAnswerText = ans.options[ans.correctAnswer];
        const key = `${correctAnswerText}-${ans.question}`; // Use both to avoid duplicates of same answer from different questions
        
        const existing = conceptMap.get(key);
        if (existing) {
          existing.count++;
        } else {
          // Find topic title if topicId exists
          const topic = ans.topicId && study.topics 
            ? study.topics.find(t => t.id === ans.topicId) 
            : null;
          
          conceptMap.set(key, {
            answer: correctAnswerText,
            question: ans.question,
            topicId: ans.topicId,
            topicTitle: topic?.title,
            count: 1
          });
        }
      });
    });
    
    // Convert to array and sort by count (most mastered first)
    return Array.from(conceptMap.values()).sort((a, b) => b.count - a.count);
  }, [quizHistory, study.topics]);

  // Update numQuestions when topic selection changes
  useEffect(() => {
    if (dynamicRecommendation) {
      setNumQuestions(dynamicRecommendation.suggested);
    }
  }, [dynamicRecommendation?.suggested]);

  // Close question selector when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (questionSelectorRef.current && !questionSelectorRef.current.contains(e.target as Node)) {
        setShowQuestionSelector(false);
      }
    };
    if (showQuestionSelector) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showQuestionSelector]);

  const saveQuizToHistory = async () => {
    if (!study.quizQuestions) return;
    
    const answers = study.quizQuestions.map((q, i) => ({
      question: q.question,
      options: q.options,
      correctAnswer: q.correctAnswer,
      userAnswer: selectedAnswers[i] ?? -1,
      isCorrect: selectedAnswers[i] === q.correctAnswer,
      topicId: q.topicId || undefined,
    }));

    try {
      const res = await fetch(`${API_URL}/studies/${studyId}/quiz-history`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          answers,
          selectedTopics: selectedQuizTopics,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setQuizHistory(prev => [data.historyEntry, ...prev]);
      }
    } catch (err) {
      console.error("Failed to save quiz history:", err);
    }
  };

  const deleteHistoryEntry = async (historyId: string) => {
    try {
      const res = await fetch(`${API_URL}/studies/${studyId}/quiz-history/${historyId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (res.ok) {
        setQuizHistory(prev => prev.filter(h => h.id !== historyId));
        setSelectedHistoryIds(prev => prev.filter(id => id !== historyId));
      }
    } catch (err) {
      console.error("Failed to delete history entry:", err);
    }
  };

  // Get known concepts from quiz history (questions answered correctly)
  const getKnownConcepts = () => {
    if (!avoidKnownConcepts || quizHistory.length === 0) return null;
    
    // Collect all correctly answered questions from history
    const knownQuestions = quizHistory.flatMap(h => 
      h.answers.filter(a => a.isCorrect).map(a => a.question)
    );
    
    // Remove duplicates
    const uniqueKnownQuestions = [...new Set(knownQuestions)];
    
    if (uniqueKnownQuestions.length === 0) return null;
    
    return uniqueKnownQuestions;
  };

  const generateQuiz = async (mode: 'new' | 'same_topics' | 'wrong_concepts' = 'new') => {
    setQuizLoading(true);
    setQuizAnalysis(null);
    setViewingHistoryEntry(null);
    
    let topicsToUse = selectedQuizTopics;
    let previousResults = null;
    let questionsToGenerate = numQuestions;
    
    // Get known concepts to avoid
    const knownConcepts = getKnownConcepts();
    
    // Build previous results from selected history entries
    if (selectedHistoryIds.length > 0) {
      const selectedHistories = quizHistory.filter(h => selectedHistoryIds.includes(h.id));
      const allWrongQuestions = selectedHistories.flatMap(h => 
        h.answers.filter(a => !a.isCorrect).map(a => ({
          question: a.question,
          userAnswer: a.options[a.userAnswer] || "Not answered",
          correctAnswer: a.options[a.correctAnswer],
          isCorrect: false
        }))
      );
      
      const totalCorrect = selectedHistories.reduce((sum, h) => sum + h.correctCount, 0);
      const totalWrong = selectedHistories.reduce((sum, h) => sum + h.wrongCount, 0);
      
      if (allWrongQuestions.length > 0) {
        previousResults = {
          correct: totalCorrect,
          wrong: totalWrong,
          total: totalCorrect + totalWrong,
          wrongQuestions: allWrongQuestions
        };
      }
    } else if (mode === 'wrong_concepts' && study.quizQuestions) {
      // Build previous results for the AI to focus on weak areas (from current quiz)
      const wrongQuestions = study.quizQuestions
        .map((q, i) => ({
          question: q.question,
          userAnswer: q.options[selectedAnswers[i] ?? -1] || "Not answered",
          correctAnswer: q.options[q.correctAnswer],
          isCorrect: selectedAnswers[i] === q.correctAnswer
        }))
        .filter(q => !q.isCorrect);
      
      const correctCount = study.quizQuestions.length - wrongQuestions.length;
      
      previousResults = {
        correct: correctCount,
        wrong: wrongQuestions.length,
        total: study.quizQuestions.length,
        wrongQuestions: wrongQuestions
      };
      
      // Use topics from wrong answers if available
      if (wrongConceptIds.length > 0) {
        topicsToUse = wrongConceptIds;
      }
      
      // For "Focus on Mistakes", generate a reasonable number based on wrong answers
      questionsToGenerate = Math.min(15, Math.max(5, wrongQuestions.length * 2));
    }
    
    try {
      const res = await fetch(`${API_URL}/studies/${studyId}/quiz`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ 
          numQuestions: questionsToGenerate, 
          selectedTopics: topicsToUse,
          previousResults: previousResults,
          knownConcepts: knownConcepts
        }),
      });

      if (!res.ok) throw new Error("Failed to generate quiz");

      const data = await res.json();
      setStudy((prev) =>
        prev ? { ...prev, quizQuestions: data.questions } : null
      );
      setSelectedAnswers(new Array(data.questions.length).fill(null));
      setAnsweredQuestions(new Array(data.questions.length).fill(false));
      setCurrentQuestion(0);
      setShowResults(false);
      setShowHint(false);
      setWrongConceptIds([]);
      setSelectedHistoryIds([]);
    } catch (err) {
      console.error("Failed to generate quiz:", err);
    } finally {
      setQuizLoading(false);
    }
  };

  const analyzeQuizResults = async () => {
    if (!study.quizQuestions) return;
    
    setAnalysisLoading(true);
    
    // Build quiz results data
    const results = study.quizQuestions.map((q, i) => ({
      question: q.question,
      userAnswer: q.options[selectedAnswers[i] ?? -1] || "Not answered",
      correctAnswer: q.options[q.correctAnswer],
      isCorrect: selectedAnswers[i] === q.correctAnswer,
      topicId: q.topicId || null
    }));
    
    // Track wrong concept topics
    const wrongTopics = results
      .filter(r => !r.isCorrect && r.topicId)
      .map(r => r.topicId as string);
    setWrongConceptIds([...new Set(wrongTopics)]);
    
    try {
      const res = await fetch(`${API_URL}/studies/${studyId}/analyze-quiz`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ results }),
      });

      if (!res.ok) throw new Error("Failed to analyze quiz");

      const data = await res.json();
      setQuizAnalysis(data.analysis);
    } catch (err) {
      console.error("Failed to analyze quiz:", err);
      // Fallback analysis if API fails
      const correct = results.filter(r => r.isCorrect).length;
      const total = results.length;
      const percentage = Math.round((correct / total) * 100);
      
      let analysis = `## 📊 Quiz Analysis\n\n`;
      analysis += `You scored **${correct}/${total}** (${percentage}%)\n\n`;
      
      if (percentage >= 80) {
        analysis += `### ✅ Great job!\nYou have a strong understanding of this material.\n\n`;
      } else if (percentage >= 60) {
        analysis += `### 💡 Good effort!\nYou're on the right track, but there's room for improvement.\n\n`;
      } else {
        analysis += `### 📚 Keep studying!\nReview the material and try again.\n\n`;
      }
      
      const wrongQuestions = results.filter(r => !r.isCorrect);
      if (wrongQuestions.length > 0) {
        analysis += `### ⚠️ Areas to Review:\n`;
        wrongQuestions.forEach(q => {
          analysis += `- ${q.question}\n`;
        });
      }
      
      setQuizAnalysis(analysis);
    } finally {
      setAnalysisLoading(false);
    }
  };

  const handleAnswerSelect = (answerIndex: number) => {
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestion] = answerIndex;
    setSelectedAnswers(newAnswers);
    
    // Mark as answered (shows correct/incorrect) but allow reselecting
    const newAnswered = [...answeredQuestions];
    newAnswered[currentQuestion] = true;
    setAnsweredQuestions(newAnswered);
    setShowHint(false);
  };

  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentQuestion(currentQuestion - 1);
        setShowHint(false);
        setIsTransitioning(false);
      }, 300);
    }
  };

  const nextQuestion = () => {
    if (study.quizQuestions && currentQuestion < study.quizQuestions.length - 1) {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentQuestion(currentQuestion + 1);
        setShowHint(false);
        setIsTransitioning(false);
      }, 300);
    } else {
      setShowResults(true);
      // Save quiz to history when completed
      saveQuizToHistory();
    }
  };

  const regenerateQuiz = () => {
    // Clear the quiz and show the generate screen
    setStudy((prev) => prev ? { ...prev, quizQuestions: [] } : null);
    setSelectedAnswers([]);
    setAnsweredQuestions([]);
    setCurrentQuestion(0);
    setShowResults(false);
    setShowHint(false);
    setQuizAnalysis(null);
    setWrongConceptIds([]);
  };

  const goToQuestion = (index: number) => {
    setIsTransitioning(true);
    setShowQuestionSelector(false);
    setTimeout(() => {
      setCurrentQuestion(index);
      setShowHint(false);
      setIsTransitioning(false);
    }, 300);
  };

  const getScore = () => {
    if (!study.quizQuestions) return { correct: 0, total: 0 };
    let correct = 0;
    study.quizQuestions.forEach((q, i) => {
      if (selectedAnswers[i] === q.correctAnswer) correct++;
    });
    return { correct, total: study.quizQuestions.length };
  };

  const currentQ = study.quizQuestions?.[currentQuestion];
  const isAnswered = answeredQuestions[currentQuestion];
  const selectedAnswer = selectedAnswers[currentQuestion];

  // Quiz Generation Screen
  if (!study.quizQuestions?.length) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
            <Brain className="h-7 w-7 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">Generate a Quiz</h2>
            <p className="text-muted-foreground">Test your knowledge with AI-generated questions</p>
          </div>
        </div>
          
        {/* Topic Selection */}
        {study.topics && study.topics.length > 1 && (
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Select Topics</CardTitle>
                <div className="flex items-center gap-2 text-sm">
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                  <span className="text-muted-foreground">
                    {study.topics.filter(t => t.learned).length}/{study.topics.length} learned
                  </span>
                </div>
              </div>
              {/* Progress Bar */}
              <div className="h-2 w-full rounded-full bg-muted overflow-hidden mt-2">
                <div 
                  className="h-full bg-green-500 transition-all duration-300"
                  style={{ width: `${(study.topics.filter(t => t.learned).length / study.topics.length) * 100}%` }}
                />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Quiz Mode Selection */}
              <div className="grid grid-cols-4 gap-3">
                <button
                  onClick={() => {
                    setQuizMode('all');
                    setSelectedQuizTopics([]);
                  }}
                  className={`relative p-4 rounded-xl border-2 transition-all text-center ${
                    quizMode === 'all'
                      ? "border-primary bg-primary/10"
                      : "border-border bg-card hover:bg-muted"
                  }`}
                >
                  <div className="text-3xl mb-2">📚</div>
                  <div className="text-sm font-semibold">All</div>
                  <div className="text-xs text-muted-foreground">{study.topics.length} units</div>
                </button>
                <button
                  onClick={() => {
                    setQuizMode('to_learn');
                    const notLearnedIds = study.topics?.filter(t => !t.learned).map(t => t.id) || [];
                    setSelectedQuizTopics(notLearnedIds);
                  }}
                  disabled={study.topics.filter(t => !t.learned).length === 0}
                  className={`relative p-4 rounded-xl border-2 transition-all text-center ${
                    quizMode === 'to_learn'
                      ? "border-orange-500 bg-orange-500/10"
                      : "border-border bg-card hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed"
                  }`}
                >
                  <div className="text-3xl mb-2">🎯</div>
                  <div className="text-sm font-semibold">To Learn</div>
                  <div className="text-xs text-muted-foreground">{study.topics.filter(t => !t.learned).length} units</div>
                </button>
                <button
                  onClick={() => {
                    setQuizMode('review');
                    const learnedIds = study.topics?.filter(t => t.learned).map(t => t.id) || [];
                    setSelectedQuizTopics(learnedIds);
                  }}
                  disabled={study.topics.filter(t => t.learned).length === 0}
                  className={`relative p-4 rounded-xl border-2 transition-all text-center ${
                    quizMode === 'review'
                      ? "border-green-500 bg-green-500/10"
                      : "border-border bg-card hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed"
                  }`}
                >
                  <div className="text-3xl mb-2">✅</div>
                  <div className="text-sm font-semibold">Review</div>
                  <div className="text-xs text-muted-foreground">{study.topics.filter(t => t.learned).length} units</div>
                </button>
                <button
                  onClick={() => {
                    setQuizMode('custom');
                    if (quizMode !== 'custom') {
                      setSelectedQuizTopics([]);
                    }
                  }}
                  className={`relative p-4 rounded-xl border-2 transition-all text-center ${
                    quizMode === 'custom'
                      ? "border-purple-500 bg-purple-500/10"
                      : "border-border bg-card hover:bg-muted"
                  }`}
                >
                  <div className="text-3xl mb-2">⚙️</div>
                  <div className="text-sm font-semibold">Custom</div>
                  <div className="text-xs text-muted-foreground">Pick units</div>
                </button>
              </div>

              {/* Selected Units Display */}
              <div className={`p-4 rounded-xl border-2 space-y-3 ${
                quizMode === 'all' ? "border-primary/30 bg-primary/5" :
                quizMode === 'to_learn' ? "border-orange-500/30 bg-orange-500/5" :
                quizMode === 'review' ? "border-green-500/30 bg-green-500/5" :
                "border-purple-500/30 bg-purple-500/5"
              }`}>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold">
                    {quizMode === 'all' && "📚 All Units Selected"}
                    {quizMode === 'to_learn' && "🎯 Units To Learn"}
                    {quizMode === 'review' && "✅ Units To Review"}
                    {quizMode === 'custom' && "⚙️ Custom Selection"}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {quizMode === 'all' 
                      ? study.topics.length 
                      : selectedQuizTopics.length} unit{(quizMode === 'all' ? study.topics.length : selectedQuizTopics.length) !== 1 ? 's' : ''}
                  </span>
                </div>
                
                {/* Unit Pills */}
                <div className="flex flex-wrap gap-2">
                  {study.topics.map((topic, index) => {
                    const isIncluded = quizMode === 'all' || selectedQuizTopics.includes(topic.id);
                    const isCustomMode = quizMode === 'custom';
                    
                    return (
                      <button
                        key={topic.id}
                        onClick={() => {
                          if (isCustomMode) {
                            if (selectedQuizTopics.includes(topic.id)) {
                              setSelectedQuizTopics(selectedQuizTopics.filter(id => id !== topic.id));
                            } else {
                              setSelectedQuizTopics([...selectedQuizTopics, topic.id]);
                            }
                          }
                        }}
                        disabled={!isCustomMode}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                          isIncluded
                            ? quizMode === 'all' ? "bg-primary text-primary-foreground" :
                              quizMode === 'to_learn' ? "bg-orange-500 text-white" :
                              quizMode === 'review' ? "bg-green-500 text-white" :
                              "bg-purple-500 text-white"
                            : "bg-muted/50 text-muted-foreground"
                        } ${isCustomMode ? "cursor-pointer hover:opacity-80" : "cursor-default"}`}
                      >
                        <span className={`flex h-5 w-5 items-center justify-center rounded text-xs font-bold ${
                          isIncluded ? "bg-white/20" : "bg-muted-foreground/20"
                        }`}>
                          {index + 1}
                        </span>
                        <span className="truncate max-w-[120px]">{topic.title}</span>
                        {topic.learned && (
                          <span className={isIncluded ? "text-white/80" : "text-green-500"}>✓</span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Custom Mode Quick Actions */}
                {quizMode === 'custom' && (
                  <div className="flex gap-2 pt-2 border-t border-border/50">
                    <button
                      onClick={() => setSelectedQuizTopics(study.topics?.map(t => t.id) || [])}
                      className="text-xs px-3 py-1.5 rounded-lg bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 transition-colors"
                    >
                      Select All
                    </button>
                    <button
                      onClick={() => setSelectedQuizTopics([])}
                      className="text-xs px-3 py-1.5 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
                    >
                      Clear All
                    </button>
                    <button
                      onClick={() => {
                        const notLearnedIds = study.topics?.filter(t => !t.learned).map(t => t.id) || [];
                        setSelectedQuizTopics(notLearnedIds);
                      }}
                      className="text-xs px-3 py-1.5 rounded-lg bg-orange-500/20 text-orange-400 hover:bg-orange-500/30 transition-colors"
                    >
                      Not Learned
                    </button>
                    <button
                      onClick={() => {
                        const learnedIds = study.topics?.filter(t => t.learned).map(t => t.id) || [];
                        setSelectedQuizTopics(learnedIds);
                      }}
                      className="text-xs px-3 py-1.5 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-colors"
                    >
                      Learned Only
                    </button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quiz History Section */}
        {quizHistory.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-base flex items-center gap-2">
                <History className="h-4 w-4" />
                Quiz History
              </Label>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowHistory(!showHistory)}
              >
                {showHistory ? "Hide" : "Show"} ({quizHistory.length})
              </Button>
            </div>

            {/* Avoid Known Concepts Toggle */}
            <div className="space-y-2">
              <div 
                className={`flex items-center justify-between p-3 rounded-xl border-2 transition-all cursor-pointer ${
                  avoidKnownConcepts 
                    ? "border-green-500/50 bg-green-500/5" 
                    : "border-border bg-card hover:border-muted-foreground/30"
                }`}
                onClick={() => setAvoidKnownConcepts(!avoidKnownConcepts)}
              >
                <div className="flex items-center gap-3">
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-colors ${
                    avoidKnownConcepts ? "bg-green-500/20 text-green-500" : "bg-muted text-muted-foreground"
                  }`}>
                    <Brain className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Skip Known Concepts</p>
                    <p className="text-xs text-muted-foreground">
                      {avoidKnownConcepts 
                        ? `AI will avoid ${masteredConcepts.length} mastered concepts`
                        : "Enable to skip questions you've already mastered"
                      }
                    </p>
                  </div>
                </div>
                <div className={`relative h-6 w-11 rounded-full transition-colors ${
                  avoidKnownConcepts ? "bg-green-500" : "bg-muted"
                }`}>
                  <div className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition-all ${
                    avoidKnownConcepts ? "left-6" : "left-1"
                  }`} />
                </div>
              </div>
              
              {/* View Mastered Concepts Button */}
              {masteredConcepts.length > 0 && (
                <button
                  onClick={() => setShowMasteredConcepts(!showMasteredConcepts)}
                  className="w-full flex items-center justify-between px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    View {masteredConcepts.length} mastered concept{masteredConcepts.length !== 1 ? 's' : ''}
                  </span>
                  <ChevronDown className={`h-4 w-4 transition-transform ${showMasteredConcepts ? 'rotate-180' : ''}`} />
                </button>
              )}
              
              {/* Mastered Concepts List */}
              {showMasteredConcepts && masteredConcepts.length > 0 && (
                <div className="rounded-xl border border-green-500/30 bg-green-500/5 p-3 space-y-2 max-h-80 overflow-y-auto scrollbar-custom">
                  <p className="text-xs font-medium text-green-600 uppercase tracking-wider mb-2">
                    Mastered Concepts ({masteredConcepts.length})
                  </p>
                  {masteredConcepts.map((concept, i) => {
                    // Find topic index for unit number
                    const topicIndex = concept.topicId && study.topics 
                      ? study.topics.findIndex(t => t.id === concept.topicId) 
                      : -1;
                    
                    return (
                      <div 
                        key={i} 
                        className="p-3 rounded-lg bg-background/50 border border-green-500/20"
                      >
                        <div className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                          <div className="flex-1 min-w-0">
                            {/* The correct answer - main content */}
                            <p className="text-sm font-medium text-green-700 dark:text-green-400 leading-snug">
                              {concept.answer}
                            </p>
                            {/* The question as context */}
                            <p className="text-xs text-muted-foreground mt-1 leading-snug">
                              Q: {concept.question}
                            </p>
                            {/* Tags row */}
                            <div className="flex items-center gap-2 mt-2 flex-wrap">
                              {topicIndex >= 0 && (
                                <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                                  Unit {topicIndex + 1}
                                </span>
                              )}
                              {concept.topicTitle && (
                                <span className="text-xs text-muted-foreground">
                                  {concept.topicTitle}
                                </span>
                              )}
                              {concept.count > 1 && (
                                <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/20 text-green-600 font-medium">
                                  ✓ {concept.count}x correct
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            
            {showHistory && (
              <div className="space-y-2 max-h-64 overflow-y-auto scrollbar-custom pr-2">
                {selectedHistoryIds.length > 0 && (
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-primary/10 border border-primary/20 mb-2">
                    <Check className="h-4 w-4 text-primary" />
                    <span className="text-sm text-primary font-medium">
                      {selectedHistoryIds.length} quiz{selectedHistoryIds.length > 1 ? 'zes' : ''} selected - AI will focus on mistakes from these
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="ml-auto h-6 px-2"
                      onClick={() => setSelectedHistoryIds([])}
                    >
                      Clear
                    </Button>
                  </div>
                )}
                {quizHistory.map((entry) => (
                  <div
                    key={entry.id}
                    className={`flex items-center gap-3 p-3 rounded-lg border transition-colors cursor-pointer ${
                      selectedHistoryIds.includes(entry.id)
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                    onClick={() => {
                      if (selectedHistoryIds.includes(entry.id)) {
                        setSelectedHistoryIds(selectedHistoryIds.filter(id => id !== entry.id));
                      } else {
                        setSelectedHistoryIds([...selectedHistoryIds, entry.id]);
                      }
                    }}
                  >
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                      entry.percentage >= 80
                        ? "bg-green-500/20 text-green-500"
                        : entry.percentage >= 60
                          ? "bg-yellow-500/20 text-yellow-500"
                          : "bg-red-500/20 text-red-500"
                    }`}>
                      {entry.percentage}%
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">
                        {entry.correctCount}/{entry.totalQuestions} correct
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(entry.takenAt).toLocaleDateString()} at {new Date(entry.takenAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={(e) => {
                          e.stopPropagation();
                          setViewingHistoryEntry(entry);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteHistoryEntry(entry.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-end gap-4">
          <div className="space-y-2">
            <Label htmlFor="numQuestions">Number of Questions</Label>
            <div className="flex items-center gap-3">
              <Input
                id="numQuestions"
                type="number"
                min={dynamicRecommendation?.min || 3}
                max={dynamicRecommendation?.max || 40}
                value={numQuestions}
                onChange={(e) => setNumQuestions(parseInt(e.target.value) || 10)}
                className="w-24"
              />
              <span className="text-sm text-muted-foreground">
                {dynamicRecommendation && `(${dynamicRecommendation.min}-${dynamicRecommendation.max})`}
              </span>
            </div>
            {dynamicRecommendation && (
              <p className="text-xs text-muted-foreground">
                📊 {dynamicRecommendation.label} - Suggested: {dynamicRecommendation.suggested}
              </p>
            )}
          </div>

          <Button onClick={() => generateQuiz('new')} disabled={quizLoading} size="lg" className="sm:ml-auto">
            {quizLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate Quiz
              </>
            )}
          </Button>
        </div>

        {/* History Detail Modal */}
        {viewingHistoryEntry && (
          <HistoryDetailModal
            entry={viewingHistoryEntry}
            onClose={() => setViewingHistoryEntry(null)}
            onUseForQuiz={() => {
              if (!selectedHistoryIds.includes(viewingHistoryEntry.id)) {
                setSelectedHistoryIds([...selectedHistoryIds, viewingHistoryEntry.id]);
              }
              setViewingHistoryEntry(null);
            }}
          />
        )}
      </div>
    );
  }

  // Results Screen
  if (showResults) {
    return (
      <div className="space-y-6 animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
        {/* Score Card */}
        <Card>
          <CardContent className="py-8">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className={`flex h-32 w-32 shrink-0 items-center justify-center rounded-full ${
                getScore().correct / getScore().total >= 0.8 
                  ? "bg-green-500/20" 
                  : getScore().correct / getScore().total >= 0.6 
                    ? "bg-yellow-500/20" 
                    : "bg-red-500/20"
              }`}>
                <span className={`text-5xl font-bold ${
                  getScore().correct / getScore().total >= 0.8 
                    ? "text-green-500" 
                    : getScore().correct / getScore().total >= 0.6 
                      ? "text-yellow-500" 
                      : "text-red-500"
                }`}>
                  {Math.round((getScore().correct / getScore().total) * 100)}%
                </span>
              </div>
              <div className="text-center sm:text-left">
                <h2 className="text-2xl font-bold text-foreground mb-2">Quiz Complete! 🎉</h2>
                <p className="text-lg text-muted-foreground">
                  You scored <span className="font-semibold text-foreground">{getScore().correct}</span> out of <span className="font-semibold text-foreground">{getScore().total}</span> questions
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {getScore().correct / getScore().total >= 0.8 
                    ? "Excellent work! You've mastered this material." 
                    : getScore().correct / getScore().total >= 0.6 
                      ? "Good job! Keep practicing to improve." 
                      : "Keep studying! Review the material and try again."}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* AI Analysis Card */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">AI Analysis</CardTitle>
              </div>
              {!quizAnalysis && !analysisLoading && (
                <Button 
                  onClick={analyzeQuizResults} 
                  size="sm"
                  variant="outline"
                >
                  <Brain className="mr-2 h-4 w-4" />
                  Analyze Results
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {analysisLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary mr-3" />
                <span className="text-muted-foreground">Analyzing your results...</span>
              </div>
            ) : quizAnalysis ? (
              <div className="analysis-content">
                <ReactMarkdown 
                  remarkPlugins={[remarkGfm]}
                  components={{
                    h2: ({ children }) => (
                      <h2 className="mb-3 mt-6 first:mt-0 text-xl font-semibold text-foreground border-b border-border pb-2">
                        {children}
                      </h2>
                    ),
                    h3: ({ children }) => (
                      <h3 className="mb-2 mt-4 text-lg font-semibold text-primary">
                        {children}
                      </h3>
                    ),
                    p: ({ children }) => (
                      <p className="mb-3 leading-relaxed text-foreground/90">{children}</p>
                    ),
                    ul: ({ children }) => (
                      <ul className="mb-4 space-y-2 pl-0 list-none">
                        {children}
                      </ul>
                    ),
                    ol: ({ children }) => (
                      <ol className="mb-4 space-y-2 pl-0 list-none">
                        {children}
                      </ol>
                    ),
                    li: ({ children }) => (
                      <li className="relative pl-6 leading-relaxed">
                        <span className="absolute left-0 text-primary font-bold">•</span>
                        {children}
                      </li>
                    ),
                    strong: ({ children }) => (
                      <strong className="font-semibold text-primary">{children}</strong>
                    ),
                    table: ({ children }) => (
                      <div className="my-4 overflow-x-auto rounded-xl border border-border">
                        <table className="w-full border-collapse">
                          {children}
                        </table>
                      </div>
                    ),
                    thead: ({ children }) => (
                      <thead className="bg-primary/10">{children}</thead>
                    ),
                    th: ({ children }) => (
                      <th className="border-b-2 border-primary/20 px-4 py-3 text-left text-sm font-bold text-foreground">
                        {children}
                      </th>
                    ),
                    td: ({ children }) => (
                      <td className="border-b border-border/50 px-4 py-3 text-sm">{children}</td>
                    ),
                    tr: ({ children }) => (
                      <tr className="even:bg-muted/30">{children}</tr>
                    ),
                    blockquote: ({ children }) => (
                      <blockquote className="my-4 rounded-r-lg border-l-4 border-primary bg-primary/5 py-3 pl-4 pr-4 italic">
                        {children}
                      </blockquote>
                    ),
                    code: ({ children }) => (
                      <code className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-sm text-primary">
                        {children}
                      </code>
                    ),
                  }}
                >
                  {quizAnalysis}
                </ReactMarkdown>
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-4">
                Click "Analyze Results" to get personalized feedback on your performance
              </p>
            )}
          </CardContent>
        </Card>

        {/* Questions Review */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Question Review</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-[500px] overflow-y-auto scrollbar-custom pr-2">
              {study.quizQuestions?.map((q, i) => (
                <div
                  key={i}
                  className={`rounded-xl border p-4 transition-colors ${
                    selectedAnswers[i] === q.correctAnswer
                      ? "border-green-500/30 bg-green-500/5"
                      : "border-red-500/30 bg-red-500/5"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                      selectedAnswers[i] === q.correctAnswer
                        ? "bg-green-500 text-white"
                        : "bg-red-500 text-white"
                    }`}>
                      {selectedAnswers[i] === q.correctAnswer ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : (
                        <XCircle className="h-4 w-4" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground text-sm leading-relaxed">{q.question}</p>
                      {selectedAnswers[i] !== q.correctAnswer && (
                        <p className="mt-2 text-red-400 text-sm">
                          ✗ Your answer: {q.options[selectedAnswers[i] ?? 0]}
                        </p>
                      )}
                      <p className="mt-1 text-green-400 text-sm">
                        ✓ Correct: {q.options[q.correctAnswer]}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <Card>
          <CardContent className="py-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Button 
                onClick={regenerateQuiz} 
                variant="outline"
                className="w-full"
              >
                <Sparkles className="mr-2 h-4 w-4" />
                New Quiz
              </Button>
              <Button 
                onClick={() => generateQuiz('same_topics')} 
                disabled={quizLoading}
                variant="outline"
                className="w-full"
              >
                {quizLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <RotateCcw className="mr-2 h-4 w-4" />
                )}
                Same Topics
              </Button>
              <Button 
                onClick={() => generateQuiz('wrong_concepts')} 
                disabled={quizLoading || getScore().correct === getScore().total}
                className="w-full"
              >
                {quizLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Brain className="mr-2 h-4 w-4" />
                )}
                Focus on Mistakes
              </Button>
            </div>
            <p className="text-xs text-muted-foreground text-center mt-3">
              {getScore().correct === getScore().total 
                ? "Perfect score! Try a new quiz or same topics for more practice."
                : `"Focus on Mistakes" will generate questions about concepts you got wrong.`
              }
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Active Quiz Screen
  return (
    <Card className="overflow-hidden">
      {/* Progress bar at top */}
      <div className="h-1 w-full bg-muted">
        <div 
          className="h-full bg-primary transition-all duration-500 ease-out"
          style={{ width: `${((currentQuestion + 1) / (study.quizQuestions?.length || 1)) * 100}%` }}
        />
      </div>
      <CardHeader className="pb-3">
        <div className="mb-3 flex items-center justify-between">
          {/* Question Selector */}
          <div className="relative" ref={questionSelectorRef}>
            <button
              onClick={() => setShowQuestionSelector(!showQuestionSelector)}
              className="flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-2 hover:bg-muted transition-colors"
            >
              {/* Progress Ring */}
              <div className="relative h-8 w-1.5">
                <div className="absolute inset-0 rounded-full bg-muted" />
                <div 
                  className="absolute bottom-0 left-0 right-0 rounded-full bg-primary transition-all duration-500"
                  style={{ height: `${((currentQuestion + 1) / (study.quizQuestions?.length || 1)) * 100}%` }}
                />
              </div>
              <div className="text-left">
                <p className="text-[10px] text-muted-foreground leading-none">Question</p>
                <div className="flex items-baseline gap-0.5">
                  <span className="text-lg font-bold leading-tight">{currentQuestion + 1}</span>
                  <ChevronDown className={`h-3 w-3 text-muted-foreground transition-transform ${showQuestionSelector ? 'rotate-180' : ''}`} />
                  <span className="text-sm text-muted-foreground">/ {study.quizQuestions?.length}</span>
                </div>
              </div>
            </button>
            
            {/* Dropdown */}
            {showQuestionSelector && (
              <div className="absolute left-0 top-full z-50 mt-1 w-52 rounded-lg border border-border bg-card p-1.5 shadow-lg animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="max-h-48 overflow-y-auto scrollbar-custom">
                  <div className="grid grid-cols-6 gap-1">
                    {study.quizQuestions?.map((_, i) => {
                      const qIsAnswered = answeredQuestions[i];
                      const isCorrect = selectedAnswers[i] === study.quizQuestions![i].correctAnswer;
                      const isCurrent = i === currentQuestion;
                      
                      let bgClass = "bg-muted hover:bg-muted/80";
                      if (isCurrent) bgClass = "bg-primary text-primary-foreground";
                      else if (qIsAnswered && isCorrect) bgClass = "bg-green-500 text-white";
                      else if (qIsAnswered && !isCorrect) bgClass = "bg-red-500 text-white";
                      
                      return (
                        <button
                          key={i}
                          onClick={() => goToQuestion(i)}
                          className={`flex h-7 w-7 items-center justify-center rounded text-xs font-medium transition-colors ${bgClass}`}
                        >
                          {i + 1}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* New Quiz Button */}
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
            onClick={regenerateQuiz}
          >
            <RotateCcw className="mr-1 h-3 w-3" />
            New Quiz
          </Button>
        </div>
        <CardTitle 
          className={`text-lg transition-all duration-300 ${
            isTransitioning ? "opacity-0 translate-y-2" : "opacity-100 translate-y-0"
          }`}
        >
          {currentQ?.question}
        </CardTitle>
      </CardHeader>
      <CardContent 
        className={`space-y-4 transition-all duration-300 ${
          isTransitioning ? "opacity-0 translate-y-2" : "opacity-100 translate-y-0"
        }`}
      >
        <div className="space-y-3">
          {currentQ?.options.map((option, i) => {
            const isCorrect = i === currentQ.correctAnswer;
            const isSelected = selectedAnswer === i;
            const letters = ['A', 'B', 'C', 'D', 'E', 'F'];
            let optionClass = "border-border hover:border-primary/50";
            let letterClass = "bg-muted text-muted-foreground";

            if (isAnswered) {
              if (isCorrect) {
                optionClass = "border-green-500 bg-green-500/10";
                letterClass = "bg-green-500 text-white";
              } else if (isSelected) {
                optionClass = "border-red-500 bg-red-500/10";
                letterClass = "bg-red-500 text-white";
              }
            } else if (isSelected) {
              optionClass = "border-primary bg-primary/10";
              letterClass = "bg-primary text-primary-foreground";
            }

            // Remove the option letter prefix if it exists (e.g., "A) " or "A. ")
            const cleanOption = option.replace(/^[A-Za-z][).\s]+/, '').trim();

            return (
              <div
                key={i}
                className={`flex cursor-pointer items-center gap-4 rounded-2xl border p-4 transition-all ${optionClass} hover:opacity-80`}
                onClick={() => handleAnswerSelect(i)}
              >
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold transition-colors ${letterClass}`}>
                  {letters[i]}
                </div>
                <span className="flex-1 text-sm font-medium">{cleanOption}</span>
                {isAnswered && isCorrect && <CheckCircle className="h-5 w-5 text-green-500" />}
                {isAnswered && isSelected && !isCorrect && <XCircle className="h-5 w-5 text-red-500" />}
              </div>
            );
          })}
        </div>

        {!isAnswered && currentQ?.hint && (
          <div>
            {!showHint ? (
              <Button variant="ghost" size="sm" onClick={() => setShowHint(true)}>
                <Lightbulb className="mr-2 h-4 w-4" />
                Show Hint
              </Button>
            ) : (
              <div className="animate-in fade-in rounded-lg bg-amber-500/10 border border-amber-500/30 p-3">
                <p className="text-sm">💡 {currentQ.hint}</p>
              </div>
            )}
          </div>
        )}

        {isAnswered && currentQ?.explanation && (
          <div className="animate-in fade-in rounded-lg bg-muted p-3">
            <p className="text-sm">💡 {currentQ.explanation}</p>
          </div>
        )}

        <div className="flex justify-between pt-2">
          <Button 
            variant="outline" 
            onClick={prevQuestion} 
            disabled={currentQuestion === 0}
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            Previous
          </Button>
          <Button onClick={nextQuestion}>
            {currentQuestion < (study.quizQuestions?.length || 1) - 1 ? "Next" : "Results"}
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// History Detail Modal Component
function HistoryDetailModal({ 
  entry, 
  onClose, 
  onUseForQuiz 
}: { 
  entry: QuizHistoryEntry; 
  onClose: () => void; 
  onUseForQuiz: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className={`flex h-12 w-12 items-center justify-center rounded-full text-lg font-bold ${
              entry.percentage >= 80
                ? "bg-green-500/20 text-green-500"
                : entry.percentage >= 60
                  ? "bg-yellow-500/20 text-yellow-500"
                  : "bg-red-500/20 text-red-500"
            }`}>
              {entry.percentage}%
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Quiz Results</h3>
              <p className="text-sm text-muted-foreground">
                {new Date(entry.takenAt).toLocaleDateString()} at {new Date(entry.takenAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {entry.correctCount}/{entry.totalQuestions} correct
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-4 overflow-y-auto max-h-[60vh] scrollbar-custom space-y-3">
          {entry.answers.map((answer, i) => (
            <div
              key={i}
              className={`rounded-xl border p-4 ${
                answer.isCorrect
                  ? "border-green-500/30 bg-green-500/5"
                  : "border-red-500/30 bg-red-500/5"
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                  answer.isCorrect
                    ? "bg-green-500 text-white"
                    : "bg-red-500 text-white"
                }`}>
                  {answer.isCorrect ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <XCircle className="h-4 w-4" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground text-sm leading-relaxed mb-2">
                    {i + 1}. {answer.question}
                  </p>
                  {!answer.isCorrect && answer.userAnswer >= 0 && (
                    <p className="text-red-400 text-sm mb-1">
                      ✗ Your answer: {answer.options[answer.userAnswer]}
                    </p>
                  )}
                  <p className="text-green-400 text-sm">
                    ✓ Correct: {answer.options[answer.correctAnswer]}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between p-4 border-t border-border bg-muted/30">
          <Button
            variant="outline"
            onClick={onUseForQuiz}
          >
            <Check className="mr-2 h-4 w-4" />
            Use for Next Quiz
          </Button>
          <Button
            variant="ghost"
            onClick={onClose}
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}

