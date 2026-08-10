import React, { useState } from 'react';
import { 
  FileText, 
  Sparkles, 
  Volume2, 
  VolumeX, 
  Clock, 
  Bookmark, 
  Lightbulb, 
  CheckCircle2, 
  Share2, 
  Layers, 
  HelpCircle,
  Copy,
  Check
} from 'lucide-react';
import { AnalysisResult, LearningPreferences } from '../types';

interface SummaryTabProps {
  analysis: AnalysisResult;
  preferences: LearningPreferences;
  onGoToQuiz: () => void;
  onGoToFlashcards: () => void;
}

export const SummaryTab: React.FC<SummaryTabProps> = ({
  analysis,
  preferences,
  onGoToQuiz,
  onGoToFlashcards,
}) => {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const { metadata, summary } = analysis;

  const handleSpeakAudioScript = () => {
    if (!('speechSynthesis' in window)) {
      alert('خاصية القراءة الصوتية غير مدعومة في هذا المتصفح.');
      return;
    }

    if (isPlayingAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(summary.audioScript || summary.overview);
    utterance.lang = preferences.language === 'إنجليزي' ? 'en-US' : 'ar-SA';
    utterance.rate = 0.95;

    utterance.onend = () => setIsPlayingAudio(false);
    utterance.onerror = () => setIsPlayingAudio(false);

    window.speechSynthesis.speak(utterance);
    setIsPlayingAudio(true);
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      
      {/* Top Overview Hero Banner */}
      <div className="bg-gradient-to-br from-blue-950 via-violet-950 to-teal-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden border border-violet-800/40">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none" />

        <div className="relative z-10 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-violet-500/20 text-violet-300 border border-violet-500/30">
                {metadata.subject || 'ملخص شامل'}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/10 text-slate-300 border border-white/10 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-amber-400" /> {metadata.estimatedTime || '20 دقيقة'}
              </span>
            </div>

            {/* Audio Summary Listener Toggle */}
            <button
              type="button"
              onClick={handleSpeakAudioScript}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                isPlayingAudio
                  ? 'bg-amber-500 text-slate-950 border-amber-400 animate-pulse shadow-lg shadow-amber-500/20'
                  : 'bg-gradient-to-r from-blue-600 via-violet-600 to-teal-500 hover:opacity-95 text-white border-violet-500/50 hover:shadow-lg hover:shadow-violet-600/20'
              }`}
            >
              {isPlayingAudio ? (
                <>
                  <VolumeX className="w-4 h-4" />
                  <span>إيقاف الملخص الصوتـي</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-4 h-4" />
                  <span>الاستماع للملخص الصوتي 🎧</span>
                </>
              )}
            </button>
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight">
              {metadata.title}
            </h1>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-3xl">
              {summary.overview}
            </p>
          </div>

          {/* Quick Stats & Personalized Interest Badge */}
          <div className="pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-2 text-violet-200">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>الأمثلة والتشبيهات مصممة بناءً على اهتماماتك في: </span>
              <span className="font-bold text-white bg-white/10 px-2.5 py-0.5 rounded-md border border-white/10">
                {preferences.interests.join(' • ')}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={onGoToFlashcards}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-bold transition-all cursor-pointer border border-white/10"
              >
                <Layers className="w-3.5 h-3.5 text-teal-300" />
                <span>الانتقال لبطاقات الاستذكار</span>
              </button>
              <button
                onClick={onGoToQuiz}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-blue-600 via-violet-600 to-teal-500 hover:opacity-95 text-white font-bold transition-all cursor-pointer shadow-sm"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>اختبر نفسك الآن</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Key Concepts Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
              <Lightbulb className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-extrabold text-slate-900">
              النقاط والمفاهيم الأساسية ({summary.keyPoints?.length || 0})
            </h2>
          </div>
          <span className="text-xs text-slate-500">
            مبسطة ومرفقة بتشبهات من شغفك
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {summary.keyPoints?.map((point, index) => (
            <div
              key={point.id || index}
              className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200 hover:border-indigo-300 transition-all duration-200 flex flex-col justify-between space-y-4 group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-800 border border-indigo-200">
                    {point.tag || `مفهوم #${index + 1}`}
                  </span>
                  <button
                    onClick={() => copyToClipboard(`${point.title}: ${point.explanation}`, point.id)}
                    className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-slate-100 transition-all cursor-pointer"
                    title="نسخ المفهوم"
                  >
                    {copiedId === point.id ? <Check className="w-4 h-4 text-indigo-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>

                <h3 className="text-base font-extrabold text-slate-900 group-hover:text-indigo-600 transition-colors">
                  {point.title}
                </h3>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {point.explanation}
                </p>
              </div>

              {/* Interest Analogy Box */}
              {point.interestAnalogy && (
                <div className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-100 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-900">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                    <span>تشبيه من شغفك واهتماماتك ⚡:</span>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    {point.interestAnalogy}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Audio Script Text Drawer Box */}
      {summary.audioScript && (
        <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-700 flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-indigo-600" />
              النص الصوتي التوجيهي للمذاكرة (Audio Script)
            </h3>
            <button
              onClick={handleSpeakAudioScript}
              className="text-xs font-bold text-indigo-600 hover:underline cursor-pointer"
            >
              {isPlayingAudio ? 'إيقاف الصوتي' : 'استمع الآن 🎧'}
            </button>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed italic bg-white p-4 rounded-xl border border-slate-200">
            "{summary.audioScript}"
          </p>
        </div>
      )}

      {/* Bottom Call-to-action bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between p-6 bg-indigo-50/60 border border-indigo-100 rounded-2xl gap-4">
        <div>
          <h4 className="text-sm font-extrabold text-slate-900">جاهز لتثبيت هذه المفاهيم في ذهنك؟</h4>
          <p className="text-xs text-slate-600">جرب بطاقات الاستذكار التفاعلية أو انطلق للاختبار التشخيصي فوراً</p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onGoToFlashcards}
            className="px-4 py-2.5 rounded-xl bg-white text-indigo-900 font-bold text-xs border border-indigo-200 hover:bg-indigo-50 transition-all cursor-pointer"
          >
            بطاقات الاستذكار 🎴
          </button>
          <button
            onClick={onGoToQuiz}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs shadow-md shadow-indigo-600/20 hover:bg-indigo-700 transition-all cursor-pointer"
          >
            بدء الاختبار التشخيصي 📝
          </button>
        </div>
      </div>

    </div>
  );
};
