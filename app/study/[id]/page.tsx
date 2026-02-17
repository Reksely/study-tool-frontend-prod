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
      // Load fake data if ID is "test"
      if (params.id === "test") {
        const fakeStudy: Study = {
          _id: "test",
          title: "Markdown Features Showcase",
          description: "A comprehensive demonstration of all markdown capabilities",
          content: `# Complete Markdown Showcase

This document demonstrates **all markdown features** supported in the study tool.

## Text Formatting

You can use **bold text**, *italic text*, and ***bold italic text***.

~~Strikethrough~~ is also supported.

> This is a blockquote
> It can span multiple lines

---

## Lists

### Unordered List
- Item 1
- Item 2
  - Nested item
- Item 3

### Ordered List
1. First
2. Second
3. Third

## Code

Inline code: \`const x = 5\`

\`\`\`javascript
function hello() {
  console.log("Hello World!");
}
\`\`\`

## Math

Inline: $E = mc^2$

Block:
$$
\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}
$$

## Tables

| Feature | Status |
|---------|--------|
| Headers | ✅ |
| Lists | ✅ |
| Code | ✅ |

Click on topics in the sidebar to see more examples! 👈`,
          sourceType: "notes",
          topics: [
            {
              id: "topic1",
              title: "Text Formatting & Headings",
              icon: "✍️",
              content: `# Heading 1
## Heading 2
### Heading 3
#### Heading 4
##### Heading 5
###### Heading 6

**Bold text** and *italic text* and ***bold italic text***

~~Strikethrough text~~

This is a paragraph with some **bold words**, *italic words*, and ***both***.

> This is a blockquote
> It can span multiple lines
> > And can be nested

---

Horizontal rule above and below

___`,
              order: 0,
              learned: false
            },
            {
              id: "topic2",
              title: "Lists & Links",
              icon: "📋",
              content: `## Unordered Lists

- Item 1
- Item 2
  - Nested item 2.1
  - Nested item 2.2
    - Deep nested item
- Item 3

* Alternative bullet
* Another item

## Ordered Lists

1. First item
2. Second item
   1. Nested numbered item
   2. Another nested item
3. Third item

## Task Lists

- [x] Completed task
- [ ] Incomplete task
- [ ] Another task to do

## Links

[OpenAI](https://openai.com)

[Link with title](https://example.com "Example Website")

<https://autolink.com>`,
              order: 1,
              learned: false
            },
            {
              id: "topic3",
              title: "Code & Math",
              icon: "💻",
              content: `## Inline Code

Use \`inline code\` for short snippets like \`const x = 5\`.

## Code Blocks

\`\`\`javascript
function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

console.log(fibonacci(10));
\`\`\`

\`\`\`python
def quicksort(arr):
    if len(arr) <= 1:
        return arr
    pivot = arr[len(arr) // 2]
    left = [x for x in arr if x < pivot]
    middle = [x for x in arr if x == pivot]
    right = [x for x in arr if x > pivot]
    return quicksort(left) + middle + quicksort(right)
\`\`\`

## Math Equations (LaTeX)

Inline math: $E = mc^2$ and $a^2 + b^2 = c^2$

Block math:

$$
\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}
$$

$$
f(x) = \\frac{1}{\\sigma\\sqrt{2\\pi}} e^{-\\frac{1}{2}\\left(\\frac{x-\\mu}{\\sigma}\\right)^2}
$$

Matrix example:

$$
\\begin{bmatrix}
a & b \\\\
c & d
\\end{bmatrix}
$$`,
              order: 2,
              learned: false
            },
            {
              id: "topic4",
              title: "Tables & Images",
              icon: "📊",
              content: `## Tables

| Feature | Supported | Notes |
|---------|-----------|-------|
| Headers | ✅ | H1-H6 |
| Lists | ✅ | Ordered & Unordered |
| Code | ✅ | Inline & Blocks |
| Math | ✅ | LaTeX with KaTeX |
| Tables | ✅ | Markdown tables |

| Left Aligned | Center Aligned | Right Aligned |
|:-------------|:--------------:|--------------:|
| Left | Center | Right |
| A | B | C |

## Images

![Alt text](https://via.placeholder.com/400x200?text=Sample+Image)

![Small image](https://via.placeholder.com/150?text=Small)`,
              order: 3,
              learned: false
            },
            {
              id: "topic5",
              title: "Advanced Features",
              icon: "🚀",
              content: `## Footnotes

Here's a sentence with a footnote[^1].

[^1]: This is the footnote content.

## Definition Lists

Term 1
: Definition 1

Term 2
: Definition 2a
: Definition 2b

## Escaped Characters

\\* Not a bullet
\\# Not a heading
\\[Not a link\\]

## HTML Elements

<div style="background: #f0f0f0; padding: 16px; border-radius: 8px;">
  <strong>HTML works too!</strong>
  <p>You can use HTML elements directly.</p>
</div>

<details>
<summary>Click to expand</summary>

Hidden content here!

</details>

## Emojis

😀 😃 😄 😁 🎉 🚀 💻 📚 ✨ 🔥

## Complex Math

Quadratic formula:

$$
x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}
$$

Summation:

$$
\\sum_{i=1}^{n} i = \\frac{n(n+1)}{2}
$$

Limits:

$$
\\lim_{x \\to \\infty} \\frac{1}{x} = 0
$$`,
              order: 4,
              learned: false
            }
          ],
          quizQuestions: [
            {
              question: "What is the main difference between supervised and unsupervised learning?",
              options: [
                "Supervised learning uses labeled data, unsupervised learning uses unlabeled data",
                "Supervised learning is faster than unsupervised learning",
                "Unsupervised learning is more accurate",
                "There is no difference"
              ],
              correctAnswer: 0,
              explanation: "The key difference is that supervised learning requires labeled training data where the correct answers are known, while unsupervised learning works with unlabeled data to find patterns.",
              hint: "Think about whether the training data has labels or not",
              topicId: "topic2"
            },
            {
              question: "Which of the following is an example of supervised learning?",
              options: [
                "Clustering customers into groups",
                "Predicting house prices based on features",
                "Finding patterns in unlabeled data",
                "Reducing data dimensions"
              ],
              correctAnswer: 1,
              explanation: "Predicting house prices is a supervised learning task because you have labeled data (historical prices) to train the model.",
              topicId: "topic2"
            },
            {
              question: "What does K-means algorithm do?",
              options: [
                "Classifies data into predefined categories",
                "Groups similar data points into clusters",
                "Predicts continuous values",
                "Reduces feature dimensions"
              ],
              correctAnswer: 1,
              explanation: "K-means is a clustering algorithm that groups similar data points together into K clusters based on their features.",
              hint: "It's an unsupervised learning technique",
              topicId: "topic3"
            }
          ],
          documentChatHistory: [],
          quizChatHistory: [],
          quizHistory: [],
          createdAt: new Date().toISOString()
        };

        const fakeRecommendation: QuestionRecommendation = {
          min: 3,
          max: 10,
          suggested: 5,
          label: "Recommended"
        };

        setStudy(fakeStudy);
        setRecommendation(fakeRecommendation);
        
        if (fakeStudy.quizQuestions?.length) {
          setSelectedAnswers(new Array(fakeStudy.quizQuestions.length).fill(null));
          setAnsweredQuestions(new Array(fakeStudy.quizQuestions.length).fill(false));
        }
        
        setLoading(false);
        return;
      }

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
