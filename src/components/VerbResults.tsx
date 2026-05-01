import type { VerbPracticeResult } from '../types';

interface VerbResultsProps {
  results: VerbPracticeResult[];
  onBack: () => void;
}

export default function VerbResults({ results, onBack }: VerbResultsProps) {
  const correctCount = results.filter((r) => r.correct).length;
  const total = results.length;
  const percentage = Math.round((correctCount / total) * 100);

  const formatSentence = (result: VerbPracticeResult) => {
    const { sentenceBefore, sentenceAfter, answer } = result.sentence;
    return `${sentenceBefore} ${answer} ${sentenceAfter}`.trim();
  };

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
        <table className="results-table verb-results-table">
          <thead>
            <tr>
              <th>Sentence</th>
              <th>Correct Answer</th>
              <th>Your Answer</th>
            </tr>
          </thead>
          <tbody>
            {results.map((result, index) => (
              <tr key={index} className={result.correct ? 'correct-row' : 'incorrect-row'}>
                <td>{formatSentence(result)}</td>
                <td>{result.sentence.answer}</td>
                <td>{result.userAnswer || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <button onClick={onBack}>חזרה</button>
      </div>
    </div>
  );
}
