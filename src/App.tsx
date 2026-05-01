import { useState, useEffect } from 'react';
import type { Word, WordBank, AppMode, PracticeResult, VerbBank, VerbSentence, VerbPracticeResult } from './types';
import Practice from './components/Practice';
import Results from './components/Results';
import VerbPractice from './components/VerbPractice';
import VerbResults from './components/VerbResults';
import './App.css';

function App() {
  const [mode, setMode] = useState<AppMode>('menu');
  const [banks, setBanks] = useState<WordBank[]>([]);
  const [verbBanks, setVerbBanks] = useState<VerbBank[]>([]);
  const [practiceWords, setPracticeWords] = useState<Word[]>([]);
  const [practiceSentences, setPracticeSentences] = useState<VerbSentence[]>([]);
  const [results, setResults] = useState<PracticeResult[]>([]);
  const [verbResults, setVerbResults] = useState<VerbPracticeResult[]>([]);
  const [loading, setLoading] = useState(true);

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
    setPracticeWords(allWords);
    setMode('practice');
  };

  const startRandom10 = () => {
    const shuffled = [...allWords].sort(() => Math.random() - 0.5);
    setPracticeWords(shuffled.slice(0, 10));
    setMode('practice');
  };

  const startVerbTest = () => {
    const shuffled = [...allSentences].sort(() => Math.random() - 0.5);
    setPracticeSentences(shuffled.slice(0, 10));
    setMode('verbPractice');
  };

  const handlePracticeComplete = (practiceResults: PracticeResult[]) => {
    setResults(practiceResults);
    setMode('results');
  };

  const handleVerbPracticeComplete = (practiceResults: VerbPracticeResult[]) => {
    setVerbResults(practiceResults);
    setMode('verbResults');
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
              </div>
            )}
          </div>
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
