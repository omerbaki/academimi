import { useState, useEffect, useCallback } from 'react';
import type { Word, PracticeResult } from '../types';

interface DictationProps {
  words: Word[];
  onComplete: (results: PracticeResult[]) => void;
  onBack: () => void;
}

export default function Dictation({ words, onComplete, onBack }: DictationProps) {
  const [shuffledWords, setShuffledWords] = useState<Word[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userEnglish, setUserEnglish] = useState('');
  const [userHebrew, setUserHebrew] = useState('');
  const [results, setResults] = useState<PracticeResult[]>([]);
  const [showFeedback, setShowFeedback] = useState(false);
  const [lastCorrect, setLastCorrect] = useState(false);
  const [lastEnglishCorrect, setLastEnglishCorrect] = useState(false);
  const [lastHebrewCorrect, setLastHebrewCorrect] = useState(false);
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
  }, [currentIndex, voicesLoaded, currentWord, showFeedback, speakWord]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentWord || showFeedback) return;

    const englishCorrect =
      userEnglish.trim().toLowerCase() === currentWord.english.trim().toLowerCase();
    const hebrewCorrect = currentWord.hebrew.some(
      (option) => option.trim().toLowerCase() === userHebrew.trim().toLowerCase()
    );
    const isCorrect = englishCorrect && hebrewCorrect;

    setLastEnglishCorrect(englishCorrect);
    setLastHebrewCorrect(hebrewCorrect);
    setLastCorrect(isCorrect);
    setShowFeedback(true);

    const result: PracticeResult = {
      word: currentWord,
      userAnswer: `${userEnglish.trim()} / ${userHebrew.trim()}`,
      userEnglish: userEnglish.trim(),
      userHebrew: userHebrew.trim(),
      englishCorrect,
      hebrewCorrect,
      correct: isCorrect,
    };
    setResults([...results, result]);
  };

  const handleNext = () => {
    if (currentIndex + 1 >= shuffledWords.length) {
      onComplete([...results]);
    } else {
      setCurrentIndex(currentIndex + 1);
      setUserEnglish('');
      setUserHebrew('');
      setShowFeedback(false);
    }
  };

  if (!currentWord) {
    return <div>Loading...</div>;
  }

  const canSubmit = userEnglish.trim().length > 0 && userHebrew.trim().length > 0;

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
          <h2 className="hidden-word" dir="rtl">הקשב למילה</h2>
          <button onClick={() => speakWord(currentWord.english)} className="speak-btn">
            שמע שוב
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={userEnglish}
            onChange={(e) => setUserEnglish(e.target.value)}
            placeholder="הקלד את המילה באנגלית..."
            dir="ltr"
            disabled={showFeedback}
            autoFocus
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
          />
          <input
            type="text"
            value={userHebrew}
            onChange={(e) => setUserHebrew(e.target.value)}
            placeholder="הקלד את התרגום בעברית..."
            dir="rtl"
            disabled={showFeedback}
          />
          {!showFeedback && (
            <button type="submit" disabled={!canSubmit}>
              בדוק
            </button>
          )}
        </form>

        {showFeedback && (
          <div className={`feedback ${lastCorrect ? 'correct' : 'incorrect'}`} dir="rtl">
            {lastCorrect ? (
              <p>נכון!</p>
            ) : (
              <div className="dictation-feedback">
                <p>לא נכון.</p>
                <p>
                  אנגלית: {lastEnglishCorrect ? 'נכון!' : (
                    <>
                      התשובה הנכונה: <strong dir="ltr">{currentWord.english}</strong>
                    </>
                  )}
                </p>
                <p>
                  עברית: {lastHebrewCorrect ? 'נכון!' : (
                    <>
                      התשובה הנכונה: <strong dir="rtl">{currentWord.hebrew.join(' / ')}</strong>
                    </>
                  )}
                </p>
              </div>
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
