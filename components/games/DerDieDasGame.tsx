'use client';

import { useState, useEffect, useCallback } from 'react';
import { contentApi, userApi } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

const GENDER_LABELS: Record<string, { label: string; color: string }> = {
  maskulin: { label: 'DER', color: 'text-blue-600' },
  feminin: { label: 'DIE', color: 'text-pink-600' },
  neutrum: { label: 'DAS', color: 'text-green-600' },
};

// Get token from localStorage (set after login)
function getToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('lx_token') || null;
  }
  return null;
}

export function DerDieDasGame() {
  const [vocab, setVocab] = useState<Array<any>>([]);
  const [currentItem, setCurrentItem] = useState<any>(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | null>(null);
  const [timerId, setTimerId] = useState<ReturnType<typeof setInterval> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch vocab from backend (no content hardcoded in frontend)
  const loadVocab = useCallback(async () => {
    try {
      setLoading(true);
      const data = await contentApi.getVocab();
      if (data && data.length > 0) {
        setVocab(data);
      } else {
        setError('No vocabulary available from backend.');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load vocabulary from backend.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadVocab();
  }, [loadVocab]);

  useEffect(() => {
    if (vocab.length > 0 && !currentItem && !loading) {
      nextQuestion();
    }
  }, [vocab.length, currentItem, loading]);

  const nextQuestion = useCallback(() => {
    if (vocab.length === 0) return;
    const randomItem = vocab[Math.floor(Math.random() * vocab.length)];
    setCurrentItem(randomItem);
    setMessage('');
    setMessageType(null);
  }, [vocab]);

  useEffect(() => {
    if (timeLeft > 0 && !timerId) {
      const id = setInterval(() => {
        setTimeLeft((t) => {
          if (t <= 1) {
            clearInterval(id);
            setTimerId(null);
            setTimeLeft(0);
            return 0;
          }
          return t - 1;
        });
      }, 1000);
      setTimerId(id);
    }
    return () => {
      if (timerId) clearInterval(timerId);
    };
  }, [timeLeft, timerId]);

  const handleAnswer = useCallback(
    async (chosenGender: string) => {
      if (!currentItem) return;

      const isCorrect = currentItem.gender === chosenGender;
      const token = getToken();

      if (isCorrect) {
        setStreak((s) => s + 1);
        const addedXP = Math.round(12 * (1 + Math.min(streak, 4) * 0.45));
        setScore((s) => s + addedXP);
        setTimeLeft((t) => Math.min(60, t + 1));
        setMessage(`Correct! +${addedXP} XP`);
        setMessageType('success');

        // Send XP to backend (validated server-side)
        if (token) {
          try {
            const userId = localStorage.getItem('lx_user_id') || 'unknown';
            await userApi.addXP(userId, addedXP, 'Der Die Das correct answer', token);
          } catch {
            // Backend will validate; ignore errors for game flow
          }
        }
      } else {
        setStreak(0);
        setTimeLeft((t) => Math.max(20, t - 5));
        setMessage(`Wrong. The correct article is ${GENDER_LABELS[currentItem.gender].label}.`);
        setMessageType('error');
      }

      setTimeout(() => {
        nextQuestion();
      }, 1500);
    },
    [currentItem, streak, nextQuestion]
  );

  if (error) {
    return (
      <div className="max-w-md mx-auto py-12">
        <div className="p-8 rounded-xl border border-amber-200 bg-amber-50 text-center shadow-lg">
          <h2 className="text-2xl font-bold text-amber-900 mb-4">Unable to Load Game</h2>
          <p className="text-amber-700 mb-6">{error}</p>
          <Button onClick={() => {
            setError(null);
            setLoading(true);
            loadVocab();
          }}>Retry</Button>
        </div>
      </div>
    );
  }

  if (loading || timeLeft <= 0) {
    if (timeLeft <= 0) {
      return (
        <div className="max-w-md mx-auto py-12">
          <div className="p-8 rounded-xl border border-slate-200 bg-white text-center shadow-lg">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Time's Up!</h2>
            <p className="text-slate-600 mb-6">
              Final Score: {score} XP (Streak: {streak})
            </p>
            <Button onClick={() => {
              setScore(0);
              setStreak(0);
              setTimeLeft(60);
              setTimerId(null);
              nextQuestion();
            }}>Play Again</Button>
          </div>
        </div>
      );
    }
    return (
      <div className="max-w-md mx-auto py-12">
        <div className="p-8 rounded-xl border border-slate-200 bg-white text-center shadow-lg">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Loading Game…</h2>
          <p className="text-slate-600">Fetching vocabulary from backend.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto py-8">
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
          <span>⏱️ {timeLeft}s</span>
          <span className="text-slate-400">|</span>
          <span>⭐ {score} XP</span>
          <span className="text-slate-400">|</span>
          <span>🔥 {streak}</span>
        </div>
      </div>

      {currentItem && (
        <div className="p-8 rounded-xl border border-slate-200 bg-white shadow-sm text-center">
          <div className="text-4xl font-bold text-slate-900 mb-2">
            {currentItem.de.replace(/^(der|die|das)\s+/i, '')}
          </div>
          <div className="text-sm text-slate-500 mb-6">
            {currentItem.ar || currentItem.de}
          </div>

          {message && (
            <div className={`mb-6 p-3 rounded-lg text-sm font-medium ${
              messageType === 'success'
                ? 'bg-green-100 text-green-700 border border-green-200'
                : 'bg-amber-100 text-amber-700 border border-amber-200'
            }`}>
              {message}
            </div>
          )}

          <div className="grid grid-cols-3 gap-3">
            <Button
              onClick={() => handleAnswer('maskulin')}
              variant="outline"
              className="text-blue-600 border-blue-200 hover:bg-blue-50"
            >
              <Badge variant="default" className="mr-2">DER</Badge>
              Masculine
            </Button>
            <Button
              onClick={() => handleAnswer('feminin')}
              variant="outline"
              className="text-pink-600 border-pink-200 hover:bg-pink-50"
            >
              <Badge variant="default" className="mr-2">DIE</Badge>
              Feminine
            </Button>
            <Button
              onClick={() => handleAnswer('neutrum')}
              variant="outline"
              className="text-green-600 border-green-200 hover:bg-green-50"
            >
              <Badge variant="default" className="mr-2">DAS</Badge>
              Neuter
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
