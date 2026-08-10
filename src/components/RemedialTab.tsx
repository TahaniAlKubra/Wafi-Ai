import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  CheckCircle2, 
  Sparkles, 
  AlertCircle, 
  Loader2, 
  RefreshCw, 
  ShieldCheck, 
  Lightbulb, 
  BookOpen, 
  Check, 
  XCircle,
  Pill,
  HelpCircle
} from 'lucide-react';
import { WeakPoint, RemedialUnit, LearningPreferences } from '../types';

interface RemedialTabProps {
  weakPoints: WeakPoint[];
  preferences: LearningPreferences;
  documentName?: string;
  onGoToQuiz: () => void;
}

export const RemedialTab: React.FC<RemedialTabProps> = ({
  weakPoints,
  preferences,
  documentName,
  onGoToQuiz,
}) => {
  const [remedialUnits, setRemedialUnits] = useState<RemedialUnit[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [closedGaps, setClosedGaps] = useState<Record<string, boolean>>({});
  const [confirmationAnswers, setConfirmationAnswers] = useState<Record<string, number>>({});

  const fetchRemedialPlan = async () => {
    if (!weakPoints || weakPoints.length === 0) return;

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/generate-remedial', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          weakPoints,
          level: preferences.level,
          interests: preferences.interests,
          documentName,
        }),
      });

      const data = await res.json();
      if (data.success && data.remedialPlan?.remedialUnits) {
        setRemedialUnits(data.remedialPlan.remedialUnits);
      } else {
        setErrorMsg('تعذر إنشاء خطة الجرعة العلاجية حالياً.');
      }
    } catch (err: any) {
      console.error('Error fetching remedial plan:', err);
      setErrorMsg('حدث خطأ أثناء التواصل مع سيرفر وافي الذكي.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (weakPoints.length > 0 && remedialUnits.length === 0 && !isLoading) {
      fetchRemedialPlan();
    }
  }, [weakPoints]);

  const handleConfirmationSelect = (unitIndex: number, optionIdx: number, correctIdx: number) => {
    setConfirmationAnswers((prev) => ({ ...prev, [unitIndex]: optionIdx }));

    if (optionIdx === correctIdx) {
      setClosedGaps((prev) => ({ ...prev, [unitIndex]: true }));
      confetti({ particleCount: 30, spread: 60, origin: { y: 0.6 } });
    }
  };

  const closedCount = Object.values(closedGaps).filter(Boolean).length;

  if (!weakPoints || weakPoints.length === 0) {
    return (
      <div className="max-w-3xl mx-auto bg-white rounded-3xl p-8 sm:p-12 text-center space-y-6 shadow-sm border border-slate-200">
        <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto text-2xl font-bold">
          <ShieldCheck className="w-8 h-8 text-emerald-600" />
        </div>
        <div className="space-y-2 max-w-md mx-auto">
          <h2 className="text-2xl font-black text-slate-900">سجل الفجوات نقي وخالٍ تماماً 🌟</h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            لم تُسجل أي نقاط ضعف أو فجوات تعليمية في الاختبار التشخيصي أو البطاقات حتى الآن. يمكنك خوض اختبار جديد في أي وقت لتقييم مستواك!
          </p>
        </div>
        <button
          onClick={onGoToQuiz}
          className="px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md transition-all cursor-pointer inline-flex items-center gap-2"
        >
          <HelpCircle className="w-4 h-4" />
          <span>بدء اختبار جديد في المادة</span>
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-12">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-rose-900 via-rose-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-rose-800/40 relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
              <Pill className="w-3.5 h-3.5 text-rose-400" /> الجرعة العلاجية الفورية (Remedial Mode)
            </div>
            <h1 className="text-2xl font-black text-white">خطة إغلاق الفجوات التعليمية</h1>
            <p className="text-xs text-rose-100/80 leading-relaxed max-w-xl">
              وافي يحلل نقاط الضعف التي ظهرت في إجاباتك ويقدم لك دروساً مركزة ومعدلة لإتقان المفاهيم مع أسئلة تأكيدية.
            </p>
          </div>

          <button
            onClick={fetchRemedialPlan}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all cursor-pointer border border-white/20 shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>تحديث الخطة</span>
          </button>
        </div>
      </div>

      {/* Progress Gauge Bar */}
      {remedialUnits.length > 0 && (
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between text-xs font-extrabold">
            <span className="text-slate-800 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              مؤشر إغلاق الفجوات التعليمية:
            </span>
            <span className="text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-md border border-indigo-200">
              تم إغلاق {closedCount} من {remedialUnits.length} فجوات 🎯
            </span>
          </div>

          <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-indigo-600 h-full transition-all duration-500"
              style={{ width: `${(closedCount / remedialUnits.length) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="bg-white rounded-3xl p-12 text-center space-y-4 border border-slate-200 shadow-2xs">
          <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mx-auto" />
          <p className="text-sm font-extrabold text-slate-800">
            جاري تصميم الجرعة العلاجية خصيصاً لنقاط ضعفك...
          </p>
          <p className="text-xs text-slate-500">
            وافي يستحضر تشبيهات جديدة مأخوذة من شغفك في ({preferences.interests.join(' و ')})
          </p>
        </div>
      )}

      {/* Error State */}
      {errorMsg && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-center space-y-3 text-xs text-rose-800">
          <AlertCircle className="w-8 h-8 text-rose-600 mx-auto" />
          <p className="font-bold">{errorMsg}</p>
          <button
            onClick={fetchRemedialPlan}
            className="px-4 py-2 bg-rose-600 text-white rounded-xl font-bold cursor-pointer hover:bg-rose-700"
          >
            إعادة المحاولة
          </button>
        </div>
      )}

      {/* Remedial Units List */}
      {!isLoading && remedialUnits.length > 0 && (
        <div className="space-y-6">
          {remedialUnits.map((unit, uIdx) => {
            const isClosed = closedGaps[uIdx];
            const chosenAnswer = confirmationAnswers[uIdx];
            const isAnswered = chosenAnswer !== undefined;
            const cq = unit.confirmationQuestion;

            return (
              <div
                key={uIdx}
                className={`bg-white rounded-3xl p-6 sm:p-8 shadow-sm border transition-all space-y-6 ${
                  isClosed
                    ? 'border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50/20'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                {/* Unit Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-rose-100 text-rose-800 flex items-center justify-center font-bold text-xs">
                      #{uIdx + 1}
                    </span>
                    <h3 className="text-base font-black text-slate-900">{unit.title}</h3>
                  </div>

                  {isClosed ? (
                    <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" /> تم إغلاق الفجوة!
                    </span>
                  ) : (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">
                      يحتاج علاج 💊
                    </span>
                  )}
                </div>

                {/* Simplified Lesson */}
                <div className="space-y-2">
                  <h4 className="text-xs font-extrabold text-slate-700 flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-indigo-600" /> الدرس المعدل المبسط:
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-200/60">
                    {unit.simplifiedLesson}
                  </p>
                </div>

                {/* Interest Analogy */}
                {unit.interestAnalogy && (
                  <div className="p-4 bg-indigo-50/50 border border-indigo-100 rounded-2xl space-y-1">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-900">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-600" /> التشبيه العلاجي من شغفك ⚡:
                    </div>
                    <p className="text-xs text-slate-700 font-medium leading-relaxed">
                      {unit.interestAnalogy}
                    </p>
                  </div>
                )}

                {/* Key Takeaways */}
                {unit.keyTakeaways && unit.keyTakeaways.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="text-xs font-bold text-slate-600 block">💡 نقاط للتثبيت السريع:</span>
                    <ul className="space-y-1 text-xs text-slate-700">
                      {unit.keyTakeaways.map((point, pIdx) => (
                        <li key={pIdx} className="flex items-start gap-2">
                          <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Confirmation Question */}
                {cq && (
                  <div className="pt-4 border-t border-slate-100 space-y-4">
                    <div className="flex items-center gap-2 text-xs font-extrabold text-slate-900">
                      <HelpCircle className="w-4 h-4 text-indigo-600" />
                      <span>السؤال التأكيدي لإغلاق الفجوة:</span>
                    </div>

                    <p className="text-xs sm:text-sm font-bold text-slate-800">
                      {cq.question}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {cq.options?.map((opt, oIdx) => {
                        const isSelected = chosenAnswer === oIdx;
                        const isCorrectOption = oIdx === cq.correctIndex;

                        let style = 'bg-slate-50 text-slate-800 border-slate-200 hover:bg-slate-100';
                        if (isAnswered) {
                          if (isCorrectOption) {
                            style = 'bg-emerald-50 text-emerald-900 border-emerald-500 font-bold';
                          } else if (isSelected && !isCorrectOption) {
                            style = 'bg-rose-50 text-rose-900 border-rose-500 font-bold';
                          } else {
                            style = 'bg-slate-50 text-slate-400 border-slate-200 opacity-50';
                          }
                        }

                        return (
                          <button
                            key={oIdx}
                            type="button"
                            disabled={isAnswered}
                            onClick={() => handleConfirmationSelect(uIdx, oIdx, cq.correctIndex)}
                            className={`p-3 rounded-xl text-right text-xs border transition-all cursor-pointer flex items-center justify-between gap-2 ${style}`}
                          >
                            <span>{opt}</span>
                            {isAnswered && isCorrectOption && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
                            {isAnswered && isSelected && !isCorrectOption && <XCircle className="w-4 h-4 text-rose-600 shrink-0" />}
                          </button>
                        );
                      })}
                    </div>

                    {isAnswered && (
                      <div className={`p-3 rounded-xl text-xs font-medium ${
                        chosenAnswer === cq.correctIndex
                          ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                          : 'bg-rose-50 text-rose-900 border border-rose-200'
                      }`}>
                        {chosenAnswer === cq.correctIndex ? 'أحسنت! إجابة صحيحة وتم إغلاق الفجوة التعليمية بنجاح 🎯' : cq.explanation}
                      </div>
                    )}
                  </div>
                )}

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
