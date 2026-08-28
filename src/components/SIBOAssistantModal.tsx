import React, { useState, useRef, useEffect } from 'react';
import { SiboPhase } from '../types';
import {
  Sparkles,
  Send,
  Bot,
  User,
  HelpCircle,
  ArrowRight,
  Mic,
  MicOff,
  RotateCcw,
  MessageSquare,
} from 'lucide-react';

interface SIBOAssistantModalProps {
  currentPhase: SiboPhase;
}

interface Message {
  role: 'user' | 'assistant';
  text: string;
  time: string;
}

export const SIBOAssistantModal: React.FC<SIBOAssistantModalProps> = ({ currentPhase }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      text: `שלום ניר ואבא! 🌿 אני יועץ התזונה הקליני המומחה ל-SIBO. 
אני כאן כדי לענות על כל שאלה בנוגע למאכלים מותרים ואסורים, טיפים להכנה, תחליפים טעימים לשום/בצל, אכילה במסעדות או מרווחי ארוחות (MMC).
באיזה נושא אוכל לעזור לכם עכשיו?`,
      time: new Date().toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Microphone / Speech Recognition State
  const [isListening, setIsListening] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const isPhase1 = currentPhase === 'phase1_strict';

  const quickQuestions = [
    'איך אוכלים סושי בבטחה בלי להכניס שום/בצל?',
    'מה מותר לשתות בבוקר במקום חלב פרה?',
    'למה בצל ושום כל כך מסוכנים לסיבו?',
    'איזה חטיף או נשנוש מהיר מותר לי לקחת?',
    'מה מותר לאכול בארוחת בוקר קלה?',
  ];

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Speech Recognition Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {}
      }
    };
  }, []);

  // Web Speech API for Hebrew Voice Dictation
  const handleToggleVoiceInput = () => {
    if (isListening) {
      try {
        recognitionRef.current?.stop();
      } catch {}
      setIsListening(false);
      return;
    }

    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRec) {
      setSpeechError('הדפדפן שלך אינו תומך בהקראה קולית ישירה. מומלץ להשתמש ב-Google Chrome או Edge.');
      return;
    }

    try {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {}
      }

      const recognition = new SpeechRec();
      recognition.lang = 'he-IL';
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
        setSpeechError(null);
      };

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }

        if (transcript.trim()) {
          setInputQuery((prev) => {
            if (!prev.trim()) return transcript.trim();
            const separator = prev.endsWith(' ') || prev.endsWith(',') ? '' : ' ';
            return `${prev}${separator}${transcript.trim()}`;
          });
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error in SIBO assistant:', event.error);
        setIsListening(false);
        if (event.error === 'not-allowed') {
          setSpeechError('יש לאשר גישה למיקרופון בהגדרות הדפדפן כדי להקריא שאלות.');
        } else if (event.error !== 'no-speech') {
          setSpeechError('לא נקלט קול, לחצי שוב על המיקרופון ודברי.');
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error('Failed to initialize speech recognition:', err);
      setIsListening(false);
      setSpeechError('שגיאה בהפעלת המיקרופון. אנא נסי שוב.');
    }
  };

  const handleSend = async (queryToSend?: string) => {
    const text = (queryToSend || inputQuery).trim();
    if (!text || isLoading) return;

    if (isListening) {
      try {
        recognitionRef.current?.stop();
      } catch {}
      setIsListening(false);
    }

    const userMsg: Message = {
      role: 'user',
      text,
      time: new Date().toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/sibo-consult', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: text,
          phase: currentPhase,
        }),
      });

      const data = await response.json();

      const botMsg: Message = {
        role: 'assistant',
        text: data.answer || 'לא התקבלה תשובה מהמומחה. נסה שוב.',
        time: new Date().toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: 'אירעה שגיאה בחיבור למומחה. אנא נסי שוב מאוחר יותר.',
          time: new Date().toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div id="sibo-consult-container" className="w-full max-w-4xl mx-auto space-y-6 animate-fadeIn">
      {/* Title */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-100 text-purple-900 font-bold text-xs">
          <MessageSquare className="w-4 h-4 text-purple-700" />
          <span>ייעוץ תזונתי קליני מבוסס בינה מלאכותית</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
          ייעוץ תזונתי קליני ל-SIBO 💬
        </h2>
        <p className="text-xs sm:text-sm text-stone-600 max-w-xl mx-auto leading-relaxed">
          שאלי כל שאלה בנוגע למזונות מותרים, רכיבים מוסתרים במוצרים, תחליפים למטבח והתמודדות עם סיבו — בהקלדה או בהקראה קולית ישירה.
        </p>
      </div>

      {/* Chat Card */}
      <div className="bg-white rounded-3xl border-2 border-stone-200 shadow-md overflow-hidden flex flex-col h-[580px]">
        {/* Messages Scroll Area */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 bg-stone-50/60">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <div
                className={`w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 shadow-xs ${
                  msg.role === 'user'
                    ? 'bg-stone-900 text-white'
                    : 'bg-gradient-to-br from-emerald-600 to-teal-700 text-white'
                }`}
              >
                {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`max-w-[82%] rounded-3xl p-4 sm:p-4.5 text-xs sm:text-sm leading-relaxed whitespace-pre-line shadow-xs ${
                  msg.role === 'user'
                    ? 'bg-gradient-to-r from-emerald-700 to-teal-800 text-white rounded-tr-xs'
                    : 'bg-white text-stone-900 border border-stone-200 rounded-tl-xs'
                }`}
              >
                <p>{msg.text}</p>
                <span
                  className={`block text-[10px] mt-2 font-mono ${
                    msg.role === 'user' ? 'text-emerald-200 text-left' : 'text-stone-400 text-right'
                  }`}
                >
                  {msg.time}
                </span>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3 items-center text-xs text-stone-600 bg-white p-3.5 rounded-2xl border border-stone-200 w-fit shadow-xs animate-pulse">
              <Bot className="w-4 h-4 text-emerald-600 animate-spin" />
              <span className="font-bold">המומחה מנתח ומנסח תשובה מבוססת מחקרים...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Listening / Microphone Active Banner */}
        {isListening && (
          <div className="p-3 bg-gradient-to-r from-rose-50 via-red-50 to-amber-50 border-t-2 border-b-2 border-rose-300 flex items-center justify-between gap-3 text-rose-950 text-xs sm:text-sm animate-pulse shrink-0">
            <div className="flex items-center gap-2.5">
              <span className="w-3 h-3 rounded-full bg-rose-600 animate-ping" />
              <strong className="font-black">מקשיב עכשיו...</strong>
              <span>דברי חופשי (השאלה תיכתב ישירות בתיבה)</span>
            </div>
            <button
              type="button"
              onClick={handleToggleVoiceInput}
              className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold text-xs cursor-pointer shrink-0"
            >
              סיום הקראה
            </button>
          </div>
        )}

        {/* Speech Error Banner */}
        {speechError && (
          <div className="p-2.5 bg-amber-50 border-t border-amber-300 text-amber-900 text-xs flex items-center justify-between gap-2 shrink-0">
            <span>⚠️ {speechError}</span>
            <button
              type="button"
              onClick={() => setSpeechError(null)}
              className="text-amber-800 font-bold hover:underline"
            >
              ✕
            </button>
          </div>
        )}

        {/* Quick Questions suggestion bar */}
        <div className="p-2.5 bg-stone-100/90 border-t border-stone-200 overflow-x-auto scrollbar-none flex items-center gap-2 text-xs shrink-0">
          <span className="text-stone-500 font-extrabold shrink-0 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
            <span>שאלות נפוצות:</span>
          </span>
          {quickQuestions.map((q, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSend(q)}
              disabled={isLoading}
              className="bg-white hover:bg-emerald-50 text-stone-800 hover:text-emerald-950 border border-stone-200 hover:border-emerald-300 px-3 py-1.5 rounded-xl whitespace-nowrap font-bold transition-all shrink-0 cursor-pointer shadow-2xs active:scale-95 text-xs"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Input Bar with Direct Microphone Voice Button */}
        <div className="p-3 sm:p-4 bg-white border-t border-stone-200 shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <div className="relative flex-1">
              <input
                type="text"
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                placeholder="שאלי שאלה על מאכל, תבלין, מסעדה, תסמין או הקריאי בקול..."
                className="w-full pl-10 pr-4 py-3 bg-stone-50 focus:bg-white border-2 border-stone-200 focus:border-purple-500 rounded-2xl text-xs sm:text-sm font-semibold outline-none transition-all"
              />
              {inputQuery && (
                <button
                  type="button"
                  onClick={() => setInputQuery('')}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 text-xs font-bold bg-stone-200 hover:bg-stone-300 w-5 h-5 rounded-full flex items-center justify-center cursor-pointer"
                  title="נקה"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Microphone Voice Button */}
            <button
              type="button"
              onClick={handleToggleVoiceInput}
              className={`p-3 rounded-2xl text-xs font-black transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer active:scale-95 shrink-0 ${
                isListening
                  ? 'bg-rose-600 hover:bg-rose-700 text-white ring-4 ring-rose-400/40 animate-pulse'
                  : 'bg-stone-100 hover:bg-purple-50 text-stone-700 hover:text-purple-900 border-2 border-stone-200 hover:border-purple-300'
              }`}
              title="הקראה קולית דרך המיקרופון"
            >
              {isListening ? (
                <MicOff className="w-5 h-5 animate-bounce" />
              ) : (
                <Mic className="w-5 h-5 text-purple-600" />
              )}
            </button>

            {/* Send Button */}
            <button
              type="submit"
              disabled={isLoading || !inputQuery.trim()}
              className="p-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:from-stone-300 disabled:to-stone-400 text-white rounded-2xl transition-all shadow-sm cursor-pointer active:scale-95 shrink-0 flex items-center justify-center"
              title="שלח שאלה"
            >
              <Send className="w-5 h-5 rtl:rotate-180" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
