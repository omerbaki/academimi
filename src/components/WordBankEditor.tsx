import { useState } from 'react';
import type { WordBank } from '../types';

interface WordBankEditorProps {
  bank: WordBank;
  onAddWord: (english: string, hebrew: string) => void;
  onDeleteWord: (wordId: string) => void;
  onBack: () => void;
}

export default function WordBankEditor({
  bank,
  onAddWord,
  onDeleteWord,
  onBack,
}: WordBankEditorProps) {
  const [english, setEnglish] = useState('');
  const [hebrew, setHebrew] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (english.trim() && hebrew.trim()) {
      onAddWord(english, hebrew);
      setEnglish('');
      setHebrew('');
    }
  };

  return (
    <div className="word-bank-editor">
      <button className="back-btn" onClick={onBack}>
        Back
      </button>

      <h2>Edit: {bank.name}</h2>

      <form onSubmit={handleSubmit} className="add-word-form">
        <input
          type="text"
          value={english}
          onChange={(e) => setEnglish(e.target.value)}
          placeholder="English word"
        />
        <input
          type="text"
          value={hebrew}
          onChange={(e) => setHebrew(e.target.value)}
          placeholder="Hebrew translation"
          dir="rtl"
        />
        <button type="submit" disabled={!english.trim() || !hebrew.trim()}>
          Add Word
        </button>
      </form>

      {bank.words.length === 0 ? (
        <p className="empty-message">No words yet. Add some above!</p>
      ) : (
        <table className="word-table">
          <thead>
            <tr>
              <th>English</th>
              <th>Hebrew</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {bank.words.map((word) => (
              <tr key={word.id}>
                <td>{word.english}</td>
                <td dir="rtl">{word.hebrew}</td>
                <td>
                  <button className="delete-btn" onClick={() => onDeleteWord(word.id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
