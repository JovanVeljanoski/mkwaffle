/**
 * React hook for managing game statistics
 */

import { useState, useEffect, useCallback } from 'react';
import { GameStats } from '../types';
import {
  getStats,
  recordGameResult,
  hasPlayedPuzzle,
  getTodayDateString,
  DEFAULT_STATS,
} from './statsDb';
import { getDailySeed } from './daily';

export interface UseStatsReturn {
  stats: GameStats;
  isLoading: boolean;
  hasPlayedToday: boolean;
  recordResult: (won: boolean, starsEarned: number) => Promise<void>;
  refreshStats: () => Promise<void>;
}

export function useStats(): UseStatsReturn {
  const [stats, setStats] = useState<GameStats>(DEFAULT_STATS);
  const [isLoading, setIsLoading] = useState(true);
  const [hasPlayedToday, setHasPlayedToday] = useState(false);

  // Load stats on mount
  useEffect(() => {
    const loadStats = async () => {
      try {
        const loadedStats = await getStats();
        setStats(loadedStats);

        // Check if today's puzzle was already played
        const puzzleId = getDailySeed();
        const played = await hasPlayedPuzzle(puzzleId);
        setHasPlayedToday(played);
      } catch (error) {
        console.error('Error loading stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadStats();
  }, []);

  // Record a game result
  const recordResult = useCallback(async (won: boolean, starsEarned: number) => {
    try {
      const puzzleId = getDailySeed();
      const dateString = getTodayDateString();

      const newStats = await recordGameResult(puzzleId, won, starsEarned, dateString);
      setStats(newStats);
      setHasPlayedToday(true);
    } catch (error) {
      console.error('Error recording result:', error);
    }
  }, []);

  // Refresh stats from DB
  const refreshStats = useCallback(async () => {
    try {
      const loadedStats = await getStats();
      setStats(loadedStats);
    } catch (error) {
      console.error('Error refreshing stats:', error);
    }
  }, []);

  return {
    stats,
    isLoading,
    hasPlayedToday,
    recordResult,
    refreshStats,
  };
}
