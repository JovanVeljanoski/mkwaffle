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

describe('updateColors - Duplicate Letter Handling', () => {
  // Test the fix for duplicate letter yellow coloring
  // Bug: When solution has 1 'A' but grid has 2 'A's, both were yellow
  // Fix: Only as many yellows as there are remaining needed letters

  it('should only yellow one letter when solution has one but grid has two', () => {
    // Solution row 0: А Б В Г Д (one А at position 0)
    // Current row 0: Х А А Г Д (two А's at positions 1 and 2, X at position 0)
    const solution: string[][] = [
      ['А', 'Б', 'В', 'Г', 'Д'],
      ['Е', ' ', 'Ж', ' ', 'З'],
      ['И', 'Ј', 'К', 'Л', 'М'],
      ['Н', ' ', 'О', ' ', 'П'],
      ['Р', 'С', 'Т', 'У', 'Ф']
    ];

    const grid: Grid = [
      // Row 0: X at pos 0 (needs А), two А's at positions 1 and 2
      [
        { char: 'Х', status: CellStatus.WRONG },
        { char: 'А', status: CellStatus.WRONG },
        { char: 'А', status: CellStatus.WRONG },
        { char: 'Г', status: CellStatus.WRONG },
        { char: 'Д', status: CellStatus.WRONG }
      ],
      [
        { char: 'Е', status: CellStatus.WRONG },
        { char: '', status: CellStatus.NONE },
        { char: 'Ж', status: CellStatus.WRONG },
        { char: '', status: CellStatus.NONE },
        { char: 'З', status: CellStatus.WRONG }
      ],
      [
        { char: 'И', status: CellStatus.WRONG },
        { char: 'Ј', status: CellStatus.WRONG },
        { char: 'К', status: CellStatus.WRONG },
        { char: 'Л', status: CellStatus.WRONG },
        { char: 'М', status: CellStatus.WRONG }
      ],
      [
        { char: 'Н', status: CellStatus.WRONG },
        { char: '', status: CellStatus.NONE },
        { char: 'О', status: CellStatus.WRONG },
        { char: '', status: CellStatus.NONE },
        { char: 'П', status: CellStatus.WRONG }
      ],
      [
        { char: 'Р', status: CellStatus.WRONG },
        { char: 'С', status: CellStatus.WRONG },
        { char: 'Т', status: CellStatus.WRONG },
        { char: 'У', status: CellStatus.WRONG },
        { char: 'Ф', status: CellStatus.WRONG }
      ]
    ];

    const colored = updateColors(grid, solution);

    // Position 0: Х is wrong and not needed - should be WRONG (gray)
    expect(colored[0][0].status).toBe(CellStatus.WRONG);

    // Position 1: First А - should be PRESENT (yellow) because row needs А
    expect(colored[0][1].status).toBe(CellStatus.PRESENT);

    // Position 2: Second А - should be WRONG (gray) because row's А need was claimed
    // BUT it's at an intersection (col 2), so check if col 2 needs А
    // Col 2 solution: В, Ж, К, О, Т - no А, so this А should be gray
    expect(colored[0][2].status).toBe(CellStatus.WRONG);
  });

  it('should yellow intersection letter for column when row need is claimed', () => {
    // Scenario: Two А's in row, one at intersection
    // Row needs 1 А, Column also needs 1 А
    // First А (non-intersection) claims row, second А (intersection) should be yellow for column

    const solution: string[][] = [
      ['А', 'Б', 'В', 'Г', 'Д'],  // Row 0 has А at position 0
      ['Е', ' ', 'Ж', ' ', 'З'],
      ['И', 'Ј', 'К', 'Л', 'М'],
      ['Н', ' ', 'А', ' ', 'П'],  // Col 2 has А at position 3 (row 3)
      ['Р', 'С', 'Т', 'У', 'Ф']
    ];

    const grid: Grid = [
      // Row 0: X at pos 0, А at pos 1 (non-intersection), А at pos 2 (intersection with col 2)
      [
        { char: 'Х', status: CellStatus.WRONG },
        { char: 'А', status: CellStatus.WRONG },
        { char: 'А', status: CellStatus.WRONG },
        { char: 'Г', status: CellStatus.WRONG },
        { char: 'Д', status: CellStatus.WRONG }
      ],
      [
        { char: 'Е', status: CellStatus.WRONG },
        { char: '', status: CellStatus.NONE },
        { char: 'Ж', status: CellStatus.WRONG },
        { char: '', status: CellStatus.NONE },
        { char: 'З', status: CellStatus.WRONG }
      ],
      [
        { char: 'И', status: CellStatus.WRONG },
        { char: 'Ј', status: CellStatus.WRONG },
        { char: 'К', status: CellStatus.WRONG },
        { char: 'Л', status: CellStatus.WRONG },
        { char: 'М', status: CellStatus.WRONG }
      ],
      [
        { char: 'Н', status: CellStatus.WRONG },
        { char: '', status: CellStatus.NONE },
        { char: 'Х', status: CellStatus.WRONG },  // Col 2 needs А here
        { char: '', status: CellStatus.NONE },
        { char: 'П', status: CellStatus.WRONG }
      ],
      [
        { char: 'Р', status: CellStatus.WRONG },
        { char: 'С', status: CellStatus.WRONG },
        { char: 'Т', status: CellStatus.WRONG },
        { char: 'У', status: CellStatus.WRONG },
        { char: 'Ф', status: CellStatus.WRONG }
      ]
    ];

    const colored = updateColors(grid, solution);

    // Position (0,1): First А - yellow for row 0 (row needs А at position 0)
    expect(colored[0][1].status).toBe(CellStatus.PRESENT);

    // Position (0,2): Second А at intersection - should ALSO be yellow
    // Row 0's А need was claimed by (0,1), BUT col 2 needs А at position (3,2)
    // So this А should be yellow for the column
    expect(colored[0][2].status).toBe(CellStatus.PRESENT);
  });

  it('should handle multiple duplicate letters correctly', () => {
    // Solution has 2 А's in row, grid has 3 А's
    // Only 2 should be yellow

    const solution: string[][] = [
      ['А', 'Б', 'А', 'Г', 'Д'],  // Row 0 has А at positions 0 and 2
      ['Е', ' ', 'Ж', ' ', 'З'],
      ['И', 'Ј', 'К', 'Л', 'М'],
      ['Н', ' ', 'О', ' ', 'П'],
      ['Р', 'С', 'Т', 'У', 'Ф']
    ];

    const grid: Grid = [
      // Row 0: X X X, then А А А at positions 1, 3, 4 (none in correct position)
      [
        { char: 'Х', status: CellStatus.WRONG },  // Should be А
        { char: 'А', status: CellStatus.WRONG },  // First А
        { char: 'Х', status: CellStatus.WRONG },  // Should be А
        { char: 'А', status: CellStatus.WRONG },  // Second А
        { char: 'А', status: CellStatus.WRONG }   // Third А
      ],
      [
        { char: 'Е', status: CellStatus.WRONG },
        { char: '', status: CellStatus.NONE },
        { char: 'Ж', status: CellStatus.WRONG },
        { char: '', status: CellStatus.NONE },
        { char: 'З', status: CellStatus.WRONG }
      ],
      [
        { char: 'И', status: CellStatus.WRONG },
        { char: 'Ј', status: CellStatus.WRONG },
        { char: 'К', status: CellStatus.WRONG },
        { char: 'Л', status: CellStatus.WRONG },
        { char: 'М', status: CellStatus.WRONG }
      ],
      [
        { char: 'Н', status: CellStatus.WRONG },
        { char: '', status: CellStatus.NONE },
        { char: 'О', status: CellStatus.WRONG },
        { char: '', status: CellStatus.NONE },
        { char: 'П', status: CellStatus.WRONG }
      ],
      [
        { char: 'Р', status: CellStatus.WRONG },
        { char: 'С', status: CellStatus.WRONG },
        { char: 'Т', status: CellStatus.WRONG },
        { char: 'У', status: CellStatus.WRONG },
        { char: 'Ф', status: CellStatus.WRONG }
      ]
    ];

    const colored = updateColors(grid, solution);

    // Count how many А's are yellow in row 0
    let yellowCount = 0;
    for (let c = 0; c < GRID_SIZE; c++) {
      if (colored[0][c].char === 'А' && colored[0][c].status === CellStatus.PRESENT) {
        yellowCount++;
      }
    }

    // Solution needs 2 А's, so exactly 2 should be yellow
    expect(yellowCount).toBe(2);

    // First two А's (at positions 1 and 3) should be yellow, third (position 4) gray
    expect(colored[0][1].status).toBe(CellStatus.PRESENT);
    expect(colored[0][3].status).toBe(CellStatus.PRESENT);
    expect(colored[0][4].status).toBe(CellStatus.WRONG);
  });

  it('should mark letter as green when in correct position even with duplicates', () => {
    const solution: string[][] = [
      ['А', 'Б', 'В', 'Г', 'Д'],
      ['Е', ' ', 'Ж', ' ', 'З'],
      ['И', 'Ј', 'К', 'Л', 'М'],
      ['Н', ' ', 'О', ' ', 'П'],
      ['Р', 'С', 'Т', 'У', 'Ф']
    ];

    const grid: Grid = [
      // Row 0: А in correct position (0), another А at position 1
      [
        { char: 'А', status: CellStatus.WRONG },  // Correct position!
        { char: 'А', status: CellStatus.WRONG },  // Extra А
        { char: 'В', status: CellStatus.WRONG },
        { char: 'Г', status: CellStatus.WRONG },
        { char: 'Д', status: CellStatus.WRONG }
      ],
      [
        { char: 'Е', status: CellStatus.WRONG },
        { char: '', status: CellStatus.NONE },
        { char: 'Ж', status: CellStatus.WRONG },
        { char: '', status: CellStatus.NONE },
        { char: 'З', status: CellStatus.WRONG }
      ],
      [
        { char: 'И', status: CellStatus.WRONG },
        { char: 'Ј', status: CellStatus.WRONG },
        { char: 'К', status: CellStatus.WRONG },
        { char: 'Л', status: CellStatus.WRONG },
        { char: 'М', status: CellStatus.WRONG }
      ],
      [
        { char: 'Н', status: CellStatus.WRONG },
        { char: '', status: CellStatus.NONE },
        { char: 'О', status: CellStatus.WRONG },
        { char: '', status: CellStatus.NONE },
        { char: 'П', status: CellStatus.WRONG }
      ],
      [
        { char: 'Р', status: CellStatus.WRONG },
        { char: 'С', status: CellStatus.WRONG },
        { char: 'Т', status: CellStatus.WRONG },
        { char: 'У', status: CellStatus.WRONG },
        { char: 'Ф', status: CellStatus.WRONG }
      ]
    ];

    const colored = updateColors(grid, solution);

    // Position 0: А is in correct position - should be GREEN
    expect(colored[0][0].status).toBe(CellStatus.CORRECT);

    // Position 1: Extra А - should be GRAY (row's А need is satisfied by position 0)
    expect(colored[0][1].status).toBe(CellStatus.WRONG);
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
