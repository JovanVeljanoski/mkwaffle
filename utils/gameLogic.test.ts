import { describe, it, expect } from 'vitest';
import { isValidCell, generateInitialState, updateColors, checkWin } from './gameLogic';
import { CellStatus, Grid } from '../types';
import { GRID_SIZE } from '../constants';

describe('isValidCell', () => {
  it('should return true for cells in horizontal word rows (0, 2, 4)', () => {
    // Row 0 (full horizontal word)
    for (let col = 0; col < GRID_SIZE; col++) {
      expect(isValidCell(0, col)).toBe(true);
    }
    // Row 2 (full horizontal word)
    for (let col = 0; col < GRID_SIZE; col++) {
      expect(isValidCell(2, col)).toBe(true);
    }
    // Row 4 (full horizontal word)
    for (let col = 0; col < GRID_SIZE; col++) {
      expect(isValidCell(4, col)).toBe(true);
    }
  });

  it('should return true for cells in vertical word columns (0, 2, 4)', () => {
    // Column 0 (full vertical word)
    for (let row = 0; row < GRID_SIZE; row++) {
      expect(isValidCell(row, 0)).toBe(true);
    }
    // Column 2 (full vertical word)
    for (let row = 0; row < GRID_SIZE; row++) {
      expect(isValidCell(row, 2)).toBe(true);
    }
    // Column 4 (full vertical word)
    for (let row = 0; row < GRID_SIZE; row++) {
      expect(isValidCell(row, 4)).toBe(true);
    }
  });

  it('should return false for gap cells (odd row AND odd col)', () => {
    // The 4 gap positions in a waffle grid
    expect(isValidCell(1, 1)).toBe(false);
    expect(isValidCell(1, 3)).toBe(false);
    expect(isValidCell(3, 1)).toBe(false);
    expect(isValidCell(3, 3)).toBe(false);
  });
});

describe('generateInitialState', () => {
  const testSolution: string[][] = [
    ['П', 'Л', 'А', 'Ж', 'А'],
    ['Е', ' ', 'Н', ' ', 'К'],
    ['В', 'Е', 'Т', 'Е', 'Р'],
    ['А', ' ', 'И', ' ', 'Е'],
    ['Ч', 'Е', 'К', 'О', 'Р']
  ];

  it('should return a 5x5 grid', () => {
    const grid = generateInitialState(testSolution);
    expect(grid.length).toBe(5);
    grid.forEach(row => {
      expect(row.length).toBe(5);
    });
  });

  it('should mark gap cells with NONE status', () => {
    const grid = generateInitialState(testSolution);

    // Gap positions should have NONE status
    expect(grid[1][1].status).toBe(CellStatus.NONE);
    expect(grid[1][3].status).toBe(CellStatus.NONE);
    expect(grid[3][1].status).toBe(CellStatus.NONE);
    expect(grid[3][3].status).toBe(CellStatus.NONE);
  });

  it('should contain all characters from the solution', () => {
    const grid = generateInitialState(testSolution);

    // Extract all valid chars from solution
    const solutionChars: string[] = [];
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        if (isValidCell(r, c)) {
          solutionChars.push(testSolution[r][c]);
        }
      }
    }

    // Extract all valid chars from generated grid
    const gridChars: string[] = [];
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        if (isValidCell(r, c)) {
          gridChars.push(grid[r][c].char);
        }
      }
    }

    // Should have same characters (possibly in different order)
    expect(gridChars.sort()).toEqual(solutionChars.sort());
  });

  it('should produce deterministic results for the same day', () => {
    const grid1 = generateInitialState(testSolution);
    const grid2 = generateInitialState(testSolution);

    // Same seed = same shuffle
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        expect(grid1[r][c].char).toBe(grid2[r][c].char);
      }
    }
  });
});

