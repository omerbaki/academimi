import type { PracticeResult } from '../types';

interface ResultsProps {
  results: PracticeResult[];
  onBack: () => void;
}

export default function Results({ results, onBack }: ResultsProps) {
  const correctCount = results.filter((r) => r.correct).length;
  const total = results.length;
  const percentage = Math.round((correctCount / total) * 100);

  return (
    <div className="results">
      <div className="score">
        <div className="score-percentage">{percentage}</div>
        <div className="score-number">
          {correctCount} / {total}
        </div>
        {percentage >= 80 && <div className="score-message" dir="rtl">כל הכבוד!</div>}
      </div>

      <h3>Review:</h3>
      <table className="results-table">
        <thead>
          <tr>
            <th>English</th>
            <th>Correct Answer</th>
            <th>Your Answer</th>
            <th>Result</th>
          </tr>
        </thead>
        <tbody>
          {results.map((result, index) => (
            <tr key={index} className={result.correct ? 'correct-row' : 'incorrect-row'}>
              <td>{result.word.english}</td>
              <td dir="rtl">{result.word.hebrew}</td>
              <td dir="rtl">{result.userAnswer}</td>
              <td>{result.correct ? 'Correct' : 'Incorrect'}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <button onClick={onBack}>חזרה</button>
    </div>
  );
}
