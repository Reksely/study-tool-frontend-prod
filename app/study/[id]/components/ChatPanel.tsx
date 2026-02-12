"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  FileText,
  Brain,
  Loader2,
  Send,
  MessageCircle,
  PanelRightClose,
  Trash2,
  GraduationCap,
  HelpCircle,
  Lightbulb,
  ListChecks,
} from "lucide-react";
import { Study, ChatMessage, QuizQuestion, Topic } from "../types";

const API_URL = "http://localhost:3005/api";

interface ChatPanelProps {
  study: Study;
  studyId: string;
  activeTab: string;
  currentQuizQuestion?: QuizQuestion | null;
  hasAnswered?: boolean;
  selectedAnswer?: number | null;
  currentTopicIndex?: number | null;
  onClose: () => void;
  handleMouseDown: (e: React.MouseEvent) => void;
}

export function ChatPanel({
  study,
  studyId,
  activeTab,
  currentQuizQuestion,
  hasAnswered,
  selectedAnswer,
  currentTopicIndex,
  onClose,
  handleMouseDown,
}: ChatPanelProps) {
  const [documentChatMessages, setDocumentChatMessages] = useState<ChatMessage[]>(
    study.documentChatHistory || []
  );
  const [quizChatMessages, setQuizChatMessages] = useState<ChatMessage[]>(
    study.quizChatHistory || []
  );
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const chatMessagesRef = useRef<HTMLDivElement>(null);
  const chatPanelRef = useRef<HTMLDivElement>(null);

  // Get current chat messages based on active tab
  const currentChatMessages = activeTab === "quiz" ? quizChatMessages : documentChatMessages;

  // Scroll to bottom when messages change
  useEffect(() => {
    if (chatMessagesRef.current) {
      chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
    }
  }, [documentChatMessages, quizChatMessages, activeTab]);

  // Load chat history when tab changes
  useEffect(() => {
    loadChatHistory(activeTab);
  }, [activeTab, studyId]);

  const loadChatHistory = async (tab: string) => {
    try {
      const res = await fetch(`${API_URL}/studies/${studyId}/chat/${tab}`, {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        if (tab === "quiz") {
          setQuizChatMessages(data.messages || []);
        } else {
          setDocumentChatMessages(data.messages || []);
        }
      }
    } catch (err) {
      console.error("Failed to load chat history:", err);
    }
  };

  const sendChatMessage = async () => {
    if (!chatInput.trim()) return;

    const userMessage = chatInput.trim();
    setChatInput("");
    
    // Add user message to current chat
    const newUserMsg: ChatMessage = { role: "user", content: userMessage };
    if (activeTab === "quiz") {
      setQuizChatMessages((prev) => [...prev, newUserMsg]);
    } else {
      setDocumentChatMessages((prev) => [...prev, newUserMsg]);
    }
    
    setChatLoading(true);

    // Add empty assistant message that will be streamed into
    const streamingMsg: ChatMessage = { role: "assistant", content: "" };
    if (activeTab === "quiz") {
      setQuizChatMessages((prev) => [...prev, streamingMsg]);
    } else {
      setDocumentChatMessages((prev) => [...prev, streamingMsg]);
    }

    try {
      const isCorrect = selectedAnswer !== null && selectedAnswer !== undefined && currentQuizQuestion 
        ? selectedAnswer === currentQuizQuestion.correctAnswer 
        : null;

      const response = await fetch(`${API_URL}/studies/${studyId}/chat/stream`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          message: userMessage,
          activeTab,
          currentQuizQuestion: activeTab === "quiz" && currentQuizQuestion ? {
            question: currentQuizQuestion.question,
            options: currentQuizQuestion.options,
            hasAnswered,
            selectedOption: selectedAnswer !== null && selectedAnswer !== undefined ? currentQuizQuestion.options[selectedAnswer] : null,
            isCorrect,
            correctAnswer: hasAnswered ? currentQuizQuestion.options[currentQuizQuestion.correctAnswer] : null,
          } : null,
        }),
      });

      if (!response.ok) throw new Error("Failed to get response");

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) throw new Error("No reader available");

      let fullContent = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n').filter(line => line.startsWith('data: '));

        for (const line of lines) {
          const data = line.slice(6); // Remove 'data: ' prefix
          try {
            const parsed = JSON.parse(data);
            if (parsed.content) {
              fullContent += parsed.content;
              // Update the last message with streamed content
              if (activeTab === "quiz") {
                setQuizChatMessages((prev) => {
                  const updated = [...prev];
                  updated[updated.length - 1] = { role: "assistant", content: fullContent };
                  return updated;
                });
              } else {
                setDocumentChatMessages((prev) => {
                  const updated = [...prev];
                  updated[updated.length - 1] = { role: "assistant", content: fullContent };
                  return updated;
                });
              }
            }
            if (parsed.error) {
              throw new Error(parsed.error);
            }
          } catch (e) {
            // Ignore parse errors for incomplete chunks
          }
        }
      }
    } catch (err) {
      console.error("Chat error:", err);
      // Update the streaming message with error
      const errorContent = "Sorry, I couldn't process your question. Please try again.";
      if (activeTab === "quiz") {
        setQuizChatMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = { role: "assistant", content: errorContent };
          return updated;
        });
      } else {
        setDocumentChatMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = { role: "assistant", content: errorContent };
          return updated;
        });
      }
    } finally {
      setChatLoading(false);
    }
  };

  const clearChat = async () => {
    try {
      await fetch(`${API_URL}/studies/${studyId}/chat/${activeTab}`, {
        method: "DELETE",
        credentials: "include",
      });
      
      if (activeTab === "quiz") {
        setQuizChatMessages([]);
      } else {
        setDocumentChatMessages([]);
      }
    } catch (err) {
      console.error("Failed to clear chat:", err);
    }
  };

  // Quick action to send a predefined message
  const sendQuickMessage = async (message: string) => {
    // Add user message to current chat
    const newUserMsg: ChatMessage = { role: "user", content: message };
    if (activeTab === "quiz") {
      setQuizChatMessages((prev) => [...prev, newUserMsg]);
    } else {
      setDocumentChatMessages((prev) => [...prev, newUserMsg]);
    }
    
    setChatLoading(true);

    // Add empty assistant message that will be streamed into
    const streamingMsg: ChatMessage = { role: "assistant", content: "" };
    if (activeTab === "quiz") {
      setQuizChatMessages((prev) => [...prev, streamingMsg]);
    } else {
      setDocumentChatMessages((prev) => [...prev, streamingMsg]);
    }

    try {
      const isCorrect = selectedAnswer !== null && selectedAnswer !== undefined && currentQuizQuestion 
        ? selectedAnswer === currentQuizQuestion.correctAnswer 
        : null;

      const response = await fetch(`${API_URL}/studies/${studyId}/chat/stream`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          message,
          activeTab,
          currentQuizQuestion: activeTab === "quiz" && currentQuizQuestion ? {
            question: currentQuizQuestion.question,
            options: currentQuizQuestion.options,
            hasAnswered,
            selectedOption: selectedAnswer !== null && selectedAnswer !== undefined ? currentQuizQuestion.options[selectedAnswer] : null,
            isCorrect,
            correctAnswer: hasAnswered ? currentQuizQuestion.options[currentQuizQuestion.correctAnswer] : null,
          } : null,
        }),
      });

      if (!response.ok) throw new Error("Failed to get response");

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) throw new Error("No reader available");

      let fullContent = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n').filter(line => line.startsWith('data: '));

        for (const line of lines) {
          const data = line.slice(6);
          try {
            const parsed = JSON.parse(data);
            if (parsed.content) {
              fullContent += parsed.content;
              if (activeTab === "quiz") {
                setQuizChatMessages((prev) => {
                  const updated = [...prev];
                  updated[updated.length - 1] = { role: "assistant", content: fullContent };
                  return updated;
                });
              } else {
                setDocumentChatMessages((prev) => {
                  const updated = [...prev];
                  updated[updated.length - 1] = { role: "assistant", content: fullContent };
                  return updated;
                });
              }
            }
          } catch (e) {
            // Ignore parse errors
          }
        }
      }
    } catch (err) {
      console.error("Chat error:", err);
      const errorContent = "Sorry, I couldn't process your question. Please try again.";
      if (activeTab === "quiz") {
        setQuizChatMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = { role: "assistant", content: errorContent };
          return updated;
        });
      } else {
        setDocumentChatMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = { role: "assistant", content: errorContent };
          return updated;
        });
      }
    } finally {
      setChatLoading(false);
    }
  };

  // Get current topic for quick actions
  const currentTopic = currentTopicIndex !== null && currentTopicIndex !== undefined && study.topics 
    ? study.topics[currentTopicIndex] 
    : null;
  const unitNumber = currentTopicIndex !== null && currentTopicIndex !== undefined 
    ? currentTopicIndex + 1 
    : null;

  // Quick action buttons based on context
  const getQuickActions = () => {
    if (activeTab === "quiz") {
      return [
        { label: "Explain this question", icon: HelpCircle, message: "Can you explain this question to me?" },
        { label: "Give me a hint", icon: Lightbulb, message: "Give me a hint without revealing the answer" },
        { label: "Why is this correct?", icon: GraduationCap, message: "Why is the correct answer correct? Explain the concept." },
      ];
    } else {
      const actions = [];
      if (unitNumber && currentTopic) {
        actions.push({ 
          label: `Teach me Unit ${unitNumber}`, 
          icon: GraduationCap, 
          message: `Teach me about Unit ${unitNumber}: ${currentTopic.title}` 
        });
      }
      actions.push(
        { label: "Summarize this", icon: ListChecks, message: "Give me a concise summary of this document" },
        { label: "Key concepts", icon: Lightbulb, message: "What are the key concepts I should understand from this material?" },
        { label: "Quiz me", icon: HelpCircle, message: "Ask me some questions to test my understanding" },
      );
      return actions;
    }
  };

  return (
    <>
      {/* Resizable Divider */}
      <div
        className="relative cursor-col-resize select-none transition-all duration-700 ease-in-out"
        style={{ width: 12 }}
        onMouseDown={handleMouseDown}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-16 w-1 rounded-full bg-muted-foreground/30 hover:bg-muted-foreground/50 transition-colors" />
        </div>
      </div>

      {/* Chat Panel */}
      <div 
        ref={chatPanelRef}
        style={{ width: 384 }}
        className="shrink-0 border-l border-border bg-card flex flex-col overflow-hidden animate-in slide-in-from-right duration-300"
      >
        {/* Chat Header */}
        <div className="shrink-0 border-b border-border p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                {activeTab === "quiz" ? (
                  <Brain className="h-4 w-4 text-primary" />
                ) : (
                  <FileText className="h-4 w-4 text-primary" />
                )}
              </div>
              <div>
                <h3 className="font-semibold text-sm">
                  {activeTab === "quiz" ? "Quiz Assistant" : "Document Assistant"}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {activeTab === "quiz" 
                    ? "Ask about the current question" 
                    : "Ask about the document"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {currentChatMessages.length > 0 && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  onClick={clearChat}
                  title="Clear chat"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={onClose}
              >
                <PanelRightClose className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Chat Messages */}
        <div ref={chatMessagesRef} className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4 scrollbar-custom">
          {currentChatMessages.length === 0 ? (
            <div className="text-center text-muted-foreground text-sm py-6">
              <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="mb-4">
                {activeTab === "quiz" 
                  ? "Ask me anything about the current question!" 
                  : "Ask me anything about your study material!"}
              </p>
              
              {/* Quick Action Buttons */}
              <div className="space-y-2 text-left">
                <p className="text-xs text-muted-foreground/70 uppercase tracking-wider font-medium text-center mb-3">
                  Quick Actions
                </p>
                {getQuickActions().map((action, i) => (
                  <button
                    key={i}
                    onClick={() => sendQuickMessage(action.message)}
                    disabled={chatLoading}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border border-border bg-background hover:bg-muted hover:border-primary/30 transition-all text-left group disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
                      <action.icon className="h-4 w-4" />
                    </div>
                    <span className="text-sm font-medium text-foreground">{action.label}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            currentChatMessages.map((msg, i) => {
              // Skip rendering empty assistant messages (they're being streamed)
              if (msg.role === "assistant" && msg.content === "") {
                return null;
              }
              return (
                <div
                  key={i}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-2 ${
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    {msg.role === "user" ? (
                      <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    ) : (
                      <div className="text-sm prose prose-sm prose-invert dark:prose-invert max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm, remarkMath]}
                          rehypePlugins={[rehypeKatex]}
                          components={{
                            p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                            ul: ({ children }) => <ul className="mb-2 list-disc pl-4 space-y-1">{children}</ul>,
                            ol: ({ children }) => <ol className="mb-2 list-decimal pl-4 space-y-1">{children}</ol>,
                            li: ({ children }) => <li>{children}</li>,
                            strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                            code: ({ children }) => <code className="rounded bg-background/50 px-1 py-0.5 font-mono text-xs">{children}</code>,
                          }}
                        >
                          {msg.content
                            .replace(/\\\[/g, '$$')
                            .replace(/\\\]/g, '$$')
                            .replace(/\[ /g, '$$')
                            .replace(/ \]/g, '$$')
                            .replace(/^\[([^\]]+)\]$/gm, '$$$1$$')
                          }
                        </ReactMarkdown>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
          {chatLoading && currentChatMessages.length > 0 && currentChatMessages[currentChatMessages.length - 1].content === "" && (
            <div className="flex justify-start">
              <div className="rounded-2xl bg-muted px-4 py-3">
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Chat Input */}
        <div className="shrink-0 border-t border-border p-4">
          <div className="flex items-end gap-2 rounded-2xl border border-border bg-background p-2">
            <Textarea
              placeholder={
                activeTab === "quiz"
                  ? "Ask about this question..."
                  : "Ask about the document..."
              }
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendChatMessage();
                }
              }}
              className="min-h-[40px] max-h-32 resize-none border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
              rows={1}
            />
            <Button
              size="icon"
              className="h-8 w-8 shrink-0"
              onClick={sendChatMessage}
              disabled={!chatInput.trim() || chatLoading}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

