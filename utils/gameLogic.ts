import { CellStatus, Coords, Grid } from '../types';
import { seededShuffle, getDailySeed } from './daily';
import { GRID_SIZE } from '../constants';

// Valid coordinates for the waffle shape
const VALID_COORDS: Coords[] = [];
for (let r = 0; r < GRID_SIZE; r++) {
  for (let c = 0; c < GRID_SIZE; c++) {
    // Rows 0, 2, 4 are full. Cols 0, 2, 4 are full.
    // Gaps are at (1,1), (1,3), (3,1), (3,3)
    if ((r % 2 === 0) || (c % 2 === 0)) {
      VALID_COORDS.push({ row: r, col: c });
    }
  }
}

export const isValidCell = (r: number, c: number) => {
  return (r % 2 === 0) || (c % 2 === 0);
};

export const generateInitialState = (solution: string[][]): Grid => {
  const seed = getDailySeed();

  // Extract all valid characters from the solution
  const chars: string[] = [];
  VALID_COORDS.forEach(({ row, col }) => {
    chars.push(solution[row][col]);
  });

  // Shuffle them
  // We shuffle until we have at least a few not in the right spot
  // But for this implementation, a single deterministic shuffle is fine.
  // To ensure it's not solved initially (rare but possible), we could add checks,
  // but purely random is standard for Waffle clones.
  const shuffledChars = seededShuffle(chars, seed);

  // Map back to grid
  const grid: Grid = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(null));

  let charIndex = 0;
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (isValidCell(r, c)) {
        grid[r][c] = {
          char: shuffledChars[charIndex],
          status: CellStatus.WRONG,
        };
        charIndex++;
      } else {
        grid[r][c] = {
          char: '',
          status: CellStatus.NONE,
        };
      }
    }
  }

  return updateColors(grid, solution);
};

export const updateColors = (currentGrid: Grid, solution: string[][]): Grid => {
  const newGrid = currentGrid.map(row => row.map(cell => ({ ...cell })));

  // 1. Mark CORRECT (Green)
  for (const { row, col } of VALID_COORDS) {
    if (newGrid[row][col].char === solution[row][col]) {
      newGrid[row][col].status = CellStatus.CORRECT;
    } else {
      newGrid[row][col].status = CellStatus.WRONG;
    }
  }

  // 2. Mark PRESENT (Yellow)
  // Waffle logic: A letter is yellow if it belongs in the current ROW or COLUMN
  // and is not already matched (Green) elsewhere.

  // We need to count frequencies of letters needed in each row/col
  // minus the ones already satisfied by Green tiles.

  for (const { row, col } of VALID_COORDS) {
    if (newGrid[row][col].status === CellStatus.CORRECT) continue;

    const char = newGrid[row][col].char;
    let isYellow = false;

    // Check Row necessity
    if (row % 2 === 0) {
      // It's a horizontal word
      const rowChars = newGrid[row].map(c => c.char);
      const neededInRow = countNeeded(solution[row], rowChars, char);
      if (neededInRow > 0) isYellow = true;
    }

    // Check Column necessity
    if (!isYellow && col % 2 === 0) {
      // It's a vertical word
      const colSolution = solution.map(r => r[col]);
      const colCurrent = newGrid.map(r => r[col].char);
      const neededInCol = countNeeded(colSolution, colCurrent, char);
      if (neededInCol > 0) isYellow = true;
    }

    if (isYellow) {
      newGrid[row][col].status = CellStatus.PRESENT;
    }
  }

  return newGrid;
};

// Helper to count how many times 'char' is needed in a line (row or col),
// excluding spots that are already correct (Green).
// Note: This is a simplified "Waffle" logic. The real game has complex corner logic.
// For this clone, if the letter exists in the solution line AND isn't satisfied by a Green tile at that position,
// AND the number of current occurrences of that char in the line (excluding greens) <= needed, it's yellow.
// To keep it simple and robust: If it exists in the solution line, we mark it yellow.
const countNeeded = (solLine: string[], currLine: string[], char: string): number => {
  let needed = 0;
  // Count total occurrences in solution
  // Subtract instances where the current grid already has the correct letter (Green)
  for (let i = 0; i < solLine.length; i++) {
     if (solLine[i] === char && currLine[i] !== char) {
       needed++;
     }
  }
  return needed; // If > 0, there is a slot in this line that needs this letter
};

export const checkWin = (grid: Grid): boolean => {
  for (const { row, col } of VALID_COORDS) {
    if (grid[row][col].status !== CellStatus.CORRECT) return false;
  }
  return true;
};