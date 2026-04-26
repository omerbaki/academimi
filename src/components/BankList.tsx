import { useState } from 'react';
import type { WordBank } from '../types';

interface BankListProps {
  banks: WordBank[];
  onCreateBank: (name: string) => void;
  onDeleteBank: (id: string) => void;
  onRenameBank: (id: string, newName: string) => void;
  onSelectForEdit: (id: string) => void;
  onSelectForPractice: (id: string) => void;
  onBack: () => void;
}

export default function BankList({
  banks,
  onCreateBank,
  onDeleteBank,
  onRenameBank,
  onSelectForEdit,
  onSelectForPractice,
  onBack,
}: BankListProps) {
  const [newBankName, setNewBankName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (newBankName.trim()) {
      onCreateBank(newBankName);
      setNewBankName('');
    }
  };

  const startRename = (bank: WordBank) => {
    setEditingId(bank.id);
    setEditName(bank.name);
  };

  const saveRename = () => {
    if (editingId && editName.trim()) {
      onRenameBank(editingId, editName);
    }
    setEditingId(null);
    setEditName('');
  };

  return (
    <div className="bank-list">
      <button className="back-btn" onClick={onBack}>
        Back
      </button>

      <h2>Word Banks</h2>

      <form onSubmit={handleCreate} className="create-form">
        <input
          type="text"
          value={newBankName}
          onChange={(e) => setNewBankName(e.target.value)}
          placeholder="New bank name..."
        />
        <button type="submit" disabled={!newBankName.trim()}>
          Create Bank
        </button>
      </form>

      {banks.length === 0 ? (
        <p className="empty-message">No word banks yet. Create one above!</p>
      ) : (
        <ul className="banks">
          {banks.map((bank) => (
            <li key={bank.id} className="bank-item">
              {editingId === bank.id ? (
                <div className="edit-row">
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onBlur={saveRename}
                    onKeyDown={(e) => e.key === 'Enter' && saveRename()}
                    autoFocus
                  />
                </div>
              ) : (
                <>
                  <div className="bank-info">
                    <span className="bank-name">{bank.name}</span>
                    <span className="word-count">{bank.words.length} words</span>
                  </div>
                  <div className="bank-actions">
                    <button onClick={() => onSelectForEdit(bank.id)}>Edit</button>
                    <button
                      onClick={() => onSelectForPractice(bank.id)}
                      disabled={bank.words.length === 0}
                    >
                      Practice
                    </button>
                    <button onClick={() => startRename(bank)}>Rename</button>
                    <button className="delete-btn" onClick={() => onDeleteBank(bank.id)}>
                      Delete
                    </button>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
