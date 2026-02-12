export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  hint?: string;
  topicId?: string;
}

export interface QuestionRecommendation {
  min: number;
  max: number;
  suggested: number;
  label: string;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp?: string;
}

export interface Topic {
  id: string;
  title: string;
  icon: string;
  content: string;
  order: number;
  learned?: boolean;
  videoUrl?: string | null;
  videoGenerating?: boolean;
}

export interface QuizAnswer {
  question: string;
  options: string[];
  correctAnswer: number;
  userAnswer: number;
  isCorrect: boolean;
  topicId?: string;
}

export interface QuizHistoryEntry {
  id: string;
  takenAt: string;
  totalQuestions: number;
  correctCount: number;
  wrongCount: number;
  percentage: number;
  selectedTopics: string[];
  answers: QuizAnswer[];
}

export interface Study {
  _id: string;
  title: string;
  description?: string;
  content: string;
  sourceType: "notes" | "pdf";
  pdfFileNames?: string[];
  topics?: Topic[];
  quizQuestions?: QuizQuestion[];
  documentChatHistory?: ChatMessage[];
  quizChatHistory?: ChatMessage[];
  quizHistory?: QuizHistoryEntry[];
  createdAt: string;
}

export interface VideoProgress {
  status: string;
  progress?: number;
  error?: string;
}

