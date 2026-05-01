import { useState, useEffect, useCallback } from 'react';
import type { Word, PracticeResult } from '../types';

interface PracticeProps {
  words: Word[];
  onComplete: (results: PracticeResult[]) => void;
  onBack: () => void;
}

export default function Practice({ words, onComplete, onBack }: PracticeProps) {
  const [shuffledWords, setShuffledWords] = useState<Word[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [results, setResults] = useState<PracticeResult[]>([]);
  const [showFeedback, setShowFeedback] = useState(false);
  const [lastCorrect, setLastCorrect] = useState(false);
  const [voice, setVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [voicesLoaded, setVoicesLoaded] = useState(false);

  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = speechSynthesis.getVoices();
      if (availableVoices.length > 0) {
        const samantha = availableVoices.find((v) => v.name.includes('Samantha'));
        const englishVoice = availableVoices.find((v) => v.lang.startsWith('en'));
        setVoice(samantha || englishVoice || null);
        setVoicesLoaded(true);
      }
    };

    loadVoices();
    speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  useEffect(() => {
    const shuffled = [...words].sort(() => Math.random() - 0.5);
    setShuffledWords(shuffled);
  }, [words]);

  const currentWord = shuffledWords[currentIndex];

  const speakWord = useCallback((text: string) => {
    speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 0.8;
    if (voice) {
      utterance.voice = voice;
    }
    speechSynthesis.speak(utterance);
  }, [voice]);

  useEffect(() => {
    if (currentWord && !showFeedback && voicesLoaded) {
      const timer = setTimeout(() => speakWord(currentWord.english), 500);
      return () => clearTimeout(timer);
    }
  }, [currentIndex, voicesLoaded]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentWord || showFeedback) return;

    const normalizedAnswer = userAnswer.trim().toLowerCase();
    const isCorrect = currentWord.hebrew.some(
      (option) => option.trim().toLowerCase() === normalizedAnswer
    );

    setLastCorrect(isCorrect);
    setShowFeedback(true);

    const result: PracticeResult = {
      word: currentWord,
      userAnswer: userAnswer.trim(),
      correct: isCorrect,
    };
    setResults([...results, result]);
  };

  const handleNext = () => {
    if (currentIndex + 1 >= shuffledWords.length) {
      onComplete([...results]);
    } else {
      setCurrentIndex(currentIndex + 1);
      setUserAnswer('');
      setShowFeedback(false);
    }
  };

  if (!currentWord) {
    return <div>Loading...</div>;
  }

  return (
    <div className="card">
      <div className="practice">
        <button className="back-btn" onClick={onBack}>
          חזרה
        </button>

        <div className="progress">
          מילה {currentIndex + 1} מתוך {shuffledWords.length}
        </div>

        <div className="word-display">
          <h2>{currentWord.english}</h2>
          <button onClick={() => speakWord(currentWord.english)} className="speak-btn">
            שמע שוב
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            placeholder="הקלד את התרגום בעברית..."
            dir="rtl"
            disabled={showFeedback}
            autoFocus
          />
          {!showFeedback && (
            <button type="submit" disabled={!userAnswer.trim()}>
              בדוק
            </button>
          )}
        </form>

        {showFeedback && (
          <div className={`feedback ${lastCorrect ? 'correct' : 'incorrect'}`} dir='rtl'>
            {lastCorrect ? (
              <p>נכון!</p>
            ) : (
              <p>
                לא נכון. התשובה הנכונה: <strong dir="rtl">{currentWord.hebrew.join(' / ')}</strong>
              </p>
            )}
            <button onClick={handleNext}>
              {currentIndex + 1 >= shuffledWords.length ? 'לתוצאות' : 'המילה הבאה'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
