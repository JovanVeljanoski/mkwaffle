import { WORDS } from '../constants';
import { DailyPuzzle } from '../types';

// Pseudo-random number generator (Mulberry32)
// This ensures everyone gets the same shuffle for the same seed
function mulberry32(a: number) {
  return function() {
    let t = a += 0x6D2B79F5;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
}

// The game launched on January 17, 2026 (Amsterdam timezone)
// Puzzle #1 = Jan 17, 2026, Puzzle #2 = Jan 18, 2026, etc.
const LAUNCH_YEAR = 2026;
const LAUNCH_MONTH = 1; // January
const LAUNCH_DAY = 17;

// Get Amsterdam date components
const getAmsterdamDateParts = (date: Date): { year: number; month: number; day: number } => {
  const options: Intl.DateTimeFormatOptions = {
    timeZone: 'Europe/Amsterdam',
    year: 'numeric',
    month: 'numeric',
    day: 'numeric'
  };
  const formatter = new Intl.DateTimeFormat('en-US', options);
  const parts = formatter.formatToParts(date);

  return {
    year: parseInt(parts.find(p => p.type === 'year')?.value || '2026', 10),
    month: parseInt(parts.find(p => p.type === 'month')?.value || '1', 10),
    day: parseInt(parts.find(p => p.type === 'day')?.value || '1', 10)
  };
};

// Calculate days since a reference date (using simple date math)
const daysSinceEpoch = (year: number, month: number, day: number): number => {
  // Use UTC to avoid timezone issues in calculation
  const date = Date.UTC(year, month - 1, day);
  return Math.floor(date / (24 * 60 * 60 * 1000));
};

export const getDailySeed = (): number => {
  const now = new Date();
  const { year, month, day } = getAmsterdamDateParts(now);

  const todayDays = daysSinceEpoch(year, month, day);
  const launchDays = daysSinceEpoch(LAUNCH_YEAR, LAUNCH_MONTH, LAUNCH_DAY);

  // Puzzle #1 = launch day, #2 = launch day + 1, etc.
  const puzzleNumber = todayDays - launchDays + 1;

  // Return puzzle number (minimum 1)
  return Math.max(1, puzzleNumber);
};

export const getNextMidnight = (): Date => {
  const now = new Date();

  // Get Amsterdam date parts using the same reliable method as getDailySeed
  const { year, month, day } = getAmsterdamDateParts(now);

  // Calculate Amsterdam midnight for tomorrow in UTC
  // Amsterdam is UTC+1 (CET) or UTC+2 (CEST during DST)
  // We compute "tomorrow 00:00 Amsterdam" by:
  // 1. Getting tomorrow's date in Amsterdam
  // 2. Creating that date at midnight UTC, then adjusting for timezone

  // Tomorrow in Amsterdam
  const tomorrowUTC = Date.UTC(year, month - 1, day + 1, 0, 0, 0, 0);

  // Get the offset for Amsterdam at that time by checking what hour it shows
  const tomorrowDate = new Date(tomorrowUTC);
  const amsterdamHourAtUTCMidnight = parseInt(
    new Intl.DateTimeFormat('en-US', {
      timeZone: 'Europe/Amsterdam',
      hour: 'numeric',
      hour12: false,
    }).format(tomorrowDate),
    10
  );

  // If Amsterdam shows hour 1 at UTC midnight, Amsterdam is UTC+1 (CET)
  // If Amsterdam shows hour 2 at UTC midnight, Amsterdam is UTC+2 (CEST)
  // So Amsterdam midnight = UTC midnight - offset hours
  const offsetHours = amsterdamHourAtUTCMidnight;
  const amsterdamMidnightUTC = tomorrowUTC - offsetHours * 60 * 60 * 1000;

  return new Date(amsterdamMidnightUTC);
};

// Shuffler using the daily seed
export const seededShuffle = <T,>(array: T[], seed: number): T[] => {
  const rng = mulberry32(seed);
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// --- Puzzle Generation Logic ---

const FALLBACK_SOLUTION = [
    ['П', 'Л', 'А', 'Ж', 'А'],
    ['Е', ' ', 'Н', ' ', 'К'],
    ['В', 'Е', 'Т', 'Е', 'Р'],
    ['А', ' ', 'И', ' ', 'Е'],
    ['Ч', 'Е', 'К', 'О', 'Р']
];

export const getDailyPuzzle = (): DailyPuzzle => {
  const seed = getDailySeed();

  try {
    const puzzle = generatePuzzle(seed);
    if (puzzle) return puzzle;
  } catch (e) {
    console.error("Puzzle generation failed:", e);
  }

  return {
    id: seed,
    solution: FALLBACK_SOLUTION
  };
};

const generatePuzzle = (seed: number): DailyPuzzle | null => {
    const rng = mulberry32(seed);

    // Shuffle words to ensure randomness each day
    const words = [...WORDS];
    for (let i = words.length - 1; i > 0; i--) {
        const j = Math.floor(rng() * (i + 1));
        [words[i], words[j]] = [words[j], words[i]];
    }

    // Index words by start letter for faster lookup
    const wordsByStart: Record<string, string[]> = {};
    for (const w of words) {
        const first = w[0];
        if (!wordsByStart[first]) wordsByStart[first] = [];
        wordsByStart[first].push(w);
    }

    // Helper to find a word that matches constraints
    const findMatch = (c0: string, c2: string, c4: string, exclude: Set<string>): string | null => {
         const candidates = wordsByStart[c0] || [];
         for (const w of candidates) {
             if (w[2] === c2 && w[4] === c4 && !exclude.has(w)) {
                 return w;
             }
         }
         return null;
    };

    let attempts = 0;
    const MAX_ATTEMPTS = 50000;

    // Heuristic:
    // 1. Pick H1 (Row 0)
    // 2. Pick V1 (Col 0), V2 (Col 2), V3 (Col 4) based on H1
    // 3. Find H2 (Row 2) fitting V1, V2, V3
    // 4. Find H3 (Row 4) fitting V1, V2, V3

    for (const h1 of words) {
        const exclude = new Set<string>([h1]);

        // Potential V1 candidates (must start with H1[0])
        const v1Candidates = wordsByStart[h1[0]] || [];
        for (const v1 of v1Candidates) {
            if (exclude.has(v1)) continue;
            exclude.add(v1);

            // Potential V2 candidates (must start with H1[2])
            const v2Candidates = wordsByStart[h1[2]] || [];
            for (const v2 of v2Candidates) {
                if (exclude.has(v2)) continue;
                exclude.add(v2);

                // Potential V3 candidates (must start with H1[4])
                const v3Candidates = wordsByStart[h1[4]] || [];
                for (const v3 of v3Candidates) {
                    if (exclude.has(v3)) continue;
                    exclude.add(v3);

                    // Now try to find H2
                    // It intersects V1 at index 2, V2 at index 2, V3 at index 2
                    // Pattern: V1[2] _ V2[2] _ V3[2]
                    const h2 = findMatch(v1[2], v2[2], v3[2], exclude);

                    if (h2) {
                        exclude.add(h2);
                        // Now try to find H3
                        // It intersects V1 at index 4, V2 at index 4, V3 at index 4
                        // Pattern: V1[4] _ V2[4] _ V3[4]
                        const h3 = findMatch(v1[4], v2[4], v3[4], exclude);

                        if (h3) {
                            // Valid puzzle found!
                            return {
                                id: seed,
                                solution: buildGrid(h1, h2, h3, v1, v2, v3)
                            };
                        }
                        exclude.delete(h2);
                    }

                    exclude.delete(v3);
                    attempts++;
                    if (attempts > MAX_ATTEMPTS) break;
                }
                if (attempts > MAX_ATTEMPTS) break;
                exclude.delete(v2);
            }
            if (attempts > MAX_ATTEMPTS) break;
            exclude.delete(v1);
        }
        if (attempts > MAX_ATTEMPTS) break;
    }

    return null;
};

const buildGrid = (h1: string, h2: string, h3: string, v1: string, v2: string, v3: string): string[][] => {
    return [
        [h1[0], h1[1], h1[2], h1[3], h1[4]],
        [v1[1], ' ',   v2[1], ' ',   v3[1]],
        [h2[0], h2[1], h2[2], h2[3], h2[4]],
        [v1[3], ' ',   v2[3], ' ',   v3[3]],
        [h3[0], h3[1], h3[2], h3[3], h3[4]]
    ];
};