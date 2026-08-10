import React, { useState, useRef } from 'react';
import { 
  FileUp, 
  Sparkles, 
  Check, 
  Gamepad2, 
  Trophy, 
  Cpu, 
  Film, 
  Car, 
  Compass, 
  BookOpen, 
  Sliders, 
  Globe, 
  Gauge, 
  FileCheck,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { ExplanationLevel, LanguagePref, LearningPreferences, StudyDocument } from '../types';
import { SAMPLE_DOCUMENTS, STUDENT_INTERESTS } from '../data/sampleDocs';
import { WafiLogo } from './WafiLogo';

interface UploadSectionProps {
  onAnalyze: (document: StudyDocument, preferences: LearningPreferences) => void;
  isLoading: boolean;
  loadingMessage?: string;
}

export const UploadSection: React.FC<UploadSectionProps> = ({
  onAnalyze,
  isLoading,
  loadingMessage,
}) => {
  const [selectedDoc, setSelectedDoc] = useState<StudyDocument | null>(SAMPLE_DOCUMENTS[0]);
  const [level, setLevel] = useState<ExplanationLevel>('متوسط');
  const [language, setLanguage] = useState<LanguagePref>('عربي');
  const [selectedInterests, setSelectedInterests] = useState<string[]>(['gaming', 'tech']);
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const iconMap: Record<string, React.ElementType> = {
    Gamepad2,
    Trophy,
    Cpu,
    Film,
    Car,
    Compass,
  };

  const toggleInterest = (id: string) => {
    setSelectedInterests((prev) => {
      if (prev.includes(id)) {
        if (prev.length === 1) return prev; // Keep at least one interest
        return prev.filter((item) => item !== id);
      }
      return [...prev, id];
    });
  };

  const handleFileUpload = (file: File) => {
    setUploadError(null);
    if (file.type !== 'application/pdf' && !file.name.endsWith('.pdf')) {
      setUploadError('يرجى رفع ملف بصيغة PDF فقط.');
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      setUploadError('حجم الملف كبير جداً (الأقصى 20 ميجابايت).');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const newDoc: StudyDocument = {
        id: `uploaded-${Date.now()}`,
        name: file.name,
        size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        type: 'uploaded',
        base64: result,
      };
      setSelectedDoc(newDoc);
    };
    reader.onerror = () => {
      setUploadError('حدث خطأ أثناء قراءة الملف. يرجى المحاولة مرة أخرى.');
    };
    reader.readAsDataURL(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleStartAnalysis = () => {
    if (!selectedDoc) {
      setUploadError('يرجى اختيار أو رفع ملف PDF أولاً.');
      return;
    }

    const interestLabels = STUDENT_INTERESTS
      .filter((i) => selectedInterests.includes(i.id))
      .map((i) => i.label);

    onAnalyze(selectedDoc, {
      level,
      language,
      interests: interestLabels,
    });
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-10">
      
      {/* Hero Welcome Banner */}
      <div className="text-center space-y-4 max-w-3xl mx-auto flex flex-col items-center">
        {/* Wafi Branding Logo Display */}
        <div className="mb-2">
          <WafiLogo size="lg" />
        </div>

        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold bg-gradient-to-r from-blue-50 via-violet-50 to-teal-50 text-slate-800 border border-violet-200/80 shadow-2xs">
          <Sparkles className="w-4 h-4 text-violet-600 animate-spin" style={{ animationDuration: '4s' }} />
          <span>منصة وافي التعليمية الذكية – رفيقك الذكي للمذاكرة</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-snug">
          حوّل أي كتاب أو ملزمة <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-violet-600 to-teal-500">PDF</span> إلى تجربة دراسية تفاعلية
        </h1>
        <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
          ارفع ملفك الدراسي، وحدد شغفك واهتماماتك ليقوم الذكاء الاصطناعي بتشخيص المادة، وتبسيط المفاهيم بأمثلة تحبها، وتوفير بطاقات استذكار واختبارات علاجية مخصصة لك!
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Col: PDF Upload & Sample Materials Selection */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-xs border border-slate-200 space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white font-bold shadow-xs">
                  <FileUp className="w-5 h-5" />
                </div>
                <h2 className="text-base font-extrabold text-slate-900">1. رفع مستند PDF الدراسي</h2>
              </div>
              <span className="text-xs text-slate-400 font-semibold">ملفات PDF نصية أو مصورة</span>
            </div>

            {/* Drop Zone */}
            <div
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all duration-200 ${
                dragActive
                  ? 'border-violet-500 bg-violet-50/50 scale-[0.99]'
                  : selectedDoc?.type === 'uploaded'
                  ? 'border-teal-500 bg-teal-50/20'
                  : 'border-slate-300 hover:border-violet-400 hover:bg-slate-50/80'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,application/pdf"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileUpload(e.target.files[0]);
                  }
                }}
              />

              <div className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-100 via-violet-100 to-teal-100 flex items-center justify-center text-violet-700 shadow-2xs">
                  <FileUp className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800">
                    اسحب ملف الـ PDF إلى هنا أو <span className="text-violet-600 underline">اضغط للاختيار</span>
                  </p>
                  <p className="text-xs text-slate-400 mt-1">يدعم ملفات حتى 20 ميجابايت (الكتب، المذكرات، السلايدات)</p>
                </div>
              </div>
            </div>

            {uploadError && (
              <div className="flex items-center gap-2 p-3 bg-rose-50 text-rose-700 text-xs rounded-xl border border-rose-200 font-semibold">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{uploadError}</span>
              </div>
            )}

            {/* Selected File Display */}
            {selectedDoc && (
              <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs">
                <div className="flex items-center gap-3 truncate">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-violet-600 to-teal-500 text-white flex items-center justify-center font-extrabold text-xs shrink-0 shadow-2xs">
                    PDF
                  </div>
                  <div className="truncate">
                    <p className="font-bold text-slate-900 truncate">{selectedDoc.name}</p>
                    <p className="text-slate-500 text-[11px]">
                      {selectedDoc.type === 'uploaded' ? 'ملف مرفوع من جهازك' : 'مادة نموذجية جاهزة'} {selectedDoc.size ? `• ${selectedDoc.size}` : ''}
                    </p>
                  </div>
                </div>
                <span className="flex items-center gap-1 text-teal-700 font-bold bg-teal-50 px-3 py-1 rounded-lg border border-teal-200 shrink-0">
                  <FileCheck className="w-3.5 h-3.5 text-teal-600" /> جاهز للتحليل
                </span>
              </div>
            )}

            {/* Sample Documents Options */}
            <div className="pt-3 border-t border-slate-100 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-violet-600" /> أو جرب إحدى المواد الدراسية النموذجية فوراً:
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {SAMPLE_DOCUMENTS.map((doc) => {
                  const isSelected = selectedDoc?.id === doc.id;
                  return (
                    <button
                      key={doc.id}
                      type="button"
                      onClick={() => {
                        setSelectedDoc(doc);
                        setUploadError(null);
                      }}
                      className={`text-right p-3 rounded-2xl border transition-all cursor-pointer text-xs space-y-1 ${
                        isSelected
                          ? 'border-violet-600 bg-violet-50/80 ring-2 ring-violet-500/20 shadow-2xs'
                          : 'border-slate-200 bg-slate-50/50 hover:bg-white hover:border-slate-300'
                      }`}
                    >
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-violet-100 text-violet-800 inline-block">
                        {doc.category}
                      </span>
                      <p className="font-bold text-slate-800 line-clamp-2 leading-snug">{doc.name}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Personalization & Preferences */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-xs border border-slate-200 space-y-6">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-teal-600 flex items-center justify-center text-white font-bold shadow-xs">
                <Sliders className="w-5 h-5" />
              </div>
              <h2 className="text-base font-extrabold text-slate-900">2. تخصيص تجربة التعلم</h2>
            </div>

            {/* Explanation Level */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Gauge className="w-3.5 h-3.5 text-blue-600" /> مستوى عمق الشرح المطلوب:
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['مبتدئ', 'متوسط', 'متقدم'] as ExplanationLevel[]).map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setLevel(lvl)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                      level === lvl
                        ? 'bg-violet-600 text-white border-violet-600 shadow-2xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            {/* Language Selection */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-violet-600" /> لغة الشرح والتبسيط:
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(['عربي', 'إنجليزي'] as LanguagePref[]).map((lang) => (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => setLanguage(lang)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                      language === lang
                        ? 'bg-violet-600 text-white border-violet-600 shadow-2xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {lang === 'عربي' ? 'العربية (Arabic)' : 'الإنجليزية (English)'}
                  </button>
                ))}
              </div>
            </div>

            {/* Student Interests Grid */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" /> اهتمامات الطالب وشغفه (لتكييف الأمثلة):
                </label>
                <span className="text-[11px] text-slate-400">اختر واحداً أو أكثر</span>
              </div>

              <div className="grid grid-cols-2 gap-2 max-h-56 overflow-y-auto p-1 custom-scrollbar">
                {STUDENT_INTERESTS.map((interest) => {
                  const Icon = iconMap[interest.iconName] || Gamepad2;
                  const isChecked = selectedInterests.includes(interest.id);
                  return (
                    <button
                      key={interest.id}
                      type="button"
                      onClick={() => toggleInterest(interest.id)}
                      className={`flex items-center gap-2.5 p-2.5 rounded-2xl border text-right transition-all cursor-pointer text-xs relative ${
                        isChecked
                          ? 'bg-slate-900 text-white border-slate-800 shadow-xs ring-2 ring-violet-500/40'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <div className={`w-7 h-7 rounded-xl bg-gradient-to-br ${interest.color} flex items-center justify-center text-white shrink-0 shadow-2xs`}>
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <div className="truncate flex-1">
                        <p className="font-bold truncate text-[11px]">{interest.label}</p>
                      </div>
                      {isChecked && (
                        <div className="w-4 h-4 rounded-full bg-teal-500 text-slate-950 flex items-center justify-center shrink-0 font-bold">
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Big Launch Button with 3-Color Triadic Gradient */}
            <button
              type="button"
              disabled={isLoading || !selectedDoc}
              onClick={handleStartAnalysis}
              className={`w-full py-4 px-6 rounded-2xl font-black text-sm text-white transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer ${
                isLoading || !selectedDoc
                  ? 'bg-slate-400 cursor-not-allowed opacity-80 shadow-none'
                  : 'bg-gradient-to-r from-blue-600 via-violet-600 to-teal-500 hover:opacity-95 shadow-violet-500/25 hover:scale-[1.01] active:scale-[0.99]'
              }`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>{loadingMessage || 'جاري تحليل المستند مع وافي...'}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
                  <span>تحليل وتجهيز المادة مع وافي ⚡</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
