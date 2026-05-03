import { useState, useEffect } from 'react';
import type { Word, WordBank, AppMode, PracticeResult, VerbBank, VerbSentence, VerbPracticeResult } from './types';
import Practice from './components/Practice';
import Results from './components/Results';
import VerbPractice from './components/VerbPractice';
import VerbResults from './components/VerbResults';
import './App.css';

const WRONG_WORDS_KEY = 'wrong-words';
const FORMSPREE_URL = import.meta.env.VITE_FORMSPREE_URL as string | undefined;

function notifyTestComplete(testType: string, correct: number, total: number, details: string): void {
  if (!FORMSPREE_URL) return;
  const score = `${Math.round((correct / total) * 100)}%`;
  fetch(FORMSPREE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ test_type: testType, score, correct: `${correct} / ${total}`, details }),
  }).catch(() => {});
}

function getStoredWrongWords(): Word[] {
  try {
    const raw = localStorage.getItem(WRONG_WORDS_KEY);
    return raw ? (JSON.parse(raw) as Word[]) : [];
  } catch {
    return [];
  }
}

function saveStoredWrongWords(words: Word[]): void {
  localStorage.setItem(WRONG_WORDS_KEY, JSON.stringify(words));
}

function App() {
  const [mode, setMode] = useState<AppMode>('menu');
  const [banks, setBanks] = useState<WordBank[]>([]);
  const [verbBanks, setVerbBanks] = useState<VerbBank[]>([]);
  const [practiceWords, setPracticeWords] = useState<Word[]>([]);
  const [practiceSentences, setPracticeSentences] = useState<VerbSentence[]>([]);
  const [results, setResults] = useState<PracticeResult[]>([]);
  const [verbResults, setVerbResults] = useState<VerbPracticeResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [wrongWords, setWrongWords] = useState<Word[]>(() => getStoredWrongWords());
  const [isWrongWordsMode, setIsWrongWordsMode] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch('/default-banks.json').then((res) => res.json()),
      fetch('/present-simple.json').then((res) => res.json()),
    ])
      .then(([defaultBanks, verbBanksData]: [WordBank[], VerbBank[]]) => {
        const filtered = defaultBanks.map((bank) => ({
          ...bank,
          words: bank.words.filter((w) => w.english && w.hebrew && w.hebrew.length > 0),
        }));
        setBanks(filtered);
        setVerbBanks(verbBanksData);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const allWords = banks.length > 0 ? banks[0].words : [];
  const allSentences = verbBanks.length > 0 ? verbBanks[0].sentences : [];

  const startAllWords = () => {
    setIsWrongWordsMode(false);
    setPracticeWords(allWords);
    setMode('practice');
  };

  const startRandom10 = () => {
    setIsWrongWordsMode(false);
    const shuffled = [...allWords].sort(() => Math.random() - 0.5);
    setPracticeWords(shuffled.slice(0, 10));
    setMode('practice');
  };

  const startVerbTest = () => {
    const shuffled = [...allSentences].sort(() => Math.random() - 0.5);
    setPracticeSentences(shuffled.slice(0, 10));
    setMode('verbPractice');
  };

  const startWrongWordsTest = () => {
    const shuffled = [...wrongWords].sort(() => Math.random() - 0.5);
    setIsWrongWordsMode(true);
    setPracticeWords(shuffled);
    setMode('practice');
  };

  const handlePracticeComplete = (practiceResults: PracticeResult[]) => {
    const newlyFailed = practiceResults
      .filter((r) => !r.correct)
      .map((r) => r.word);

    if (newlyFailed.length > 0) {
      const existing = getStoredWrongWords();
      const existingIds = new Set(existing.map((w) => w.id));
      const merged = [...existing, ...newlyFailed.filter((w) => !existingIds.has(w.id))];
      saveStoredWrongWords(merged);
      setWrongWords(merged);
    }

    const correct = practiceResults.filter((r) => r.correct).length;
    const details = practiceResults
      .map((r) => `${r.correct ? '✅' : '❌'} ${r.word.english} → ${r.word.hebrew.join(' / ')} (answered: ${r.userAnswer || '—'})`)
      .join('\n');
    notifyTestComplete('מבחן מילים', correct, practiceResults.length, details);

    setResults(practiceResults);
    setMode('results');
  };

  const handleWrongWordsPracticeComplete = (practiceResults: PracticeResult[]) => {
    const correctIds = new Set(
      practiceResults.filter((r) => r.correct).map((r) => r.word.id)
    );
    const remaining = getStoredWrongWords().filter((w) => !correctIds.has(w.id));
    saveStoredWrongWords(remaining);
    setWrongWords(remaining);

    const correct = practiceResults.filter((r) => r.correct).length;
    const details = practiceResults
      .map((r) => `${r.correct ? '✅' : '❌'} ${r.word.english} → ${r.word.hebrew.join(' / ')} (answered: ${r.userAnswer || '—'})`)
      .join('\n');
    notifyTestComplete('מבחן מילים שטעיתי', correct, practiceResults.length, details);

    setResults(practiceResults);
    setMode('results');
  };

  const handleVerbPracticeComplete = (practiceResults: VerbPracticeResult[]) => {
    const correct = practiceResults.filter((r) => r.correct).length;
    const details = practiceResults
      .map((r) => `${r.correct ? '✅' : '❌'} ${r.sentence.sentenceBefore} ___ ${r.sentence.sentenceAfter} → ${r.sentence.answer} (answered: ${r.userAnswer || '—'})`)
      .join('\n');
    notifyTestComplete('מבחן פעלים', correct, practiceResults.length, details);

    setVerbResults(practiceResults);
    setMode('verbResults');
  };

  const handleBackToMenu = () => {
    setIsWrongWordsMode(false);
    setMode('menu');
  };

  if (loading) {
    return <div className="app"><h1>Loading...</h1></div>;
  }

  return (
    <div className="app">
      <h1>הכנה באנגלית</h1>

      {mode === 'menu' && (
        <div className="card">
          <div className="bank-selection">
            {allWords.length === 0 && allSentences.length === 0 ? (
              <p>No content available.</p>
            ) : (
              <div className="bank-buttons">
                {allWords.length > 0 && (
                  <>
                    <button onClick={startAllWords} className="bank-btn">
                      מבחן כל המילים
                    </button>
                    <button onClick={startRandom10} className="bank-btn">
                      מבחן 10 מילים
                    </button>
                  </>
                )}
                {allSentences.length > 0 && (
                  <button onClick={startVerbTest} className="bank-btn verb-btn">
                    מבחן פעלים
                  </button>
                )}
                {wrongWords.length > 0 && (
                  <button onClick={startWrongWordsTest} className="bank-btn wrong-words-btn">
                    מילים שטעיתי ({wrongWords.length})
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {mode === 'practice' && practiceWords.length > 0 && (
        <Practice
          words={practiceWords}
          onComplete={isWrongWordsMode ? handleWrongWordsPracticeComplete : handlePracticeComplete}
          onBack={handleBackToMenu}
        />
      )}

      {mode === 'results' && (
        <Results results={results} onBack={handleBackToMenu} />
      )}

      {mode === 'verbPractice' && practiceSentences.length > 0 && (
        <VerbPractice
          sentences={practiceSentences}
          onComplete={handleVerbPracticeComplete}
          onBack={() => setMode('menu')}
        />
      )}

      {mode === 'verbResults' && (
        <VerbResults results={verbResults} onBack={() => setMode('menu')} />
      )}
    </div>
  );
}

export default App;
