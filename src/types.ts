export interface Word {
  id: string;
  english: string;
  hebrew: string[];
}

export interface WordBank {
  id: string;
  name: string;
  words: Word[];
}

export type AppMode = 'menu' | 'banks' | 'manage' | 'practice' | 'results' | 'verbPractice' | 'verbResults';

export interface PracticeResult {
  word: Word;
  userAnswer: string;
  correct: boolean;
}

export interface VerbSentence {
  id: string;
  sentenceBefore: string;
  sentenceAfter: string;
  baseVerb: string;
  answer: string;
  type: 'affirmative' | 'negative' | 'question';
}

export interface VerbBank {
  id: string;
  name: string;
  sentences: VerbSentence[];
}

export interface VerbPracticeResult {
  sentence: VerbSentence;
  userAnswer: string;
  correct: boolean;
}
