import React, { useState, useRef, useEffect } from 'react';
import Markdown from 'react-markdown';
import { 
  Sparkles, 
  Send, 
  Bot, 
  User, 
  X, 
  Loader2, 
  BookOpen, 
  MessageSquare, 
  Lightbulb, 
  CornerDownLeft,
  Volume2
} from 'lucide-react';
import { ChatMessage, LearningPreferences } from '../types';

interface TutorChatProps {
  isOpen: boolean;
  onClose: () => void;
  documentContext?: string;
  documentTitle?: string;
  preferences: LearningPreferences;
}

export const TutorChat: React.FC<TutorChatProps> = ({
  isOpen,
  onClose,
  documentContext,
  documentTitle,
  preferences,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'tutor',
      text: `أهلاً بك يا بطل! أنا معلمك الخصوصي **وافي** 🌟. 
أنا جاهز للإجابة على جميع أسئلتك حول **"${documentTitle || 'المستند الدراسي'}"** وتبسيط المعقد بأسلوب يشبه شغفك وإشارتك. 

ما الفكرة التي تود أن نبدأ بشرحها الآن؟`,
      timestamp: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const promptSuggestions = [
    'اشرح لي المفاهيم الأساسية ببساطة شديدة',
    `أعطني مثالاً تطبيقياً من اهتماماتي (${preferences.interests[0] || 'الألعاب'})`,
    'ما هي الأسئلة الأكثر توقعاً في الاختبار لهذا الدرس؟',
    'بسط لي الفرق بين الأفكار الرئيسية في المستند',
  ];

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  if (!isOpen) return null;

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputQuery).trim();
    if (!query || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/tutor-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          chatHistory: messages.map((m) => ({ sender: m.sender, text: m.text })),
          documentContext,
          level: preferences.level,
          language: preferences.language,
          interests: preferences.interests,
        }),
      });

      const data = await res.json();
      if (data.success && data.reply) {
        const tutorMsg: ChatMessage = {
          id: `tutor-${Date.now()}`,
          sender: 'tutor',
          text: data.reply,
          timestamp: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, tutorMsg]);
      } else {
        const errorMsg: ChatMessage = {
          id: `err-${Date.now()}`,
          sender: 'tutor',
          text: 'عذراً، حدث خطأ أثناء إعداد الإجابة. يرجى إعادة المحاولة.',
          timestamp: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, errorMsg]);
      }
    } catch (err) {
      console.error('Chat error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex justify-end transition-all">
      <div className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col justify-between border-r border-slate-200">
        
        {/* Chat Drawer Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-blue-950 via-violet-950 to-slate-900 text-white flex items-center justify-between border-b border-violet-800/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 via-violet-600 to-teal-500 text-white flex items-center justify-center font-bold shadow-md shadow-violet-500/20">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-sm sm:text-base">المعلم وافي (Wafi)</h3>
                <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
              </div>
              <p className="text-[11px] text-violet-200 truncate max-w-[220px]">
                {documentTitle || 'رفيقك الذكي للمذاكرة'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-xl transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Chat Messages Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/60 custom-scrollbar">
          
          {messages.map((msg) => {
            const isTutor = msg.sender === 'tutor';
            return (
              <div
                key={msg.id}
                className={`flex gap-3 text-xs sm:text-sm ${
                  isTutor ? 'items-start' : 'items-end flex-row-reverse'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                    isTutor
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-900 text-white shadow-xs'
                  }`}
                >
                  {isTutor ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                </div>

                <div className={`space-y-1 max-w-[85%] ${isTutor ? 'text-right' : 'text-right'}`}>
                  <div
                    className={`p-4 rounded-2xl ${
                      isTutor
                        ? 'bg-white text-slate-800 border border-slate-200 shadow-xs'
                        : 'bg-indigo-600 text-white shadow-sm'
                    }`}
                  >
                    {isTutor ? (
                      <div className="markdown-body font-sans space-y-2 leading-relaxed">
                        <Markdown>{msg.text}</Markdown>
                      </div>
                    ) : (
                      <p className="leading-relaxed font-medium">{msg.text}</p>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-400 block px-1">{msg.timestamp}</span>
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex items-center gap-3 text-xs text-slate-500 bg-white p-3 rounded-2xl border border-slate-200 w-max animate-pulse">
              <Loader2 className="w-4 h-4 text-indigo-600 animate-spin" />
              <span>وافي يكتـب لك الشرح بأسلوب مبسط...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Prompts Bar */}
        <div className="p-3 bg-white border-t border-slate-100 overflow-x-auto no-scrollbar flex items-center gap-2">
          {promptSuggestions.map((prompt, pIdx) => (
            <button
              key={pIdx}
              onClick={() => handleSendMessage(prompt)}
              className="px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200 text-[11px] font-bold whitespace-nowrap shrink-0 cursor-pointer transition-all"
            >
              💡 {prompt}
            </button>
          ))}
        </div>

        {/* Chat Input Form */}
        <div className="p-4 bg-white border-t border-slate-200 space-y-2">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder="اكتب سؤالك هنا لمعلمك وافي..."
              className="flex-1 py-3 px-4 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
            />
            <button
              type="submit"
              disabled={isLoading || !inputQuery.trim()}
              className={`p-3 rounded-xl bg-indigo-600 text-white transition-all cursor-pointer ${
                isLoading || !inputQuery.trim()
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:bg-indigo-700 shadow-md shadow-indigo-600/20'
              }`}
            >
              <Send className="w-4 h-4 rotate-180" />
            </button>
          </form>
          <p className="text-[10px] text-slate-400 text-center">
            وافي يُسخّر قدرات الذكاء الاصطناعي لمساعدتك في فهم ملزمتك الدراسية
          </p>
        </div>

      </div>
    </div>
  );
};
