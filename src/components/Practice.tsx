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

    const isCorrect =
      userAnswer.trim().toLowerCase() === currentWord.hebrew.trim().toLowerCase();

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
    <div className="practice">
      <button className="back-btn" onClick={onBack}>
        Back
      </button>

      <div className="progress">
        Word {currentIndex + 1} of {shuffledWords.length}
      </div>

      <div className="word-display">
        <h2>{currentWord.english}</h2>
        <button onClick={() => speakWord(currentWord.english)} className="speak-btn">
          Hear Again
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={userAnswer}
          onChange={(e) => setUserAnswer(e.target.value)}
          placeholder="Type Hebrew translation..."
          dir="rtl"
          disabled={showFeedback}
          autoFocus
        />
        {!showFeedback && (
          <button type="submit" disabled={!userAnswer.trim()}>
            Check
          </button>
        )}
      </form>

      {showFeedback && (
        <div className={`feedback ${lastCorrect ? 'correct' : 'incorrect'}`}>
          {lastCorrect ? (
            <p>Correct!</p>
          ) : (
            <p>
              Incorrect. The correct answer is: <strong dir="rtl">{currentWord.hebrew}</strong>
            </p>
          )}
          <button onClick={handleNext}>
            {currentIndex + 1 >= shuffledWords.length ? 'See Results' : 'Next Word'}
          </button>
        </div>
      )}
    </div>
  );
}
