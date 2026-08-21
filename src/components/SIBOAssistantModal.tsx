import React, { useState } from 'react';
import { SiboPhase } from '../types';
import { Sparkles, Send, Bot, User, HelpCircle, ArrowRight } from 'lucide-react';

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

  const isPhase1 = currentPhase === 'phase1_strict';

  const quickQuestions = [
    'איך אוכלים סושי בבטחה בלי להכניס שום/בצל?',
    'מה מותר לשתות בבוקר במקום חלב פרה?',
    'למה בצל ושום כל כך מסוכנים לסיבו?',
    'איזה חטיף או נשנוש מהיר מותר לי לקחת?',
    'מה מותר לאכול בארוחת בוקר קלה?',
  ];

  const handleSend = async (queryToSend?: string) => {
    const text = (queryToSend || inputQuery).trim();
    if (!text || isLoading) return;

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
    <div id="sibo-consult-container" className="w-full max-w-4xl mx-auto space-y-6">
      {/* Title */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
          ייעוץ תזונתי קליני ל-SIBO 💬
        </h2>
        <p className="text-sm text-stone-600 max-w-xl mx-auto">
          שאלי כל שאלה בנוגע למזונות מותרים, רכיבים מוסתרים במוצרים, תחליפים למטבח והתמודדות עם סיבו
        </p>
      </div>

      {/* Chat Card */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden flex flex-col h-[560px]">
        {/* Messages Scroll Area */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 bg-stone-50/50">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  msg.role === 'user'
                    ? 'bg-stone-900 text-white'
                    : 'bg-emerald-600 text-white'
                }`}
              >
                {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`max-w-[80%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed whitespace-pre-line ${
                  msg.role === 'user'
                    ? 'bg-emerald-700 text-white rounded-tr-xs'
                    : 'bg-white text-stone-800 border border-stone-200 shadow-2xs rounded-tl-xs'
                }`}
              >
                <p>{msg.text}</p>
                <span
                  className={`block text-[10px] mt-1.5 ${
                    msg.role === 'user' ? 'text-emerald-200 text-left' : 'text-stone-400 text-right'
                  }`}
                >
                  {msg.time}
                </span>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3 items-center text-xs text-stone-500 bg-white p-3 rounded-2xl border border-stone-200 w-fit">
              <Bot className="w-4 h-4 text-emerald-600 animate-spin" />
              <span>המומחה כותב תשובה מבוססת מחקרים...</span>
            </div>
          )}
        </div>

        {/* Quick Questions suggestion bar */}
        <div className="p-2.5 bg-stone-100 border-t border-stone-200 overflow-x-auto scrollbar-none flex items-center gap-2 text-xs">
          <span className="text-stone-500 font-bold shrink-0">שאלות נפוצות:</span>
          {quickQuestions.map((q, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSend(q)}
              disabled={isLoading}
              className="bg-white hover:bg-emerald-50 text-stone-700 hover:text-emerald-900 border border-stone-200 px-3 py-1 rounded-xl whitespace-nowrap font-medium transition-all"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3 sm:p-4 bg-white border-t border-stone-200">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder="שאלי שאלה על מאכל, תבלין, מסעדה או תסמין..."
              className="flex-1 p-3 bg-stone-50 border border-stone-300 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            />
            <button
              type="submit"
              disabled={isLoading || !inputQuery.trim()}
              className="p-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-stone-300 text-white rounded-xl transition-all shadow-xs"
            >
              <Send className="w-4 h-4 rtl:rotate-180" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
