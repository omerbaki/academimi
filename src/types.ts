export interface Word {
  id: string;
  english: string;
  hebrew: string;
}

export interface WordBank {
  id: string;
  name: string;
  words: Word[];
}

export type AppMode = 'menu' | 'banks' | 'manage' | 'practice' | 'results';

export interface PracticeResult {
  word: Word;
  userAnswer: string;
  correct: boolean;
}
