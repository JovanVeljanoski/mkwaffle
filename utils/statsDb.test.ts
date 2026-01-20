import { describe, it, expect } from 'vitest';
import { DEFAULT_STATS, getTodayDateString } from './statsDb';
import { StatsDistribution } from '../types';

describe('DEFAULT_STATS', () => {
  it('should have all required properties initialized to zero/null', () => {
    expect(DEFAULT_STATS.played).toBe(0);
    expect(DEFAULT_STATS.totalStars).toBe(0);
    expect(DEFAULT_STATS.currentStreak).toBe(0);
    expect(DEFAULT_STATS.bestStreak).toBe(0);
    expect(DEFAULT_STATS.lastPlayedDate).toBeNull();
  });

  it('should have distribution with all star counts at zero', () => {
    expect(DEFAULT_STATS.distribution.failed).toBe(0);
    expect(DEFAULT_STATS.distribution.stars0).toBe(0);
    expect(DEFAULT_STATS.distribution.stars1).toBe(0);
    expect(DEFAULT_STATS.distribution.stars2).toBe(0);
    expect(DEFAULT_STATS.distribution.stars3).toBe(0);
    expect(DEFAULT_STATS.distribution.stars4).toBe(0);
    expect(DEFAULT_STATS.distribution.stars5).toBe(0);
  });
});

