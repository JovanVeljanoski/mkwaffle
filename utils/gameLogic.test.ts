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
