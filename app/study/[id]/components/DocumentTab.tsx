"use client";

import { useRef, useEffect, useCallback, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Search, ChevronLeft, ChevronRight, X } from "lucide-react";
import { Study, Topic } from "../types";

interface DocumentTabProps {
  study: Study;
  selectedTopic: string | null;
  scrollContainerRef: React.RefObject<HTMLDivElement | null>;
}

// Helper function to escape regex special characters
function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function DocumentTab({ study, selectedTopic, scrollContainerRef }: DocumentTabProps) {
  const documentContentRef = useRef<HTMLDivElement>(null);
  const documentSearchInputRef = useRef<HTMLInputElement>(null);
  
  // Document search state
  const [showDocumentSearch, setShowDocumentSearch] = useState(false);
  const [documentSearchQuery, setDocumentSearchQuery] = useState("");
  const [activeSearchQuery, setActiveSearchQuery] = useState(""); // The actual query being highlighted
  const [searchMatches, setSearchMatches] = useState<{ index: number; total: number }>({ index: 0, total: 0 });
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);

  const currentTopic = selectedTopic && study.topics 
    ? study.topics.find(t => t.id === selectedTopic) 
    : null;

  // Helper to scroll element into view within the scroll container
  const scrollToElement = useCallback((element: Element | null, block: 'start' | 'center' = 'center') => {
    if (!element || !scrollContainerRef.current) return;
    
    const container = scrollContainerRef.current;
    const containerRect = container.getBoundingClientRect();
    const elementRect = element.getBoundingClientRect();
    
    let targetScrollTop: number;
    if (block === 'center') {
      // Center the element in the container
      targetScrollTop = container.scrollTop + (elementRect.top - containerRect.top) - (containerRect.height / 2) + (elementRect.height / 2);
    } else {
      // Align to top with some padding
      targetScrollTop = container.scrollTop + (elementRect.top - containerRect.top) - 20;
    }
    
    container.scrollTo({ top: targetScrollTop, behavior: 'smooth' });
  }, [scrollContainerRef]);

  // Count matches in content
  const countMatches = useCallback((content: string, query: string) => {
    if (!query.trim()) return 0;
    const regex = new RegExp(escapeRegExp(query), 'gi');
    const matches = content.match(regex);
    return matches ? matches.length : 0;
  }, []);

  // Update active search query with debounce
  useEffect(() => {
    if (showDocumentSearch) {
      const debounceTimer = setTimeout(() => {
        setActiveSearchQuery(documentSearchQuery);
        setCurrentMatchIndex(0);
        
        // Count matches
        const content = currentTopic?.content || study.content;
        const total = countMatches(content, documentSearchQuery);
        setSearchMatches({ index: total > 0 ? 1 : 0, total });
      }, 150);
      return () => clearTimeout(debounceTimer);
    } else {
      setActiveSearchQuery("");
      setSearchMatches({ index: 0, total: 0 });
    }
  }, [documentSearchQuery, showDocumentSearch, study.content, currentTopic?.content, countMatches]);

  // Scroll to current match when it changes
  useEffect(() => {
    if (activeSearchQuery && searchMatches.total > 0) {
      setTimeout(() => {
        const container = documentContentRef.current;
        if (!container) return;
        
        const highlights = container.querySelectorAll('.search-highlight');
        if (highlights.length > 0 && highlights[currentMatchIndex]) {
          scrollToElement(highlights[currentMatchIndex], 'center');
        }
      }, 50);
    }
  }, [activeSearchQuery, currentMatchIndex, scrollToElement, searchMatches.total]);

  const navigateSearch = useCallback((direction: 'next' | 'prev') => {
    if (searchMatches.total === 0) return;

    let newIndex = currentMatchIndex;
    if (direction === 'next') {
      newIndex = (currentMatchIndex + 1) % searchMatches.total;
    } else {
      newIndex = currentMatchIndex === 0 ? searchMatches.total - 1 : currentMatchIndex - 1;
    }

    setCurrentMatchIndex(newIndex);
    setSearchMatches({ ...searchMatches, index: newIndex + 1 });
  }, [searchMatches, currentMatchIndex]);

  // Document search keyboard shortcut (Ctrl+F / Cmd+F)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        setShowDocumentSearch(true);
        setTimeout(() => documentSearchInputRef.current?.focus(), 0);
      }
      if (e.key === 'Escape' && showDocumentSearch) {
        setShowDocumentSearch(false);
        setDocumentSearchQuery("");
        setActiveSearchQuery("");
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showDocumentSearch]);

  // Global match index counter - reset on each render
  let globalMatchIndex = 0;
  
  // Helper function to highlight text in string
  const highlightString = (text: string): React.ReactNode => {
    if (!activeSearchQuery) return text;
    
    const regex = new RegExp(`(${escapeRegExp(activeSearchQuery)})`, 'gi');
    const parts = text.split(regex);
    
    if (parts.length === 1) return text;
    
    return (
      <>
        {parts.map((part, i) => {
          if (part.toLowerCase() === activeSearchQuery.toLowerCase()) {
            const idx = globalMatchIndex;
            const isCurrentMatch = idx === currentMatchIndex;
            globalMatchIndex++;
            return (
              <mark 
                key={`match-${idx}-${i}`} 
                className={`search-highlight ${isCurrentMatch ? 'search-highlight-current' : ''}`}
                data-search-index={idx}
              >
                {part}
              </mark>
            );
          }
          return part;
        })}
      </>
    );
  };

  // Helper function to highlight text in children - processes recursively
  const highlightChildren = (children: React.ReactNode): React.ReactNode => {
    if (!activeSearchQuery) return children;

    if (typeof children === 'string') {
      return highlightString(children);
    }

    if (typeof children === 'number') {
      return highlightString(String(children));
    }

    // Handle arrays of children
    if (Array.isArray(children)) {
      return children.map((child, i) => {
        if (typeof child === 'string') {
          return <span key={i}>{highlightString(child)}</span>;
        }
        if (typeof child === 'number') {
          return <span key={i}>{highlightString(String(child))}</span>;
        }
        return child;
      });
    }

    return children;
  };

  return (
    <div className="relative">
      {/* Document Search Bar - Fixed position so it stays visible while scrolling */}
      {showDocumentSearch && (
        <div className="fixed top-20 right-8 z-50 flex items-center gap-2 bg-card/95 backdrop-blur border border-border rounded-xl shadow-xl p-2.5 animate-in slide-in-from-top-2 duration-200">
          <Search className="h-4 w-4 text-muted-foreground shrink-0" />
          <input
            ref={documentSearchInputRef}
            type="text"
            value={documentSearchQuery}
            onChange={(e) => setDocumentSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                navigateSearch(e.shiftKey ? 'prev' : 'next');
              }
            }}
            placeholder="Search in document..."
            className="bg-transparent border-none outline-none text-sm w-52 placeholder:text-muted-foreground"
          />
          {searchMatches.total > 0 && (
            <span className="text-xs text-muted-foreground whitespace-nowrap px-2 py-1 bg-muted rounded-md">
              {searchMatches.index}/{searchMatches.total}
            </span>
          )}
          <div className="flex items-center gap-0.5 border-l border-border pl-2 ml-1">
            <button
              onClick={() => navigateSearch('prev')}
              className="p-1.5 rounded-lg hover:bg-muted transition-colors"
              title="Previous match (Shift+Enter)"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => navigateSearch('next')}
              className="p-1.5 rounded-lg hover:bg-muted transition-colors"
              title="Next match (Enter)"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          <button
            onClick={() => {
              setShowDocumentSearch(false);
              setDocumentSearchQuery("");
              setActiveSearchQuery("");
            }}
            className="p-1.5 rounded-lg hover:bg-destructive/10 hover:text-destructive transition-colors ml-1"
            title="Close (Esc)"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Topic header when viewing specific topic */}
      {currentTopic && (
        <div className="mb-6 flex items-center gap-3 rounded-xl bg-gradient-to-r from-primary/10 to-transparent p-4 border border-primary/20">
          <span className="text-3xl">{currentTopic.icon}</span>
          <div>
            <h2 className="text-xl font-bold text-foreground">
              {currentTopic.title}
            </h2>
            <p className="text-sm text-muted-foreground">
              Topic {(study.topics?.findIndex(t => t.id === selectedTopic) || 0) + 1} of {study.topics?.length}
            </p>
          </div>
        </div>
      )}
      
      <div ref={documentContentRef} className="study-document">
        <ReactMarkdown
          key={`md-${activeSearchQuery}-${currentMatchIndex}`}
          remarkPlugins={[remarkGfm]}
          components={{
            h1: ({ children }) => (
              <h1 className="relative mb-6 mt-10 pb-4 text-3xl font-bold text-foreground first:mt-0 border-b-2 border-primary/30">
                {highlightChildren(children)}
              </h1>
            ),
            h2: ({ children }) => (
              <h2 className="mb-4 mt-8 pb-2 text-2xl font-semibold text-foreground border-b border-border">
                {highlightChildren(children)}
              </h2>
            ),
            h3: ({ children }) => (
              <h3 className="mb-3 mt-6 text-xl font-semibold text-primary/90">
                {highlightChildren(children)}
              </h3>
            ),
            h4: ({ children }) => (
              <h4 className="mb-2 mt-4 text-lg font-semibold text-foreground/90">
                {highlightChildren(children)}
              </h4>
            ),
            p: ({ children }) => (
              <p className="mb-4 leading-7 text-foreground/90">{highlightChildren(children)}</p>
            ),
            ul: ({ children }) => (
              <ul className="mb-4 space-y-2 pl-0 list-none">
                {children}
              </ul>
            ),
            ol: ({ children }) => (
              <ol className="mb-4 space-y-2 pl-0 list-none counter-reset-[item]">
                {children}
              </ol>
            ),
            li: ({ children }) => (
              <li className="relative pl-6 leading-7">
                <span className="absolute left-0 text-primary font-bold">•</span>
                {highlightChildren(children)}
              </li>
            ),
            strong: ({ children }) => (
              <strong className="font-semibold text-primary">{highlightChildren(children)}</strong>
            ),
            em: ({ children }) => (
              <em className="italic text-foreground/80">{highlightChildren(children)}</em>
            ),
            blockquote: ({ children }) => (
              <blockquote className="relative my-6 rounded-r-lg border-l-4 border-primary bg-primary/5 py-4 pl-6 pr-4 italic text-foreground/80">
                {children}
              </blockquote>
            ),
            code: ({ children, className }) => {
              const isBlock = className?.includes('language-');
              if (isBlock) {
                return (
                  <code className="block overflow-x-auto rounded-xl bg-card p-5 font-mono text-sm border border-border shadow-sm whitespace-pre-wrap">
                    {highlightChildren(children)}
                  </code>
                );
              }
              // Inline code - check if it's a formula
              const content = String(children);
              const isFormula = content.includes('=') || content.includes('×') || content.includes('→') || content.includes('⟹');
              return (
                <code className={`rounded-md px-1.5 py-0.5 font-mono text-sm ${
                  isFormula 
                    ? "bg-primary/10 text-primary border border-primary/20" 
                    : "bg-muted text-primary"
                }`}>
                  {highlightChildren(children)}
                </code>
              );
            },
            pre: ({ children }) => (
              <pre className="my-6 overflow-x-auto rounded-xl bg-card p-5 border border-border shadow-sm font-mono text-sm leading-relaxed">
                {children}
              </pre>
            ),
            hr: () => (
              <div className="my-10 flex items-center gap-4">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
                <span className="text-muted-foreground/50">✦</span>
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
              </div>
            ),
            table: ({ children }) => (
              <div className="my-6 overflow-x-auto rounded-xl border border-border shadow-sm">
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
                {highlightChildren(children)}
              </th>
            ),
            td: ({ children }) => (
              <td className="border-b border-border/50 px-4 py-3 text-sm">{highlightChildren(children)}</td>
            ),
            tr: ({ children }) => (
              <tr className="even:bg-muted/30">{children}</tr>
            ),
            a: ({ children, href }) => (
              <a href={href} className="text-primary underline decoration-primary/30 underline-offset-2 transition-colors hover:decoration-primary">
                {highlightChildren(children)}
              </a>
            ),
          }}
        >
          {currentTopic?.content || study.content}
        </ReactMarkdown>
      </div>
    </div>
  );
}

