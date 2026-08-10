import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { 
  BrainCircuit, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Sparkles, 
  ArrowLeft, 
  Loader2, 
  BookOpen, 
  RefreshCcw, 
  Check, 
  ChevronLeft,
  HelpCircle
} from 'lucide-react';
import { QuizQuestion, WeakPoint, LearningPreferences, ErrorDiagnosis } from '../types';

interface QuizTabProps {
  quiz: QuizQuestion[];
  preferences: LearningPreferences;
  documentName?: string;
  onAddWeakPoints: (weakPoints: WeakPoint[]) => void;
  onGoToRemedial: () => void;
}

export const QuizTab: React.FC<QuizTabProps> = ({
  quiz,
  preferences,
  documentName,
  onAddWeakPoints,
  onGoToRemedial,
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [diagnoses, setDiagnoses] = useState<Record<string, ErrorDiagnosis>>({});
  const [loadingDiagnosisId, setLoadingDiagnosisId] = useState<string | null>(null);
  const [collectedWeakPoints, setCollectedWeakPoints] = useState<WeakPoint[]>([]);
  const [quizFinished, setQuizFinished] = useState(false);

  if (!quiz || quiz.length === 0) {
    return (
      <div className="text-center py-12 space-y-4">
        <BrainCircuit className="w-12 h-12 text-slate-300 mx-auto" />
        <p className="text-slate-600 font-bold">لا توجد أسئلة اختبار مسجلة حالياً.</p>
      </div>
    );
  }

  const currentQ = quiz[currentQuestionIndex];
  const selectedIndex = selectedAnswers[currentQ?.id];
  const isAnswered = selectedIndex !== undefined;
  const isCorrect = isAnswered && selectedIndex === currentQ.correctIndex;
  const isIncorrect = isAnswered && selectedIndex !== currentQ.correctIndex;

  const handleSelectOption = async (optionIndex: number) => {
    if (isAnswered) return; // Prevent re-answering same question

    const qId = currentQ.id;
    setSelectedAnswers((prev) => ({ ...prev, [qId]: optionIndex }));

    if (optionIndex === currentQ.correctIndex) {
      // Small celebratory burst
      confetti({ particleCount: 25, spread: 50, origin: { y: 0.7 } });
    } else {
      // Answered incorrectly -> diagnose error with AI
      const weakPointItem: WeakPoint = {
        questionId: currentQ.id,
        question: currentQ.question,
        selectedOption: currentQ.options[optionIndex],
        correctOption: currentQ.options[currentQ.correctIndex],
        concept: currentQ.concept || 'مفهوم المادة',
      };

      setLoadingDiagnosisId(qId);

      try {
        const res = await fetch('/api/diagnose-error', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            question: currentQ.question,
            selectedOption: currentQ.options[optionIndex],
            correctOption: currentQ.options[currentQ.correctIndex],
            concept: currentQ.concept,
            documentName,
            level: preferences.level,
            interests: preferences.interests,
          }),
        });

        const data = await res.json();
        if (data.success && data.diagnosis) {
          weakPointItem.diagnosis = data.diagnosis;
          setDiagnoses((prev) => ({ ...prev, [qId]: data.diagnosis }));
        }
      } catch (err) {
        console.error('Failed to diagnose error:', err);
      } finally {
        setLoadingDiagnosisId(null);
      }

      setCollectedWeakPoints((prev) => {
        const filtered = prev.filter((p) => p.questionId !== qId);
        const updated = [...filtered, weakPointItem];
        onAddWeakPoints(updated);
        return updated;
      });
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < quiz.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      setQuizFinished(true);
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    }
  };

  const handleResetQuiz = () => {
    setSelectedAnswers({});
    setDiagnoses({});
    setCollectedWeakPoints([]);
    setCurrentQuestionIndex(0);
    setQuizFinished(false);
  };

  // Calculating overall score
  const correctCount = Object.entries(selectedAnswers).filter(
    ([qId, idx]) => {
      const q = quiz.find((item) => item.id === qId);
      return q && q.correctIndex === idx;
    }
  ).length;

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-12">
      
      {/* Quiz Top Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
            <BrainCircuit className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-slate-900">الاختبار التشخيصي التفاعلي</h2>
            <p className="text-xs text-slate-500">
              أسئلة دقيقة من المستند مع تشخيص فوري لأسباب الأخطاء
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-bold">
          <span className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 border border-slate-200">
            السؤال {currentQuestionIndex + 1} من {quiz.length}
          </span>
          <button
            onClick={handleResetQuiz}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all cursor-pointer"
            title="إعادة الاختبار"
          >
            <RefreshCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {!quizFinished ? (
        <div className="space-y-6">
          
          {/* Question Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 space-y-6">
            
            <div className="flex items-center justify-between text-xs">
              <span className="font-extrabold px-3 py-1 rounded-md bg-indigo-50 text-indigo-800 border border-indigo-200">
                {currentQ.concept || 'مفهوم دراسي'}
              </span>
              {currentQ.pageOrSection && (
                <span className="text-slate-400 font-medium">مرجع: {currentQ.pageOrSection}</span>
              )}
            </div>

            <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 leading-snug">
              {currentQ.question}
            </h3>

            {/* Options List */}
            <div className="space-y-3 pt-2">
              {currentQ.options?.map((option, idx) => {
                const isSelected = selectedIndex === idx;
                const isCorrectOption = idx === currentQ.correctIndex;

                let optionStyle = 'bg-slate-50 text-slate-800 border-slate-200 hover:bg-indigo-50/50 hover:border-indigo-300';
                
                if (isAnswered) {
                  if (isCorrectOption) {
                    optionStyle = 'bg-emerald-50 text-emerald-900 border-emerald-500 ring-2 ring-emerald-500/20 font-extrabold';
                  } else if (isSelected && !isCorrectOption) {
                    optionStyle = 'bg-rose-50 text-rose-900 border-rose-500 ring-2 ring-rose-500/20 font-extrabold';
                  } else {
                    optionStyle = 'bg-slate-50 text-slate-400 border-slate-200 opacity-60';
                  }
                }

                return (
                  <button
                    key={idx}
                    type="button"
                    disabled={isAnswered}
                    onClick={() => handleSelectOption(idx)}
                    className={`w-full p-4 rounded-2xl text-right font-medium text-xs sm:text-sm border transition-all cursor-pointer flex items-center justify-between gap-3 ${optionStyle}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                        isAnswered && isCorrectOption
                          ? 'bg-emerald-600 text-white'
                          : isAnswered && isSelected && !isCorrectOption
                          ? 'bg-rose-600 text-white'
                          : 'bg-slate-200 text-slate-700'
                      }`}>
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span>{option}</span>
                    </div>

                    {isAnswered && isCorrectOption && (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    )}
                    {isAnswered && isSelected && !isCorrectOption && (
                      <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Explanation & Diagnostic Panel upon answering */}
            {isAnswered && (
              <div className="pt-4 border-t border-slate-100 space-y-4">
                
                {/* Correct Feedback */}
                {isCorrect && (
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-1">
                    <div className="flex items-center gap-2 font-extrabold text-xs text-emerald-900">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>إجابة صحيحة ممتازة! 🎉</span>
                    </div>
                    <p className="text-xs text-emerald-800 leading-relaxed">
                      {currentQ.explanation}
                    </p>
                  </div>
                )}

                {/* Incorrect Feedback & Diagnostic Analysis */}
                {isIncorrect && (
                  <div className="p-5 bg-gradient-to-br from-rose-50 via-amber-50/50 to-rose-50/60 border border-rose-200/80 rounded-2xl space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 font-extrabold text-xs text-rose-900">
                        <AlertTriangle className="w-4 h-4 text-rose-600" />
                        <span>تشخيص الفجوة التعليمية وسبب الخطأ 🔍</span>
                      </div>
                      {loadingDiagnosisId === currentQ.id && (
                        <span className="flex items-center gap-1.5 text-[11px] text-amber-700 font-bold bg-amber-100 px-2.5 py-0.5 rounded-md">
                          <Loader2 className="w-3 h-3 animate-spin" /> جاري التحليل مع وافي...
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-700 leading-relaxed font-medium">
                      <span className="font-bold text-rose-800">التوضيح: </span>
                      {currentQ.explanation}
                    </p>

                    {/* AI Diagnostic Breakdown */}
                    {diagnoses[currentQ.id] && (
                      <div className="mt-3 p-4 bg-white/90 rounded-xl border border-rose-200 space-y-2 text-xs">
                        {diagnoses[currentQ.id].errorReason && (
                          <div className="space-y-0.5">
                            <span className="font-bold text-rose-900 block">سبب الالتباس في إجابتك:</span>
                            <p className="text-slate-600">{diagnoses[currentQ.id].errorReason}</p>
                          </div>
                        )}

                        {diagnoses[currentQ.id].interestAnalogy && (
                          <div className="p-2.5 bg-amber-50 rounded-lg border border-amber-200 text-amber-900 font-medium space-y-0.5">
                            <span className="font-extrabold flex items-center gap-1 text-amber-800">
                              <Sparkles className="w-3.5 h-3.5 text-amber-600" /> تشبيه بسيط لتثبيت الفكرة:
                            </span>
                            <p className="text-amber-900 text-[11px]">{diagnoses[currentQ.id].interestAnalogy}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Next Question / Finish Button */}
                <div className="flex justify-end pt-2">
                  <button
                    onClick={handleNextQuestion}
                    className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs shadow-md transition-all cursor-pointer"
                  >
                    <span>{currentQuestionIndex < quiz.length - 1 ? 'السؤال التالي' : 'عرض النتيجة النهائية'}</span>
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                </div>

              </div>
            )}

          </div>

        </div>
      ) : (
        /* Quiz Completion Summary & Results */
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200 text-center space-y-6">
          <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto text-2xl font-black">
            🏆
          </div>

          <div className="space-y-2 max-w-md mx-auto">
            <h3 className="text-2xl font-black text-slate-900">أحسنت! أكملت الاختبار التشخيصي</h3>
            <p className="text-xs text-slate-600">
              نتيجة أداؤك في هذا الاختبار: <span className="font-extrabold text-emerald-700">{correctCount} من {quiz.length}</span> إجابة صحيحة.
            </p>
          </div>

          {/* Weak Points Summary Box */}
          {collectedWeakPoints.length > 0 ? (
            <div className="p-5 bg-rose-50 border border-rose-200 rounded-2xl text-right space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-xs text-rose-900 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-rose-600" /> تم رصد {collectedWeakPoints.length} فجوة تعليمية تحتاج معالجة:
                </span>
                <span className="text-[11px] text-rose-700 font-bold bg-white px-2.5 py-0.5 rounded-md border border-rose-200">
                  مادة الجرعة العلاجية جاهزة
                </span>
              </div>

              <div className="space-y-2">
                {collectedWeakPoints.map((wp, i) => (
                  <div key={i} className="p-3 bg-white rounded-xl border border-rose-100 text-xs space-y-1">
                    <p className="font-bold text-slate-800">{wp.question}</p>
                    <p className="text-rose-700 text-[11px]">
                      المفهوم المستهدف: {wp.concept}
                    </p>
                  </div>
                ))}
              </div>

              <button
                onClick={onGoToRemedial}
                className="w-full py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <span>الانتقال فوراً لتبويب الجرعة العلاجية (Remedial Mode) 💊</span>
                <ArrowLeft className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-2">
              <p className="font-extrabold text-sm text-emerald-900">أداء ممتاز جداً! لا يوجد أي فجوات تعليمية رُصدت 🎉</p>
              <p className="text-xs text-emerald-700">لقد أجبت ببراعة على جميع الأسئلة. يمكنك الاستمرار في مراجعة الملخص أو طرح الأسئلة على معلمك وافي!</p>
            </div>
          )}

          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={handleResetQuiz}
              className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-all cursor-pointer"
            >
              إعادة الاختبار ↺
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
