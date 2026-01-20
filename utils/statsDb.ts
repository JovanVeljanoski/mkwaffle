/**
 * IndexedDB utility for storing game stats and game state
 * Database name: mkwaffle-stats
 * Store: gameRecords - individual game records
 * Store: stats - aggregated statistics
 * Store: gameState - current game state for persistence
 */

import { GameStats, GameRecord, StatsDistribution, Grid, GameStatus } from '../types';

const DB_NAME = 'mkwaffle-stats';
const DB_VERSION = 2; // Bumped for new gameState store
const RECORDS_STORE = 'gameRecords';
const STATS_STORE = 'stats';
const GAME_STATE_STORE = 'gameState';
const STATS_KEY = 'userStats';

// Saved game state interface
export interface SavedGameState {
  puzzleId: number;
  grid: Grid;
  swaps: number;
  status: GameStatus;
  solution: string[][];
}

// Default stats for new users
export const DEFAULT_STATS: GameStats = {
  played: 0,
  totalStars: 0,
  currentStreak: 0,
  bestStreak: 0,
  distribution: {
    failed: 0,
    stars0: 0,
    stars1: 0,
    stars2: 0,
    stars3: 0,
    stars4: 0,
    stars5: 0,
  },
  lastPlayedDate: null,
};

// Open IndexedDB connection
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      console.error('Failed to open IndexedDB:', request.error);
      reject(request.error);
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Create game records store (keyed by puzzleId)
      if (!db.objectStoreNames.contains(RECORDS_STORE)) {
        const recordsStore = db.createObjectStore(RECORDS_STORE, { keyPath: 'puzzleId' });
        recordsStore.createIndex('date', 'date', { unique: false });
      }

      // Create stats store (single document)
      if (!db.objectStoreNames.contains(STATS_STORE)) {
        db.createObjectStore(STATS_STORE);
      }

      // Create game state store (keyed by puzzleId)
      if (!db.objectStoreNames.contains(GAME_STATE_STORE)) {
        db.createObjectStore(GAME_STATE_STORE, { keyPath: 'puzzleId' });
      }
    };
  });
}

// Get current stats
export async function getStats(): Promise<GameStats> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STATS_STORE, 'readonly');
      const store = transaction.objectStore(STATS_STORE);
      const request = store.get(STATS_KEY);

      request.onerror = () => {
        db.close();
        reject(request.error);
      };

      request.onsuccess = () => {
        db.close();
        resolve(request.result || DEFAULT_STATS);
      };
    });
  } catch (error) {
    console.error('Error getting stats:', error);
    return DEFAULT_STATS;
  }
}

// Check if a puzzle was already played
export async function hasPlayedPuzzle(puzzleId: number): Promise<boolean> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(RECORDS_STORE, 'readonly');
      const store = transaction.objectStore(RECORDS_STORE);
      const request = store.get(puzzleId);

      request.onerror = () => {
        db.close();
        reject(request.error);
      };

      request.onsuccess = () => {
        db.close();
        resolve(!!request.result);
      };
    });
  } catch (error) {
    console.error('Error checking played puzzle:', error);
    return false;
  }
}

// Get record for a specific puzzle
export async function getGameRecord(puzzleId: number): Promise<GameRecord | null> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(RECORDS_STORE, 'readonly');
      const store = transaction.objectStore(RECORDS_STORE);
      const request = store.get(puzzleId);

      request.onerror = () => {
        db.close();
        reject(request.error);
      };

      request.onsuccess = () => {
        db.close();
        resolve(request.result || null);
      };
    });
  } catch (error) {
    console.error('Error getting game record:', error);
    return null;
  }
}

