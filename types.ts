export enum CellStatus {
  CORRECT = 'CORRECT', // Green
  PRESENT = 'PRESENT', // Yellow
  WRONG = 'WRONG',     // Gray/Neutral
  NONE = 'NONE'        // Empty space in grid
}

export interface Coords {
  row: number;
  col: number;
}

export interface CellData {
  char: string;
  status: CellStatus;
}

export type Grid = CellData[][];

export interface DailyPuzzle {
  id: number;
  solution: string[][]; // 5x5 char array
}

export type GameStatus = 'PLAYING' | 'WON' | 'LOST';

// Stats Types
export interface StatsDistribution {
  failed: number;
  stars0: number;
  stars1: number;
  stars2: number;
  stars3: number;
  stars4: number;
  stars5: number;
}

export interface GameStats {
  played: number;
  totalStars: number;
  currentStreak: number;
  bestStreak: number;
  distribution: StatsDistribution;
  lastPlayedDate: string | null; // ISO date string (YYYY-MM-DD)
}

export interface GameRecord {
  puzzleId: number; // Daily seed
  stars: number;    // 0-5, or -1 for loss
  date: string;     // ISO date string
}