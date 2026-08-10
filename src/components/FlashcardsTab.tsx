import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  RotateCw, 
  ChevronRight, 
  ChevronLeft, 
  CheckCircle2, 
  XCircle, 
  Shuffle, 
  Sparkles, 
  Layers, 
  HelpCircle,
  RefreshCcw
} from 'lucide-react';
import { Flashcard } from '../types';

interface FlashcardsTabProps {
  flashcards: Flashcard[];
  onMarkWeakness: (flashcard: Flashcard) => void;
  onGoToQuiz: () => void;
}

export const FlashcardsTab: React.FC<FlashcardsTabProps> = ({
  flashcards,
  onMarkWeakness,
  onGoToQuiz,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [cardsStatus, setCardsStatus] = useState<Record<string, 'mastered' | 'review'>>({});

  if (!flashcards || flashcards.length === 0) {
    return (
      <div className="text-center py-12 space-y-4">
        <Layers className="w-12 h-12 text-slate-300 mx-auto" />
        <p className="text-slate-600 font-bold">لا توجد بطاقات استذكار متاحة حالياً.</p>
      </div>
    );
  }

  const currentCard = flashcards[currentIndex];
  const isMastered = cardsStatus[currentCard?.id] === 'mastered';
  const isNeedsReview = cardsStatus[currentCard?.id] === 'review';

  const handleNext = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % flashcards.length);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + flashcards.length) % flashcards.length);
  };

  const handleShuffle = () => {
    setIsFlipped(false);
    const randomIndex = Math.floor(Math.random() * flashcards.length);
    setCurrentIndex(randomIndex);
  };

  const handleStatusChange = (status: 'mastered' | 'review') => {
    setCardsStatus((prev) => ({ ...prev, [currentCard.id]: status }));
    if (status === 'review') {
      onMarkWeakness(currentCard);
    }
    // Auto advance after rating
    setTimeout(() => {
      handleNext();
    }, 400);
  };

  const totalMastered = Object.values(cardsStatus).filter((s) => s === 'mastered').length;
  const totalReview = Object.values(cardsStatus).filter((s) => s === 'review').length;

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-12">
      
      {/* Top Header & Stats */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-extrabold text-slate-900">بطاقات الاستذكار التفاعلية (Flashcards)</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            انقر على البطاقة لقلبها واكتشاف الشرح، وتقييم مستوى حفظك لها
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs font-bold shrink-0">
          <span className="px-3 py-1.5 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
            متذكر: {totalMastered}
          </span>
          <span className="px-3 py-1.5 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1">
            <XCircle className="w-3.5 h-3.5 text-rose-600" />
            مراجعة: {totalReview}
          </span>
          <button
            onClick={handleShuffle}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all cursor-pointer"
            title="ترتيب عشوائي"
          >
            <Shuffle className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Card Progress Indicator */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-bold text-slate-500">
          <span>البطاقة {currentIndex + 1} من {flashcards.length}</span>
          <span>{Math.round(((currentIndex + 1) / flashcards.length) * 100)}%</span>
        </div>
        <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
          <div
            className="bg-gradient-to-r from-blue-600 via-violet-600 to-teal-500 h-full transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / flashcards.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Main 3D Flip Card Container */}
      <div className="perspective-1000 min-h-[340px] relative">
        <motion.div
          onClick={() => setIsFlipped(!isFlipped)}
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
          className="w-full min-h-[340px] cursor-pointer preserve-3d relative"
        >
          {/* FRONT OF CARD */}
          <div
            className={`absolute inset-0 backface-hidden rounded-3xl p-8 bg-gradient-to-br from-blue-950 via-slate-900 to-violet-950 text-white shadow-xl border border-violet-800/40 flex flex-col justify-between select-none ${
              isFlipped ? 'pointer-events-none' : ''
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold bg-indigo-500/20 text-indigo-300 px-3 py-1 rounded-full border border-indigo-500/30">
                {currentCard.topic || 'مفهوم أساسي'}
              </span>
              <span className="text-xs text-slate-400 flex items-center gap-1 font-medium">
                <RotateCw className="w-3.5 h-3.5 text-indigo-400 animate-spin" style={{ animationDuration: '6s' }} /> انقر لقلب البطاقة
              </span>
            </div>

            <div className="my-auto text-center space-y-4 px-4 py-6">
              <span className="inline-block text-indigo-400 font-extrabold text-xs uppercase tracking-wider">
                المفهوم / السؤال
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-white leading-relaxed">
                {currentCard.front}
              </h3>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 pt-4 border-t border-slate-800">
              <span>وافي – بطاقات الاستذكار</span>
              <span className="text-amber-400 font-bold">انقر للإجابة والشرح 💡</span>
            </div>
          </div>

          {/* BACK OF CARD */}
          <div
            className={`absolute inset-0 backface-hidden rotate-y-180 rounded-3xl p-8 bg-white text-slate-900 shadow-xl border-2 border-indigo-500/40 flex flex-col justify-between select-none ${
              !isFlipped ? 'pointer-events-none' : ''
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full border border-indigo-200">
                الشرح والتعريف
              </span>
              <span className="text-xs text-slate-400 font-medium">
                انقر للعودة للسؤال ↺
              </span>
            </div>

            <div className="my-auto space-y-4 px-2 py-4">
              <p className="text-base sm:text-lg font-extrabold text-slate-800 leading-relaxed text-center">
                {currentCard.back}
              </p>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span className="font-semibold text-indigo-600">كيف تجد حفظك لهذا المفهوم؟</span>
              <span>بطاقة #{currentIndex + 1}</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Interactive Evaluation Buttons */}
      <div className="space-y-4">
        <div className="text-center">
          <p className="text-xs font-bold text-slate-600 mb-2">قيّم مدى استيعابك وتذكرك لهذا المفهوم:</p>
          <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
            <button
              onClick={() => handleStatusChange('mastered')}
              className={`py-3 px-4 rounded-2xl font-extrabold text-xs flex items-center justify-center gap-2 border transition-all cursor-pointer ${
                isMastered
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-md ring-2 ring-emerald-500/30'
                  : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-200'
              }`}
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>متذكر ومتأكد 🟢</span>
            </button>

            <button
              onClick={() => handleStatusChange('review')}
              className={`py-3 px-4 rounded-2xl font-extrabold text-xs flex items-center justify-center gap-2 border transition-all cursor-pointer ${
                isNeedsReview
                  ? 'bg-rose-600 text-white border-rose-600 shadow-md ring-2 ring-rose-500/30'
                  : 'bg-rose-50 hover:bg-rose-100 text-rose-800 border-rose-200'
              }`}
            >
              <XCircle className="w-4 h-4 text-rose-600" />
              <span>أحتاج مراجعة 🔴</span>
            </button>
          </div>
        </div>

        {/* Card Navigation Controls */}
        <div className="flex items-center justify-between pt-2">
          <button
            onClick={handlePrev}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs border border-slate-200 transition-all cursor-pointer shadow-2xs"
          >
            <ChevronRight className="w-4 h-4" />
            <span>البطاقة السابقة</span>
          </button>

          <button
            onClick={() => setIsFlipped(!isFlipped)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-800 font-bold text-xs border border-indigo-200 transition-all cursor-pointer"
          >
            <RefreshCcw className="w-3.5 h-3.5 text-indigo-600" />
            <span>اقلب البطاقة</span>
          </button>

          <button
            onClick={handleNext}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-all cursor-pointer shadow-sm"
          >
            <span>البطاقة التالية</span>
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="text-center pt-4">
        <button
          onClick={onGoToQuiz}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs shadow-md transition-all cursor-pointer"
        >
          <HelpCircle className="w-4 h-4" />
          <span>جاهز للاختبار؟ انتقل للبدء في الاختبار التشخيصي ⚡</span>
        </button>
      </div>

    </div>
  );
};
