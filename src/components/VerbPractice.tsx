import { useState, useEffect } from 'react';
import type { VerbSentence, VerbPracticeResult } from '../types';

interface VerbPracticeProps {
  sentences: VerbSentence[];
  onComplete: (results: VerbPracticeResult[]) => void;
  onBack: () => void;
}

const normalizeApostrophes = (text: string) => {
  // Normalize all apostrophe/quote variants to a plain apostrophe.
  // iOS/Safari smart punctuation replaces ' (U+0027) with ' (U+2019) or similar,
  // causing comparisons to fail for words like "don't" and "doesn't".
  return text.replace(/[\u2018\u2019\u201A\u201B\u2032\u2035\u02BC\u02B9\u02BB\u0060\u00B4\uFF07]/g, "'");
};

export default function VerbPractice({ sentences, onComplete, onBack }: VerbPracticeProps) {
  const [shuffledSentences, setShuffledSentences] = useState<VerbSentence[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [results, setResults] = useState<VerbPracticeResult[]>([]);
  const [showFeedback, setShowFeedback] = useState(false);
  const [lastCorrect, setLastCorrect] = useState(false);

  useEffect(() => {
    const shuffled = [...sentences].sort(() => Math.random() - 0.5);
    setShuffledSentences(shuffled);
  }, [sentences]);

  const currentSentence = shuffledSentences[currentIndex];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentSentence || showFeedback) return;

    const normalizedUserAnswer = normalizeApostrophes(userAnswer.trim().toLowerCase());
    const normalizedCorrectAnswer = normalizeApostrophes(currentSentence.answer.toLowerCase());
    const isCorrect = normalizedUserAnswer === normalizedCorrectAnswer;

    setLastCorrect(isCorrect);
    setShowFeedback(true);

    const result: VerbPracticeResult = {
      sentence: currentSentence,
      userAnswer: userAnswer.trim(),
      correct: isCorrect,
    };
    setResults([...results, result]);
  };

  const handleNext = () => {
    if (currentIndex + 1 >= shuffledSentences.length) {
      onComplete([...results]);
    } else {
      setCurrentIndex(currentIndex + 1);
      setUserAnswer('');
      setShowFeedback(false);
    }
  };

  if (!currentSentence) {
    return <div>Loading...</div>;
  }

  const renderSentence = () => {
    const { sentenceBefore, sentenceAfter, baseVerb } = currentSentence;
    return (
      <div className="verb-sentence">
        {sentenceBefore && <span>{sentenceBefore} </span>}
        <span className="verb-blank">_______</span>
        <span className="verb-hint"> ({baseVerb}) </span>
        <span>{sentenceAfter}</span>
      </div>
    );
  };

  return (
    <div className="card">
      <div className="practice">
        <button className="back-btn" onClick={onBack}>
          חזרה
        </button>

        <div className="progress">
          משפט {currentIndex + 1} מתוך {shuffledSentences.length}
        </div>

        <div className="word-display">
          {renderSentence()}
        </div>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            placeholder="Complete the verb..."
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
                לא נכון. התשובה הנכונה: <strong>{currentSentence.answer}</strong>
              </p>
            )}
            <button onClick={handleNext}>
              {currentIndex + 1 >= shuffledSentences.length ? 'לתוצאות' : 'המשפט הבא'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
