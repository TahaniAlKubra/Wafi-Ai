import React from 'react';
import { BookOpen, FileText, BrainCircuit, RefreshCw, Layers, CheckCircle2, MessageSquareText } from 'lucide-react';
import { WafiLogo } from './WafiLogo';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  documentTitle?: string;
  hasAnalyzed: boolean;
  onReset: () => void;
  weakCount: number;
  onOpenChat: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  documentTitle,
  hasAnalyzed,
  onReset,
  weakCount,
  onOpenChat,
}) => {
  const tabs = [
    { id: 'summary', label: 'الملخص الرئيسي', icon: FileText },
    { id: 'flashcards', label: 'بطاقات الاستذكار', icon: Layers },
    { id: 'quiz', label: 'اختبر نفسك والتشخيص', icon: BrainCircuit },
    {
      id: 'remedial',
      label: 'الجرعة العلاجية',
      icon: CheckCircle2,
      badge: weakCount > 0 ? weakCount : null,
    },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs transition-all">
      {/* Top 3-Color Triadic Gradient Line */}
      <div className="h-1.5 w-full bg-gradient-to-r from-blue-600 via-violet-600 to-teal-500" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo & Branding */}
          <div className="flex items-center gap-3">
            <WafiLogo size="md" />
            <span className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-violet-50 text-violet-700 border border-violet-200">
              <span className="w-2 h-2 bg-teal-500 rounded-full animate-pulse"></span>
              Gemini متصل
            </span>
          </div>

          {/* Navigation Tabs (Only visible when document is analyzed) */}
          {hasAnalyzed && (
            <nav className="flex items-center gap-1 bg-slate-100/90 p-1.5 rounded-2xl border border-slate-200 overflow-x-auto no-scrollbar">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap relative ${
                      isActive
                        ? 'bg-white text-violet-900 shadow-xs border border-violet-200/80'
                        : 'text-slate-600 hover:text-violet-700 hover:bg-slate-200/60'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-violet-600' : 'text-slate-400'}`} />
                    <span>{tab.label}</span>
                    {tab.badge && (
                      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-black bg-rose-500 text-white animate-bounce shadow-xs">
                        {tab.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          )}

          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            {hasAnalyzed && (
              <>
                <button
                  onClick={onOpenChat}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-blue-600 via-violet-600 to-teal-600 hover:opacity-95 text-white shadow-md shadow-violet-500/20 transition-all cursor-pointer"
                  title="تحدث مع معلمك الخصوصي وافي"
                >
                  <MessageSquareText className="w-4 h-4" />
                  <span className="hidden sm:inline">المساعد الذكي</span>
                </button>

                <button
                  onClick={onReset}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:text-violet-700 hover:bg-violet-50 border border-slate-200 transition-all cursor-pointer"
                  title="رفع ملف جديد"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span className="hidden lg:inline">رفع ملف جديد</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Current Document Subheader */}
        {hasAnalyzed && documentTitle && (
          <div className="py-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <div className="flex items-center gap-2 truncate">
              <BookOpen className="w-3.5 h-3.5 text-violet-600 shrink-0" />
              <span className="font-semibold text-slate-700 truncate">{documentTitle}</span>
            </div>
            <div className="text-[11px] text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-md font-bold border border-teal-200 shrink-0 flex items-center gap-1">
              <span>تم تحليل المستند بواسطة وافي ✨</span>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
