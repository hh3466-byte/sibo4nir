import React, { useState } from 'react';
import { MealLogEntry, TrafficLightStatus } from '../types';
import {
  Calendar,
  Smile,
  Meh,
  Frown,
  Plus,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  TrendingUp,
} from 'lucide-react';

interface SymptomDiaryProps {
  entries: MealLogEntry[];
  onAddEntry: (entry: Omit<MealLogEntry, 'id' | 'timestamp'>) => void;
  onDeleteEntry: (id: string) => void;
}

export const SymptomDiary: React.FC<SymptomDiaryProps> = ({
  entries,
  onAddEntry,
  onDeleteEntry,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [foodName, setFoodName] = useState('');
  const [status, setStatus] = useState<TrafficLightStatus>('GREEN');
  const [mealType, setMealType] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack'>('lunch');
  const [bloating, setBloating] = useState(0);
  const [pain, setPain] = useState(0);
  const [energy, setEnergy] = useState(4);
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!foodName.trim()) return;
    onAddEntry({
      foodName: foodName.trim(),
      status,
      mealType,
      notes: notes.trim(),
      symptoms: {
        bloating,
        pain,
        energy,
      },
    });
    setFoodName('');
    setNotes('');
    setShowAddForm(false);
  };

  const mealTypeLabels: Record<string, string> = {
    breakfast: 'ארוחת בוקר ☕',
    lunch: 'ארוחת צהריים 🥗',
    dinner: 'ארוחת ערב 🍲',
    snack: 'נשנוש ביניים 🍎',
  };

  return (
    <div id="symptom-diary-container" className="w-full max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-stone-900 tracking-tight">
            יומן הארוחות והתחושות של ניר 📔
          </h2>
          <p className="text-sm text-stone-500">
            מעקב אחר מאכלים שנאכלו, רמת נפיחות בבטן והרגשה כללית
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-xs flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>{showAddForm ? 'סגור טופס' : 'רישום ארוחה חדשה'}</span>
        </button>
      </div>

      {/* Add New Entry Form */}
      {showAddForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-3xl p-6 border-2 border-emerald-300 shadow-sm space-y-4 animate-fadeIn"
        >
          <h3 className="text-base font-bold text-stone-900">תיעוד ארוחה חדשה</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">מה ניר אכלה?</label>
              <input
                type="text"
                value={foodName}
                onChange={(e) => setFoodName(e.target.value)}
                placeholder="למשל: חזה עוף עם אורז ומלפפון"
                className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">סוג ארוחה:</label>
              <select
                value={mealType}
                onChange={(e) => setMealType(e.target.value as any)}
                className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              >
                <option value="breakfast">ארוחת בוקר</option>
                <option value="lunch">ארוחת צהריים</option>
                <option value="dinner">ארוחת ערב</option>
                <option value="snack">נשנוש ביניים</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                נפיחות בבטן (0 = שטוחה לחלוטין, 5 = בלון): {bloating}
              </label>
              <input
                type="range"
                min="0"
                max="5"
                value={bloating}
                onChange={(e) => setBloating(Number(e.target.value))}
                className="w-full accent-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                כאב / אי-נוחות (0 = ללא כאב כלל, 5 = עז): {pain}
              </label>
              <input
                type="range"
                min="0"
                max="5"
                value={pain}
                onChange={(e) => setPain(Number(e.target.value))}
                className="w-full accent-amber-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                רמת אנרגיה (0 = מותשת, 5 = מצוין): {energy}
              </label>
              <input
                type="range"
                min="0"
                max="5"
                value={energy}
                onChange={(e) => setEnergy(Number(e.target.value))}
                className="w-full accent-emerald-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">הערות אישיות (אופציונלי):</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="למשל: הרגישה מעולה, לא היו גזים כלל"
              className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 text-stone-600 hover:bg-stone-100 rounded-xl text-xs font-semibold"
            >
              ביטול
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs"
            >
              שמור רישום
            </button>
          </div>
        </form>
      )}

      {/* Entries List */}
      <div className="space-y-3">
        {entries.length > 0 ? (
          entries.map((item) => {
            const isGreen = item.status === 'GREEN';
            const isYellow = item.status === 'YELLOW';
            const isRed = item.status === 'RED';

            const dateStr = new Date(item.timestamp).toLocaleDateString('he-IL', {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <div
                key={item.id}
                className="bg-white p-5 rounded-3xl border border-stone-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 mt-0.5 ${
                      isGreen
                        ? 'bg-emerald-100 text-emerald-800'
                        : isYellow
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {isGreen ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : isYellow ? (
                      <AlertTriangle className="w-5 h-5" />
                    ) : (
                      <XCircle className="w-5 h-5" />
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-stone-900 text-base">{item.foodName}</h4>
                      <span className="text-xs text-stone-400">({mealTypeLabels[item.mealType] || item.mealType})</span>
                    </div>
                    <span className="text-xs text-stone-400">{dateStr}</span>

                    {item.notes && (
                      <p className="text-xs text-stone-600 mt-1 bg-stone-50 p-2 rounded-lg border border-stone-100">
                        {item.notes}
                      </p>
                    )}
                  </div>
                </div>

                {/* Symptoms Badges */}
                <div className="flex items-center gap-3">
                  {item.symptoms && (
                    <div className="flex items-center gap-2 text-xs bg-stone-50 p-2 rounded-xl border border-stone-200">
                      <span title="נפיחות">
                        🎈 נפיחות: <strong>{item.symptoms.bloating}/5</strong>
                      </span>
                      <span className="text-stone-300">|</span>
                      <span title="כאב">
                        ⚡ כאב: <strong>{item.symptoms.pain}/5</strong>
                      </span>
                    </div>
                  )}

                  <button
                    onClick={() => onDeleteEntry(item.id)}
                    className="p-2 text-stone-400 hover:text-rose-600 rounded-lg hover:bg-stone-100 transition-colors"
                    title="מחק רישום"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="py-12 bg-white rounded-3xl border border-stone-200 text-center space-y-3 p-6 text-stone-500">
            <Calendar className="w-10 h-10 text-stone-300 mx-auto" />
            <p className="text-base font-semibold text-stone-800">היומן של ניר ריק כרגע</p>
            <p className="text-xs text-stone-400 max-w-sm mx-auto">
              לאחר סריקת מאכל ברמזור תוכלי ללחוץ על "הוסף ליומן של ניר" או להוסיף ארוחות ידנית כדי לעקוב אחר
              התחושות בבטן.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
