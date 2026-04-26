import { useState, useEffect } from 'react';
import type { Word, WordBank, AppMode, PracticeResult } from './types';
import Practice from './components/Practice';
import Results from './components/Results';
import './App.css';

function App() {
  const [mode, setMode] = useState<AppMode>('menu');
  const [banks, setBanks] = useState<WordBank[]>([]);
  const [practiceWords, setPracticeWords] = useState<Word[]>([]);
  const [results, setResults] = useState<PracticeResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/default-banks.json')
      .then((res) => res.json())
      .then((defaultBanks: WordBank[]) => {
        const filtered = defaultBanks.map((bank) => ({
          ...bank,
          words: bank.words.filter((w) => w.english && w.hebrew),
        }));
        setBanks(filtered);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const allWords = banks.length > 0 ? banks[0].words : [];

  const startAllWords = () => {
    setPracticeWords(allWords);
    setMode('practice');
  };

  const startRandom10 = () => {
    const shuffled = [...allWords].sort(() => Math.random() - 0.5);
    setPracticeWords(shuffled.slice(0, 10));
    setMode('practice');
  };

  const handlePracticeComplete = (practiceResults: PracticeResult[]) => {
    setResults(practiceResults);
    setMode('results');
  };

  if (loading) {
    return <div className="app"><h1>Loading...</h1></div>;
  }

  return (
    <div className="app">
      <h1>הכתבה</h1>

      {mode === 'menu' && (
        <div className="bank-selection">
          {allWords.length === 0 ? (
            <p>No words available.</p>
          ) : (
            <div className="bank-buttons">
              <button onClick={startAllWords} className="bank-btn">
                מבחן כל המילים
              </button>
              <button onClick={startRandom10} className="bank-btn">
                מבחן 10 מילים
              </button>
            </div>
          )}
        </div>
      )}

      {mode === 'practice' && practiceWords.length > 0 && (
        <Practice
          words={practiceWords}
          onComplete={handlePracticeComplete}
          onBack={() => setMode('menu')}
        />
      )}

      {mode === 'results' && (
        <Results results={results} onBack={() => setMode('menu')} />
      )}
    </div>
  );
}

export default App;