describe('getTodayDateString', () => {
  it('should return a string in YYYY-MM-DD format', () => {
    const dateString = getTodayDateString();

    // Should match YYYY-MM-DD pattern
    expect(dateString).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('should return consistent value when called multiple times', () => {
    const date1 = getTodayDateString();
    const date2 = getTodayDateString();
    expect(date1).toBe(date2);
  });

  it('should return a parseable date', () => {
    const dateString = getTodayDateString();
    const parsed = new Date(dateString);
    expect(parsed.toString()).not.toBe('Invalid Date');
  });

  it('should have valid year, month, and day components', () => {
    const dateString = getTodayDateString();
    const [year, month, day] = dateString.split('-').map(Number);

    expect(year).toBeGreaterThanOrEqual(2024);
    expect(year).toBeLessThanOrEqual(2100);
    expect(month).toBeGreaterThanOrEqual(1);
    expect(month).toBeLessThanOrEqual(12);
    expect(day).toBeGreaterThanOrEqual(1);
    expect(day).toBeLessThanOrEqual(31);
  });
});

describe('updateDistribution logic', () => {
  // Testing the distribution update logic that would be applied
  // This documents the expected behavior for stats updates

  const createDistribution = (): StatsDistribution => ({
    failed: 0,
    stars0: 0,
    stars1: 0,
    stars2: 0,
    stars3: 0,
    stars4: 0,
    stars5: 0,
  });

  const updateDistribution = (
    distribution: StatsDistribution,
    won: boolean,
    stars: number
  ): StatsDistribution => {
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
  };

  it('should increment failed count for losses', () => {
    const dist = createDistribution();
    const updated = updateDistribution(dist, false, 0);
    expect(updated.failed).toBe(1);
    expect(updated.stars0).toBe(0);
  });

  it('should increment stars0 for win with 0 stars', () => {
    const dist = createDistribution();
    const updated = updateDistribution(dist, true, 0);
    expect(updated.failed).toBe(0);
    expect(updated.stars0).toBe(1);
  });

  it('should increment stars1 for win with 1 star', () => {
    const dist = createDistribution();
    const updated = updateDistribution(dist, true, 1);
    expect(updated.stars1).toBe(1);
  });

  it('should increment stars2 for win with 2 stars', () => {
    const dist = createDistribution();
    const updated = updateDistribution(dist, true, 2);
    expect(updated.stars2).toBe(1);
  });

  it('should increment stars3 for win with 3 stars', () => {
    const dist = createDistribution();
    const updated = updateDistribution(dist, true, 3);
    expect(updated.stars3).toBe(1);
  });

  it('should increment stars4 for win with 4 stars', () => {
    const dist = createDistribution();
    const updated = updateDistribution(dist, true, 4);
    expect(updated.stars4).toBe(1);
  });

  it('should increment stars5 for win with 5 stars (perfect)', () => {
    const dist = createDistribution();
    const updated = updateDistribution(dist, true, 5);
    expect(updated.stars5).toBe(1);
  });

  it('should not modify the original distribution object', () => {
    const dist = createDistribution();
    const originalFailed = dist.failed;
    updateDistribution(dist, false, 0);
    expect(dist.failed).toBe(originalFailed);
  });

  it('should accumulate multiple results', () => {
    let dist = createDistribution();
    dist = updateDistribution(dist, true, 5);
    dist = updateDistribution(dist, true, 5);
    dist = updateDistribution(dist, true, 3);
    dist = updateDistribution(dist, false, 0);

    expect(dist.stars5).toBe(2);
    expect(dist.stars3).toBe(1);
    expect(dist.failed).toBe(1);
  });
});

describe('streak calculation logic', () => {
  // Testing the streak logic that would be applied

  it('should increment current streak on win', () => {
    const currentStreak = 5;
    const won = true;
    const newStreak = won ? currentStreak + 1 : 0;
    expect(newStreak).toBe(6);
  });

  it('should reset current streak to 0 on loss', () => {
    const currentStreak = 5;
    const won = false;
    const newStreak = won ? currentStreak + 1 : 0;
    expect(newStreak).toBe(0);
  });

  it('should update best streak when current exceeds it', () => {
    const currentStreak = 5;
    const bestStreak = 5;
    const won = true;

    const newCurrentStreak = won ? currentStreak + 1 : 0;
    const newBestStreak = won
      ? Math.max(bestStreak, currentStreak + 1)
      : bestStreak;

    expect(newCurrentStreak).toBe(6);
    expect(newBestStreak).toBe(6);
  });

  it('should keep best streak unchanged when current does not exceed it', () => {
    const currentStreak = 2;
    const bestStreak = 10;
    const won = true;

    const newCurrentStreak = won ? currentStreak + 1 : 0;
    const newBestStreak = won
      ? Math.max(bestStreak, currentStreak + 1)
      : bestStreak;

    expect(newCurrentStreak).toBe(3);
    expect(newBestStreak).toBe(10);
  });

  it('should preserve best streak on loss', () => {
    const currentStreak = 5;
    const bestStreak = 10;
    const won = false;

    const newBestStreak = won
      ? Math.max(bestStreak, currentStreak + 1)
      : bestStreak;

    expect(newBestStreak).toBe(10);
  });
});

describe('star calculation logic', () => {
  // Testing the star calculation based on swaps remaining
  // Game has 15 total swaps, stars earned = swaps remaining (capped at 5)

  const calculateStars = (swapsRemaining: number, won: boolean): number => {
    if (!won) return 0;
    return Math.min(5, Math.max(0, swapsRemaining));
  };

  it('should return 0 stars for a loss regardless of swaps', () => {
    expect(calculateStars(5, false)).toBe(0);
    expect(calculateStars(0, false)).toBe(0);
  });

  it('should return 0 stars for win with 0 swaps remaining', () => {
    expect(calculateStars(0, true)).toBe(0);
  });

  it('should return swaps remaining as stars (up to 5)', () => {
    expect(calculateStars(1, true)).toBe(1);
    expect(calculateStars(2, true)).toBe(2);
    expect(calculateStars(3, true)).toBe(3);
    expect(calculateStars(4, true)).toBe(4);
    expect(calculateStars(5, true)).toBe(5);
  });

  it('should cap stars at 5 even with more swaps remaining', () => {
    expect(calculateStars(6, true)).toBe(5);
    expect(calculateStars(10, true)).toBe(5);
    expect(calculateStars(15, true)).toBe(5);
  });

  it('should handle negative swaps (edge case) as 0 stars', () => {
    expect(calculateStars(-1, true)).toBe(0);
    expect(calculateStars(-5, true)).toBe(0);
  });
});