// Save a game result and update stats
export async function recordGameResult(
  puzzleId: number,
  won: boolean,
  starsEarned: number, // 0-5 for wins
  dateString: string   // YYYY-MM-DD format
): Promise<GameStats> {
  const db = await openDB();

  // First check if already recorded
  const existingRecord = await getGameRecord(puzzleId);
  if (existingRecord) {
    // Already played this puzzle, return current stats
    return getStats();
  }

  // Get current stats
  const currentStats = await getStats();

  // Create new record
  const record: GameRecord = {
    puzzleId,
    stars: won ? starsEarned : -1, // -1 indicates a loss
    date: dateString,
  };

  // Update stats
  const newStats: GameStats = {
    played: currentStats.played + 1,
    totalStars: currentStats.totalStars + (won ? starsEarned : 0),
    currentStreak: won ? currentStats.currentStreak + 1 : 0,
    bestStreak: won
      ? Math.max(currentStats.bestStreak, currentStats.currentStreak + 1)
      : currentStats.bestStreak,
    distribution: updateDistribution(currentStats.distribution, won, starsEarned),
    lastPlayedDate: dateString,
  };

  // Save record and stats in a transaction
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([RECORDS_STORE, STATS_STORE], 'readwrite');

    transaction.onerror = () => {
      db.close();
      reject(transaction.error);
    };

    transaction.oncomplete = () => {
      db.close();
      resolve(newStats);
    };

    // Save record
    const recordsStore = transaction.objectStore(RECORDS_STORE);
    recordsStore.put(record);

    // Save stats
    const statsStore = transaction.objectStore(STATS_STORE);
    statsStore.put(newStats, STATS_KEY);
  });
}

// Helper to update distribution
function updateDistribution(
  distribution: StatsDistribution,
  won: boolean,
  stars: number
): StatsDistribution {
  const newDistribution = { ...distribution };

  if (!won) {
    newDistribution.failed += 1;
  } else {
    switch (stars) {
      case 0:
        newDistribution.stars0 += 1;
        break;
      case 1:
        newDistribution.stars1 += 1;
        break;
      case 2:
        newDistribution.stars2 += 1;
        break;
      case 3:
        newDistribution.stars3 += 1;
        break;
      case 4:
        newDistribution.stars4 += 1;
        break;
      case 5:
        newDistribution.stars5 += 1;
        break;
    }
  }

  return newDistribution;
}

// Get today's date string in YYYY-MM-DD format (Amsterdam timezone)
export function getTodayDateString(): string {
  const now = new Date();
  const options: Intl.DateTimeFormatOptions = {
    timeZone: 'Europe/Amsterdam',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  };
  const formatter = new Intl.DateTimeFormat('en-CA', options); // en-CA gives YYYY-MM-DD format
  return formatter.format(now);
}

// ============ GAME STATE PERSISTENCE ============

// Save current game state
export async function saveGameState(state: SavedGameState): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(GAME_STATE_STORE, 'readwrite');
      const store = transaction.objectStore(GAME_STATE_STORE);
      const request = store.put(state);

      request.onerror = () => {
        db.close();
        reject(request.error);
      };

      request.onsuccess = () => {
        db.close();
        resolve();
      };
    });
  } catch (error) {
    console.error('Error saving game state:', error);
  }
}

// Load game state for a specific puzzle
export async function loadGameState(puzzleId: number): Promise<SavedGameState | null> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(GAME_STATE_STORE, 'readonly');
      const store = transaction.objectStore(GAME_STATE_STORE);
      const request = store.get(puzzleId);

      request.onerror = () => {
        db.close();
        reject(request.error);
      };

      request.onsuccess = () => {
        db.close();
        resolve(request.result || null);
      };
    });
  } catch (error) {
    console.error('Error loading game state:', error);
    return null;
  }
}

// Delete game state for a specific puzzle (cleanup after game ends)
export async function deleteGameState(puzzleId: number): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(GAME_STATE_STORE, 'readwrite');
      const store = transaction.objectStore(GAME_STATE_STORE);
      const request = store.delete(puzzleId);

      request.onerror = () => {
        db.close();
        reject(request.error);
      };

      request.onsuccess = () => {
        db.close();
        resolve();
      };
    });
  } catch (error) {
    console.error('Error deleting game state:', error);
  }
}
