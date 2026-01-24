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

/**
 * Generate a derangement: shuffle letters so NONE end up in original positions
 * Uses rejection sampling with fallback to guarantee termination
 */
const generateDerangement = (
  letters: string[],
  originalPositions: string[],
  seed: number,
  maxAttempts: number = 100
): string[] => {
  // If only 1 letter, derangement is impossible - return as is
  if (letters.length === 1) {
    return letters;
  }

  // Try rejection sampling first
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const shuffled = seededShuffle(letters, seed + attempt + 100);

    // Check if it's a valid derangement (no letter in original position)
    let isDerangement = true;
    for (let i = 0; i < shuffled.length; i++) {
      if (shuffled[i] === originalPositions[i]) {
        isDerangement = false;
        break;
      }
    }

    if (isDerangement) {
      return shuffled;
    }
  }

  // Fallback: forced derangement using swaps
  // Start with a shuffle and fix any collisions
  const result = seededShuffle(letters, seed + 999);

  for (let i = 0; i < result.length; i++) {
    if (result[i] === originalPositions[i]) {
      // Find a position to swap with (that won't create a new collision)
      for (let j = i + 1; j < result.length; j++) {
        if (
          result[j] !== originalPositions[j] &&
          result[i] !== originalPositions[j] &&
          result[j] !== originalPositions[i]
        ) {
          // Safe swap
          [result[i], result[j]] = [result[j], result[i]];
          break;
        }
      }
      // If no safe swap found, try with any position that doesn't match
      if (result[i] === originalPositions[i]) {
        for (let j = i + 1; j < result.length; j++) {
          if (result[j] !== originalPositions[i]) {
            [result[i], result[j]] = [result[j], result[i]];
            break;
          }
        }
      }
    }
  }

  return result;
};

export const generateInitialState = (solution: string[][]): Grid => {
  const seed = getDailySeed();

  // Pseudo-random number generator for this seed
  const mulberry32 = (a: number) => {
    return function () {
      let t = (a += 0x6d2b79f5);
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  };

  const rng = mulberry32(seed);

  // Step 1: Decide how many positions to keep green (4-7)
  // Weighted distribution: 4: 40%, 5: 30%, 6: 20%, 7: 10%
  const rand = rng();
  let numGreens: number;
  if (rand < 0.4) numGreens = 4;
  else if (rand < 0.7) numGreens = 5;
  else if (rand < 0.9) numGreens = 6;
  else numGreens = 7;

  // Step 2: Select which positions to keep green
  // Shuffle coordinates to randomly select positions
  const shuffledCoords = seededShuffle([...VALID_COORDS], seed + 1);
  const greenPositions = new Set<string>();
  for (let i = 0; i < numGreens; i++) {
    const coord = shuffledCoords[i];
    greenPositions.add(`${coord.row},${coord.col}`);
  }

  // Step 3: Separate green and non-green positions
  const nonGreenLetters: string[] = [];
  const nonGreenOriginalLetters: string[] = [];

  VALID_COORDS.forEach(({ row, col }) => {
    if (!greenPositions.has(`${row},${col}`)) {
      nonGreenLetters.push(solution[row][col]);
      nonGreenOriginalLetters.push(solution[row][col]);
    }
  });

  // Step 4: Generate a DERANGEMENT of non-green letters
  // This ensures NO letter ends up in its original position (prevents accidental greens)
  const derangedLetters = generateDerangement(
    nonGreenLetters,
    nonGreenOriginalLetters,
    seed + 2
  );

  // Step 5: Build the grid
  const grid: Grid = Array(GRID_SIZE)
    .fill(null)
    .map(() => Array(GRID_SIZE).fill(null));

  let nonGreenIndex = 0;
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (isValidCell(r, c)) {
        if (greenPositions.has(`${r},${c}`)) {
          // Keep this position green (correct)
          grid[r][c] = {
            char: solution[r][c],
            status: CellStatus.WRONG, // Will be updated by updateColors
          };
        } else {
          // Use deranged letter (guaranteed NOT in correct position)
          grid[r][c] = {
            char: derangedLetters[nonGreenIndex],
            status: CellStatus.WRONG,
          };
          nonGreenIndex++;
        }
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