describe('updateColors', () => {
  const testSolution: string[][] = [
    ['А', 'Б', 'В', 'Г', 'Д'],
    ['Е', ' ', 'Ж', ' ', 'З'],
    ['И', 'Ј', 'К', 'Л', 'М'],
    ['Н', ' ', 'О', ' ', 'П'],
    ['Р', 'С', 'Т', 'У', 'Ф']
  ];

  it('should mark correct positions as CORRECT (green)', () => {
    // Create a grid that matches solution exactly
    const grid: Grid = testSolution.map((row, r) =>
      row.map((char, c) => ({
        char,
        status: isValidCell(r, c) ? CellStatus.WRONG : CellStatus.NONE
      }))
    );

    const colored = updateColors(grid, testSolution);

    // All valid cells should be CORRECT
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        if (isValidCell(r, c)) {
          expect(colored[r][c].status).toBe(CellStatus.CORRECT);
        }
      }
    }
  });

  it('should mark wrong positions as WRONG (gray) when char not in row/col', () => {
    // Create a grid with completely wrong characters
    const grid: Grid = Array(GRID_SIZE).fill(null).map((_, r) =>
      Array(GRID_SIZE).fill(null).map((_, c) => ({
        char: isValidCell(r, c) ? 'Х' : '', // 'Х' not in solution
        status: isValidCell(r, c) ? CellStatus.WRONG : CellStatus.NONE
      }))
    );

    const colored = updateColors(grid, testSolution);

    // All valid cells should be WRONG (char not in any row/col)
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        if (isValidCell(r, c)) {
          expect(colored[r][c].status).toBe(CellStatus.WRONG);
        }
      }
    }
  });

  it('should preserve NONE status for gap cells', () => {
    const grid: Grid = testSolution.map((row, r) =>
      row.map((char, c) => ({
        char: isValidCell(r, c) ? char : '',
        status: isValidCell(r, c) ? CellStatus.WRONG : CellStatus.NONE
      }))
    );

    const colored = updateColors(grid, testSolution);

    // Gap cells should remain NONE
    expect(colored[1][1].status).toBe(CellStatus.NONE);
    expect(colored[1][3].status).toBe(CellStatus.NONE);
    expect(colored[3][1].status).toBe(CellStatus.NONE);
    expect(colored[3][3].status).toBe(CellStatus.NONE);
  });
});

describe('checkWin', () => {
  it('should return true when all valid cells are CORRECT', () => {
    const grid: Grid = Array(GRID_SIZE).fill(null).map((_, r) =>
      Array(GRID_SIZE).fill(null).map((_, c) => ({
        char: 'А',
        status: isValidCell(r, c) ? CellStatus.CORRECT : CellStatus.NONE
      }))
    );

    expect(checkWin(grid)).toBe(true);
  });

  it('should return false when any valid cell is not CORRECT', () => {
    const grid: Grid = Array(GRID_SIZE).fill(null).map((_, r) =>
      Array(GRID_SIZE).fill(null).map((_, c) => ({
        char: 'А',
        status: isValidCell(r, c) ? CellStatus.CORRECT : CellStatus.NONE
      }))
    );

    // Make one cell WRONG
    grid[0][0].status = CellStatus.WRONG;

    expect(checkWin(grid)).toBe(false);
  });

  it('should return false when any valid cell is PRESENT', () => {
    const grid: Grid = Array(GRID_SIZE).fill(null).map((_, r) =>
      Array(GRID_SIZE).fill(null).map((_, c) => ({
        char: 'А',
        status: isValidCell(r, c) ? CellStatus.CORRECT : CellStatus.NONE
      }))
    );

    // Make one cell PRESENT (yellow)
    grid[2][2].status = CellStatus.PRESENT;

    expect(checkWin(grid)).toBe(false);
  });

  it('should ignore NONE cells (gaps) when checking win', () => {
    const grid: Grid = Array(GRID_SIZE).fill(null).map((_, r) =>
      Array(GRID_SIZE).fill(null).map((_, c) => ({
        char: isValidCell(r, c) ? 'А' : '',
        status: isValidCell(r, c) ? CellStatus.CORRECT : CellStatus.NONE
      }))
    );

    // Gap cells are NONE, but should still win
    expect(checkWin(grid)).toBe(true);
  });
});

