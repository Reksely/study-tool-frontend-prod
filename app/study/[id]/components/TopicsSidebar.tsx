"use client";

import { useRef, useEffect, useState } from "react";
import { Check } from "lucide-react";
import { Study, Topic } from "../types";

const API_URL = "http://localhost:3005/api";

interface TopicsSidebarProps {
  study: Study;
  setStudy: React.Dispatch<React.SetStateAction<Study | null>>;
  studyId: string;
  selectedTopic: string | null;
  setSelectedTopic: (topicId: string | null) => void;
  documentContentRef: React.RefObject<HTMLDivElement | null>;
  activeScrollTopic: string | null;
  setActiveScrollTopic: (topicId: string | null) => void;
}

export function TopicsSidebar({
  study,
  setStudy,
  studyId,
  selectedTopic,
  setSelectedTopic,
  documentContentRef,
  activeScrollTopic,
  setActiveScrollTopic,
}: TopicsSidebarProps) {

  // Scroll tracking for topic highlighting
  useEffect(() => {
    if (!study.topics || study.topics.length <= 1 || selectedTopic) return;

    const contentContainer = documentContentRef.current;
    if (!contentContainer) return;

    const handleScroll = () => {
      const headers = contentContainer.querySelectorAll('h1');
      if (headers.length === 0) return;

      const containerRect = contentContainer.getBoundingClientRect();
      
      let currentTopicIndex = 0;
      
      headers.forEach((header, index) => {
        const headerRect = header.getBoundingClientRect();
        const relativeTop = headerRect.top - containerRect.top;
        
        // If header is above the middle of the viewport, we're past it
        if (relativeTop < containerRect.height / 3) {
          currentTopicIndex = index;
        }
      });

      const topicId = study.topics?.[currentTopicIndex]?.id || null;
      if (topicId !== activeScrollTopic) {
        setActiveScrollTopic(topicId);
      }
    };

    contentContainer.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial check

    return () => {
      contentContainer.removeEventListener('scroll', handleScroll);
    };
  }, [study.topics, selectedTopic, activeScrollTopic, documentContentRef]);

  const toggleTopicLearned = (topicId: string, learned: boolean) => {
    // Optimistic update - instant UI change
    setStudy(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        topics: prev.topics?.map(t => 
          t.id === topicId ? { ...t, learned } : t
        ),
      };
    });

    // Sync with server in background (fire and forget)
    fetch(`${API_URL}/studies/${studyId}/topics/${topicId}/learned`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ learned }),
    }).catch(err => console.error("Failed to sync topic status:", err));
  };

  const markAllTopicsLearned = (learned: boolean) => {
    if (!study.topics) return;
    
    // Optimistic update - instant UI change
    setStudy(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        topics: prev.topics?.map(t => ({ ...t, learned })),
      };
    });

    // Sync with server in background
    const topicIds = study.topics.map(t => t.id);
    fetch(`${API_URL}/studies/${studyId}/topics/learned`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ topicIds, learned }),
    }).catch(err => console.error("Failed to sync topics status:", err));
  };

  if (!study.topics || study.topics.length <= 1) {
    return null;
  }

  return (
    <div className="w-64 shrink-0 border-r border-border bg-card/50 overflow-y-auto scrollbar-custom">
      <div className="p-3">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Topics</h3>
          <div className="flex gap-1">
            <button
              onClick={() => markAllTopicsLearned(true)}
              className="text-xs px-2 py-1 rounded bg-green-500/10 text-green-500 hover:bg-green-500/20 transition-colors"
              title="Mark all as learned"
            >
              ✓ All
            </button>
            <button
              onClick={() => markAllTopicsLearned(false)}
              className="text-xs px-2 py-1 rounded bg-muted hover:bg-muted/80 transition-colors"
              title="Mark all as not learned"
            >
              Reset
            </button>
          </div>
        </div>
        <div className="space-y-1">
          <button
            onClick={() => {
              setSelectedTopic(null);
              setActiveScrollTopic(null);
              documentContentRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
              selectedTopic === null && !activeScrollTopic
                ? "bg-primary text-primary-foreground" 
                : "hover:bg-muted text-foreground"
            }`}
          >
            <span>📑</span>
            <span className="truncate">All Topics</span>
          </button>
          {study.topics.map((topic, index) => {
            const isSelected = selectedTopic === topic.id;
            const isScrollActive = !selectedTopic && activeScrollTopic === topic.id;
            const isLearned = topic.learned ?? false;
            
            return (
              <div
                key={topic.id}
                className={`relative flex items-center gap-2 rounded-lg text-sm transition-all duration-200 ${
                  isSelected
                    ? "bg-primary text-primary-foreground" 
                    : isScrollActive
                      ? "bg-primary/20 text-foreground border-l-2 border-primary"
                      : "hover:bg-muted text-foreground"
                }`}
              >
                <button
                  onClick={() => {
                    if (selectedTopic) {
                      setSelectedTopic(topic.id);
                    } else {
                      const container = documentContentRef.current;
                      const headers = container?.querySelectorAll('h1');
                      if (container && headers && headers[index]) {
                        // Calculate scroll position relative to the container using getBoundingClientRect
                        const containerRect = container.getBoundingClientRect();
                        const headerRect = headers[index].getBoundingClientRect();
                        const scrollTop = container.scrollTop + (headerRect.top - containerRect.top) - 20;
                        container.scrollTo({ top: scrollTop, behavior: 'smooth' });
                      }
                    }
                  }}
                  className="flex-1 flex items-center gap-2 px-3 py-2 text-left"
                >
                  <span>{topic.icon}</span>
                  <span className="truncate flex-1">Unit {index + 1}</span>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleTopicLearned(topic.id, !isLearned);
                  }}
                  className={`mr-2 flex h-5 w-5 shrink-0 items-center justify-center rounded-full transition-colors ${
                    isLearned
                      ? "bg-green-500 text-white"
                      : "bg-muted-foreground/20 hover:bg-muted-foreground/30"
                  }`}
                  title={isLearned ? "Learned - click to unmark" : "Not learned - click to mark as learned"}
                >
                  {isLearned && <Check className="h-3 w-3" />}
                </button>
                {isScrollActive && (
                  <span className="absolute right-8 h-2 w-2 rounded-full bg-primary animate-pulse" />
                )}
              </div>
            );
          })}
        </div>
        {/* Legend */}
        <div className="mt-4 pt-3 border-t border-border">
          <p className="text-xs text-muted-foreground mb-2">Learning Progress</p>
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1">
              <div className="h-3 w-3 rounded-full bg-green-500" />
              <span className="text-muted-foreground">Learned</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="h-3 w-3 rounded-full bg-muted-foreground/20" />
              <span className="text-muted-foreground">Not learned</span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {study.topics.filter(t => t.learned).length}/{study.topics.length} completed
          </p>
        </div>
      </div>
    </div>
  );
}

