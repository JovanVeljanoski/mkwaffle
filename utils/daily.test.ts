import { describe, it, expect } from 'vitest';
import { getDailySeed, seededShuffle, getDailyPuzzle, getNextMidnight } from './daily';

describe('getDailySeed', () => {
  it('should return a number', () => {
    const seed = getDailySeed();
    expect(typeof seed).toBe('number');
  });

  it('should return a positive puzzle number (>=1)', () => {
    const seed = getDailySeed();
    expect(seed).toBeGreaterThanOrEqual(1);
  });

  it('should return consistent value when called multiple times', () => {
    const seed1 = getDailySeed();
    const seed2 = getDailySeed();
    expect(seed1).toBe(seed2);
  });

  it('should return an integer (no decimals)', () => {
    const seed = getDailySeed();
    expect(Number.isInteger(seed)).toBe(true);
  });
});

describe('seededShuffle', () => {
  it('should return an array of the same length', () => {
    const arr = [1, 2, 3, 4, 5];
    const shuffled = seededShuffle(arr, 12345);
    expect(shuffled.length).toBe(arr.length);
  });

  it('should contain all original elements', () => {
    const arr = ['а', 'б', 'в', 'г', 'д'];
    const shuffled = seededShuffle(arr, 12345);
    expect(shuffled.sort()).toEqual(arr.sort());
  });

  it('should not modify the original array', () => {
    const arr = [1, 2, 3, 4, 5];
    const original = [...arr];
    seededShuffle(arr, 12345);
    expect(arr).toEqual(original);
  });

  it('should produce deterministic results with the same seed', () => {
    const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const shuffled1 = seededShuffle(arr, 42);
    const shuffled2 = seededShuffle(arr, 42);
    expect(shuffled1).toEqual(shuffled2);
  });

  it('should produce different results with different seeds', () => {
    const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const shuffled1 = seededShuffle(arr, 42);
    const shuffled2 = seededShuffle(arr, 43);
    // Very unlikely to be the same
    expect(shuffled1).not.toEqual(shuffled2);
  });

  it('should handle empty arrays', () => {
    const arr: number[] = [];
    const shuffled = seededShuffle(arr, 12345);
    expect(shuffled).toEqual([]);
  });

  it('should handle single-element arrays', () => {
    const arr = [42];
    const shuffled = seededShuffle(arr, 12345);
    expect(shuffled).toEqual([42]);
  });
});

describe('getDailyPuzzle', () => {
  it('should return a puzzle with id and solution', () => {
    const puzzle = getDailyPuzzle();
    expect(puzzle).toHaveProperty('id');
    expect(puzzle).toHaveProperty('solution');
  });

  it('should return a 5x5 solution grid', () => {
    const puzzle = getDailyPuzzle();
    expect(puzzle.solution.length).toBe(5);
    puzzle.solution.forEach(row => {
      expect(row.length).toBe(5);
    });
  });

  it('should have valid waffle structure (gaps at odd row AND odd col)', () => {
    const puzzle = getDailyPuzzle();

    // Gap positions should be spaces
    expect(puzzle.solution[1][1]).toBe(' ');
    expect(puzzle.solution[1][3]).toBe(' ');
    expect(puzzle.solution[3][1]).toBe(' ');
    expect(puzzle.solution[3][3]).toBe(' ');
  });

  it('should have uppercase Cyrillic letters in valid positions', () => {
    const puzzle = getDailyPuzzle();

    for (let r = 0; r < 5; r++) {
      for (let c = 0; c < 5; c++) {
        // Skip gap positions
        if ((r % 2 === 1) && (c % 2 === 1)) continue;

        const char = puzzle.solution[r][c];
        // Should be a single uppercase letter (not a space)
        expect(char.length).toBe(1);
        expect(char).not.toBe(' ');
        // Should be uppercase (Macedonian Cyrillic letters are uppercase)
        expect(char).toBe(char.toUpperCase());
      }
    }
  });

  it('should produce consistent results for the same day', () => {
    const puzzle1 = getDailyPuzzle();
    const puzzle2 = getDailyPuzzle();

    expect(puzzle1.id).toBe(puzzle2.id);
    expect(puzzle1.solution).toEqual(puzzle2.solution);
  });

  it('should have puzzle id matching the daily seed', () => {
    const puzzle = getDailyPuzzle();
    const seed = getDailySeed();
    expect(puzzle.id).toBe(seed);
  });

  it('should form valid 5-letter words horizontally', () => {
    const puzzle = getDailyPuzzle();

    // Rows 0, 2, 4 should form 5-letter words
    const row0 = puzzle.solution[0].join('');
    const row2 = puzzle.solution[2].join('');
    const row4 = puzzle.solution[4].join('');

    expect(row0.length).toBe(5);
    expect(row2.length).toBe(5);
    expect(row4.length).toBe(5);

    // Should not contain spaces
    expect(row0).not.toContain(' ');
    expect(row2).not.toContain(' ');
    expect(row4).not.toContain(' ');
  });

  it('should form valid 5-letter words vertically', () => {
    const puzzle = getDailyPuzzle();

    // Columns 0, 2, 4 should form 5-letter words
    const col0 = puzzle.solution.map(row => row[0]).join('');
    const col2 = puzzle.solution.map(row => row[2]).join('');
    const col4 = puzzle.solution.map(row => row[4]).join('');

    expect(col0.length).toBe(5);
    expect(col2.length).toBe(5);
    expect(col4.length).toBe(5);

    // Should not contain spaces
    expect(col0).not.toContain(' ');
    expect(col2).not.toContain(' ');
    expect(col4).not.toContain(' ');
  });
});

describe('getNextMidnight', () => {
  it('should return a Date object', () => {
    const midnight = getNextMidnight();
    expect(midnight instanceof Date).toBe(true);
  });

  it('should return a future date', () => {
    const midnight = getNextMidnight();
    const now = new Date();
    expect(midnight.getTime()).toBeGreaterThan(now.getTime());
  });

  it('should be within 24 hours from now', () => {
    const midnight = getNextMidnight();
    const now = new Date();
    const diffMs = midnight.getTime() - now.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);

    expect(diffHours).toBeGreaterThan(0);
    expect(diffHours).toBeLessThanOrEqual(24);
  });

  it('should return a valid timestamp', () => {
    const midnight = getNextMidnight();
    expect(midnight.getTime()).not.toBeNaN();
  });
});