describe('Green Letter Algorithm (New)', () => {
  const testSolution: string[][] = [
    ['П', 'Л', 'А', 'Ж', 'А'],
    ['Е', ' ', 'Н', ' ', 'К'],
    ['В', 'Е', 'Т', 'Е', 'Р'],
    ['А', ' ', 'И', ' ', 'Е'],
    ['Ч', 'Е', 'К', 'О', 'Р']
  ];

  // Helper to count green (correct) letters
  const countGreens = (grid: Grid, solution: string[][]): number => {
    let count = 0;
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        if (isValidCell(r, c) && grid[r][c].char === solution[r][c]) {
          count++;
        }
      }
    }
    return count;
  };

  describe('Green count constraints', () => {
    it('should always produce 4-7 green letters', () => {
      // Test with multiple iterations to catch any randomness issues
      for (let i = 0; i < 50; i++) {
        const grid = generateInitialState(testSolution);
        const greens = countGreens(grid, testSolution);
        
        expect(greens).toBeGreaterThanOrEqual(4);
        expect(greens).toBeLessThanOrEqual(7);
      }
    });

    it('should never start with a fully solved puzzle', () => {
      for (let i = 0; i < 50; i++) {
        const grid = generateInitialState(testSolution);
        const greens = countGreens(grid, testSolution);
        
        // There are 21 valid cells, should never all be green
        expect(greens).toBeLessThan(21);
      }
    });

    it('should have at least some non-green letters', () => {
      for (let i = 0; i < 50; i++) {
        const grid = generateInitialState(testSolution);
        const greens = countGreens(grid, testSolution);
        
        // With max 7 greens, we should have at least 14 non-greens (21 - 7)
        expect(greens).toBeLessThanOrEqual(7);
      }
    });
  });

  describe('Letter conservation', () => {
    it('should preserve all letters from the solution', () => {
      const grid = generateInitialState(testSolution);

      // Extract all valid chars from solution
      const solutionChars: string[] = [];
      for (let r = 0; r < GRID_SIZE; r++) {
        for (let c = 0; c < GRID_SIZE; c++) {
          if (isValidCell(r, c)) {
            solutionChars.push(testSolution[r][c]);
          }
        }
      }

      // Extract all valid chars from generated grid
      const gridChars: string[] = [];
      for (let r = 0; r < GRID_SIZE; r++) {
        for (let c = 0; c < GRID_SIZE; c++) {
          if (isValidCell(r, c)) {
            gridChars.push(grid[r][c].char);
          }
        }
      }

      // Should have same characters (possibly in different order)
      expect(gridChars.sort()).toEqual(solutionChars.sort());
    });

    it('should not add or remove any characters', () => {
      const grid = generateInitialState(testSolution);

      // Count each character in solution
      const solutionCounts: Record<string, number> = {};
      for (let r = 0; r < GRID_SIZE; r++) {
        for (let c = 0; c < GRID_SIZE; c++) {
          if (isValidCell(r, c)) {
            const char = testSolution[r][c];
            solutionCounts[char] = (solutionCounts[char] || 0) + 1;
          }
        }
      }

      // Count each character in grid
      const gridCounts: Record<string, number> = {};
      for (let r = 0; r < GRID_SIZE; r++) {
        for (let c = 0; c < GRID_SIZE; c++) {
          if (isValidCell(r, c)) {
            const char = grid[r][c].char;
            gridCounts[char] = (gridCounts[char] || 0) + 1;
          }
        }
      }

      // Counts should match exactly
      expect(gridCounts).toEqual(solutionCounts);
    });
  });

  describe('Derangement algorithm', () => {
    it('should not create accidental greens beyond the intended count', () => {
      // Generate multiple grids and verify the algorithm maintains control
      for (let i = 0; i < 20; i++) {
        const grid = generateInitialState(testSolution);
        const greens = countGreens(grid, testSolution);
        
        // The algorithm should produce exactly the intended number of greens
        // (4-7 range), not more due to lucky random placements
        expect(greens).toBeLessThanOrEqual(7);
      }
    });

    it('should successfully create valid permutations', () => {
      // Verify the grid is a valid permutation (not partially filled)
      const grid = generateInitialState(testSolution);
      
      for (let r = 0; r < GRID_SIZE; r++) {
        for (let c = 0; c < GRID_SIZE; c++) {
          if (isValidCell(r, c)) {
            // Every valid cell should have a non-empty character
            expect(grid[r][c].char).toBeTruthy();
            expect(grid[r][c].char).not.toBe('');
          }
        }
      }
    });
  });

  describe('Deterministic behavior', () => {
    it('should produce consistent results for the same seed', () => {
      const grid1 = generateInitialState(testSolution);
      const grid2 = generateInitialState(testSolution);

      // Same seed (same day) should produce identical grids
      for (let r = 0; r < GRID_SIZE; r++) {
        for (let c = 0; c < GRID_SIZE; c++) {
          expect(grid1[r][c].char).toBe(grid2[r][c].char);
          expect(grid1[r][c].status).toBe(grid2[r][c].status);
        }
      }
    });

    it('should have same green count for same seed', () => {
      const grid1 = generateInitialState(testSolution);
      const grid2 = generateInitialState(testSolution);

      const greens1 = countGreens(grid1, testSolution);
      const greens2 = countGreens(grid2, testSolution);

      expect(greens1).toBe(greens2);
    });
  });

  describe('Distribution properties', () => {
    it('should be deterministic (same seed produces same green count)', () => {
      const samples = 100;
      const firstGrid = generateInitialState(testSolution);
      const firstGreens = countGreens(firstGrid, testSolution);

      // All iterations with same seed should produce same result
      for (let i = 0; i < samples; i++) {
        const grid = generateInitialState(testSolution);
        const greens = countGreens(grid, testSolution);
        
        expect(greens).toBe(firstGreens);
        expect(greens).toBeGreaterThanOrEqual(4);
        expect(greens).toBeLessThanOrEqual(7);
      }
    });

    it('should produce green count within expected range', () => {
      const grid = generateInitialState(testSolution);
      const greens = countGreens(grid, testSolution);
      
      // The algorithm guarantees 4-7 greens
      expect(greens).toBeGreaterThanOrEqual(4);
      expect(greens).toBeLessThanOrEqual(7);
    });
  });

  describe('Color coding integration', () => {
    it('should properly color-code the generated grid', () => {
      const grid = generateInitialState(testSolution);

      // Count different status types
      let correctCount = 0;
      let presentCount = 0;
      let wrongCount = 0;
      let noneCount = 0;

      for (let r = 0; r < GRID_SIZE; r++) {
        for (let c = 0; c < GRID_SIZE; c++) {
          const status = grid[r][c].status;
          if (status === CellStatus.CORRECT) correctCount++;
          else if (status === CellStatus.PRESENT) presentCount++;
          else if (status === CellStatus.WRONG) wrongCount++;
          else if (status === CellStatus.NONE) noneCount++;
        }
      }

      // Should have 4 NONE cells (gaps)
      expect(noneCount).toBe(4);

      // Should have 4-7 CORRECT cells (greens)
      expect(correctCount).toBeGreaterThanOrEqual(4);
      expect(correctCount).toBeLessThanOrEqual(7);

      // Total valid cells should be 21 (25 - 4 gaps)
      expect(correctCount + presentCount + wrongCount).toBe(21);
    });

    it('should mark green letters as CORRECT status', () => {
      const grid = generateInitialState(testSolution);

      // All letters matching their solution position should be CORRECT
      for (let r = 0; r < GRID_SIZE; r++) {
        for (let c = 0; c < GRID_SIZE; c++) {
          if (isValidCell(r, c)) {
            if (grid[r][c].char === testSolution[r][c]) {
              expect(grid[r][c].status).toBe(CellStatus.CORRECT);
            }
          }
        }
      }
    });
  });
});
