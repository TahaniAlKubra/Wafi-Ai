export type ExplanationLevel = 'مبتدئ' | 'متوسط' | 'متقدم';
export type LanguagePref = 'عربي' | 'إنجليزي';

export interface StudentInterest {
  id: string;
  label: string;
  iconName: string;
  color: string;
  description: string;
}

export interface LearningPreferences {
  level: ExplanationLevel;
  language: LanguagePref;
  interests: string[];
}

export interface StudyDocument {
  id: string;
  name: string;
  size?: string;
  type: 'uploaded' | 'sample';
  text?: string;
  base64?: string;
  category?: string;
}

export interface KeyPoint {
  id: string;
  title: string;
  explanation: string;
  interestAnalogy: string;
  tag: string;
}

export interface SummaryData {
  overview: string;
  audioScript: string;
  keyPoints: KeyPoint[];
}

export interface Flashcard {
  id: string;
  topic: string;
  front: string;
  back: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  concept: string;
  pageOrSection?: string;
}

export interface ErrorDiagnosis {
  errorReason: string;
  coreConcept: string;
  weaknessAnalysis: string;
  interestAnalogy: string;
  pageOrSection?: string;
}

export interface WeakPoint {
  questionId: string;
  question: string;
  selectedOption: string;
  correctOption: string;
  concept: string;
  diagnosis?: ErrorDiagnosis;
}

export interface ConfirmationQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface RemedialUnit {
  conceptId: string;
  title: string;
  simplifiedLesson: string;
  interestAnalogy: string;
  keyTakeaways: string[];
  confirmationQuestion: ConfirmationQuestion;
}

export interface DocumentMetadata {
  title: string;
  estimatedTime: string;
  subject: string;
  totalTopics: number;
}

export interface AnalysisResult {
  metadata: DocumentMetadata;
  summary: SummaryData;
  flashcards: Flashcard[];
  quiz: QuizQuestion[];
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'tutor';
  text: string;
  timestamp: string;
}
