import type { PracticeResult } from '../types';

interface ResultsProps {
  results: PracticeResult[];
  onBack: () => void;
}

export default function Results({ results, onBack }: ResultsProps) {
  const correctCount = results.filter((r) => r.correct).length;
  const total = results.length;
  const percentage = Math.round((correctCount / total) * 100);
  const isDictation = results.some((r) => r.userEnglish !== undefined);

  return (
    <div className="card">
      <div className="results">
        <div className="score">
          <div className="score-percentage">{percentage}</div>
          <div className="score-number">
            {correctCount} / {total}
          </div>
          {percentage >= 80 && <div className="score-message" dir='rtl'>כל הכבוד!</div>}
        </div>

        <h3 dir="rtl">סיכום:</h3>
        {isDictation ? (
          <table className="results-table dictation-results-table">
            <thead>
              <tr>
                <th>English</th>
                <th>התשובה שלך</th>
                <th>עברית</th>
                <th>התרגום שלך</th>
              </tr>
            </thead>
            <tbody>
              {results.map((result, index) => (
                <tr key={index} className={result.correct ? 'correct-row' : 'incorrect-row'}>
                  <td className={result.englishCorrect === false ? 'part-wrong' : undefined}>
                    {result.word.english}
                  </td>
                  <td dir="ltr">{result.userEnglish || '-'}</td>
                  <td dir="rtl" className={result.hebrewCorrect === false ? 'part-wrong' : undefined}>
                    {result.word.hebrew.join(' / ')}
                  </td>
                  <td dir="rtl">{result.userHebrew || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <table className="results-table">
            <thead>
              <tr>
                <th>English</th>
                <th>תשובה נכונה</th>
                <th>התשובה שלך</th>
              </tr>
            </thead>
            <tbody>
              {results.map((result, index) => (
                <tr key={index} className={result.correct ? 'correct-row' : 'incorrect-row'}>
                  <td>{result.word.english}</td>
                  <td dir="rtl">{result.word.hebrew.join(' / ')}</td>
                  <td dir="rtl">{result.userAnswer || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <button onClick={onBack}>חזרה</button>
      </div>
    </div>
  );
}
