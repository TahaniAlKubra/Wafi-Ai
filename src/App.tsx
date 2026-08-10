/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Header } from './components/Header';
import { UploadSection } from './components/UploadSection';
import { SummaryTab } from './components/SummaryTab';
import { FlashcardsTab } from './components/FlashcardsTab';
import { QuizTab } from './components/QuizTab';
import { RemedialTab } from './components/RemedialTab';
import { TutorChat } from './components/TutorChat';
import { AnalysisResult, LearningPreferences, StudyDocument, WeakPoint, Flashcard } from './types';
import { Sparkles, MessageSquareText, FileText, CheckCircle2 } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('summary');
  const [currentDocument, setCurrentDocument] = useState<StudyDocument | null>(null);
  const [preferences, setPreferences] = useState<LearningPreferences>({
    level: 'متوسط',
    language: 'عربي',
    interests: ['الألعاب والرياضات الإلكترونية', 'التقنية والبرمجة والذكاء الاصطناعي'],
  });
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>('جاري تحليل المستند مع وافي...');
  const [weakPoints, setWeakPoints] = useState<WeakPoint[]>([]);
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);

  // Handle PDF Analysis trigger
  const handleAnalyzeDocument = async (
    document: StudyDocument,
    userPreferences: LearningPreferences
  ) => {
    setCurrentDocument(document);
    setPreferences(userPreferences);
    setIsLoading(true);
    setLoadingMessage('جاري تحليل المستند واستخراج الفكرة العامة بذكاء وافي...');

    try {
      const response = await fetch('/api/analyze-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pdfBase64: document.base64,
          pdfText: document.text,
          documentName: document.name,
          level: userPreferences.level,
          language: userPreferences.language,
          interests: userPreferences.interests,
        }),
      });

      const data = await response.json();

      if (data.success && data.data) {
        setAnalysisResult(data.data);
        setActiveTab('summary');
      } else {
        alert(data.error || 'حدث خطأ أثناء معالجة المستند. يرجى المحاولة مرة أخرى.');
      }
    } catch (err: any) {
      console.error('Error in handleAnalyzeDocument:', err);
      alert('تعذر الاتصال بـ سيرفر وافي. يرجى التحقق من الاتصال والمحاولة لاحقاً.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setAnalysisResult(null);
    setCurrentDocument(null);
    setWeakPoints([]);
    setActiveTab('summary');
  };

  const handleAddWeakPoints = (newWeakPoints: WeakPoint[]) => {
    setWeakPoints((prev) => {
      const existingIds = new Set(prev.map((p) => p.questionId));
      const filteredNew = newWeakPoints.filter((p) => !existingIds.has(p.questionId));
      return [...prev, ...filteredNew];
    });
  };

  const handleMarkFlashcardWeakness = (card: Flashcard) => {
    const cardWeakPoint: WeakPoint = {
      questionId: `card-${card.id}`,
      question: card.front,
      selectedOption: 'يحتاج مراجعة',
      correctOption: card.back,
      concept: card.topic || 'مفهوم البطاقة',
    };
    handleAddWeakPoints([cardWeakPoint]);
  };

  return (
    <div dir="rtl" className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased selection:bg-indigo-100 selection:text-indigo-900">
      
      {/* Top Application Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        documentTitle={analysisResult?.metadata.title || currentDocument?.name}
        hasAnalyzed={!!analysisResult}
        onReset={handleReset}
        weakCount={weakPoints.length}
        onOpenChat={() => setIsChatOpen(true)}
      />

      {/* Main Screen Content */}
      <main className="px-4 sm:px-6 lg:px-8 py-6">
        {!analysisResult ? (
          /* 1. Upload & Preferences Screen */
          <UploadSection
            onAnalyze={handleAnalyzeDocument}
            isLoading={isLoading}
            loadingMessage={loadingMessage}
          />
        ) : (
          /* 2. Main Tabs Screen */
          <div className="max-w-7xl mx-auto">
            {activeTab === 'summary' && (
              <SummaryTab
                analysis={analysisResult}
                preferences={preferences}
                onGoToQuiz={() => setActiveTab('quiz')}
                onGoToFlashcards={() => setActiveTab('flashcards')}
              />
            )}

            {activeTab === 'flashcards' && (
              <FlashcardsTab
                flashcards={analysisResult.flashcards}
                onMarkWeakness={handleMarkFlashcardWeakness}
                onGoToQuiz={() => setActiveTab('quiz')}
              />
            )}

            {activeTab === 'quiz' && (
              <QuizTab
                quiz={analysisResult.quiz}
                preferences={preferences}
                documentName={currentDocument?.name}
                onAddWeakPoints={handleAddWeakPoints}
                onGoToRemedial={() => setActiveTab('remedial')}
              />
            )}

            {activeTab === 'remedial' && (
              <RemedialTab
                weakPoints={weakPoints}
                preferences={preferences}
                documentName={currentDocument?.name}
                onGoToQuiz={() => setActiveTab('quiz')}
              />
            )}
          </div>
        )}
      </main>

      {/* Floating Tutor Chat Drawer Trigger */}
      {analysisResult && (
        <button
          onClick={() => setIsChatOpen(true)}
          className="fixed bottom-6 left-6 z-30 flex items-center gap-2 px-4 py-3 rounded-2xl bg-gradient-to-r from-blue-600 via-violet-600 to-teal-500 hover:opacity-95 text-white font-extrabold text-xs shadow-xl shadow-violet-500/30 hover:scale-105 active:scale-95 transition-all cursor-pointer border border-violet-400/30"
        >
          <MessageSquareText className="w-5 h-5 text-amber-300" />
          <span className="hidden sm:inline">تحدث مع المعلم وافي 💬</span>
        </button>
      )}

      {/* Tutor Chat Drawer */}
      <TutorChat
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        documentContext={currentDocument?.text || analysisResult?.summary.overview}
        documentTitle={analysisResult?.metadata.title || currentDocument?.name}
        preferences={preferences}
      />

    </div>
  );
}
