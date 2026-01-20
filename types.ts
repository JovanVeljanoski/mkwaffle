export enum CellStatus {
  CORRECT = 'CORRECT',
  PRESENT = 'PRESENT',
  WRONG = 'WRONG',
  NONE = 'NONE'
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
  solution: string[][];
}

export type GameStatus = 'PLAYING' | 'WON' | 'LOST';

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
  lastPlayedDate: string | null;
}

export interface GameRecord {
  puzzleId: number;
  stars: number;
  date: string;
}
