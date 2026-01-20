import React, { useEffect, useState } from 'react';
import { getNextMidnight, getDailySeed } from '../utils/daily';
import { isValidCell } from '../utils/gameLogic';
import { GRID_SIZE } from '../constants';
import { GameStats, Grid, CellStatus } from '../types';

interface ResultModalProps {
  status: 'WON' | 'LOST';
  swapsRemaining: number;
  solution: string[][] | null;
  stats: GameStats;
  grid: Grid | null;
}

const ResultModal: React.FC<ResultModalProps> = ({ status, swapsRemaining, solution, stats, grid }) => {
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [showingSolution, setShowingSolution] = useState(false);
  const [showCopied, setShowCopied] = useState(false);

  // Stars = swaps remaining (max 5, like original Waffle)
  const stars = status === 'WON' ? Math.min(5, Math.max(0, swapsRemaining)) : 0;

  useEffect(() => {
    const updateTimer = () => {
      const target = getNextMidnight();
      const now = new Date();
      const diff = target.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeLeft("00:00:00");
        return;
      }

      const h = Math.floor(diff / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((diff % (1000 * 60)) / 1000);

      const pad = (n: number) => n.toString().padStart(2, '0');
      setTimeLeft(`${pad(h)}:${pad(m)}:${pad(s)}`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, []);

  // Generate emoji grid for sharing
  // Stars are shown in the gap positions based on how many stars were won
  // Gap positions: [1][1], [1][3], [3][1], [3][3] (4 total)
  // For 5 stars, also show star at center [2][2]
  const generateEmojiGrid = (): string => {
    if (!grid) return '';

    // Define gap positions in order they'll be filled with stars (diagonal pattern)
    const gapPositions = [
      [1, 1], [3, 3], [1, 3], [3, 1]
    ];

    // Determine which gaps get stars (up to 4)
    const starsInGaps = Math.min(stars, 4);

    const rows: string[] = [];
    for (let row = 0; row < GRID_SIZE; row++) {
      let rowStr = '';
      for (let col = 0; col < GRID_SIZE; col++) {
        if (!isValidCell(row, col)) {
          // This is a gap position - check if it should be a star
          const gapIndex = gapPositions.findIndex(([r, c]) => r === row && c === col);
          if (gapIndex !== -1 && gapIndex < starsInGaps) {
            rowStr += '⭐';
          } else {
            rowStr += '⬜'; // Empty gap (no star earned for this position)
          }
        } else if (row === 2 && col === 2 && stars === 5) {
          // Center position - show star if 5 stars won
          rowStr += '⭐';
        } else {
          const cell = grid[row][col];
          switch (cell.status) {
            case CellStatus.CORRECT:
              rowStr += '🟩';
              break;
            case CellStatus.PRESENT:
              rowStr += '🟨';
              break;
            case CellStatus.WRONG:
            default:
              rowStr += '⬜';
              break;
          }
        }
      }
      rows.push(rowStr);
    }
    return rows.join('\n');
  };

  // Generate share text
  const handleShare = async () => {
    const puzzleNumber = getDailySeed(); // Now returns 1, 2, 3... starting from Jan 17, 2026
    const emojiGrid = generateEmojiGrid();

    // Format: #вафла{number} {stars}/5
    const shareText = [
      `#вафла${puzzleNumber} ${stars}/5`,
      '',
      emojiGrid,
      '',
      `🔥 серија: ${stats.currentStreak}`,
      'https://vafla.mk'
    ].join('\n');

    let shared = false;
    if (navigator.share) {
      try {
        await navigator.share({ text: shareText });
        shared = true;
      } catch {
        // User cancelled or error - fall back to clipboard
      }
    }

    if (!shared) {
      try {
        await navigator.clipboard.writeText(shareText);
        setShowCopied(true);
        setTimeout(() => setShowCopied(false), 2000);
      } catch {
        // Clipboard API not available or permission denied
        // Could show a "copy failed" message, but silent fail is acceptable
        // since this is a non-critical feature
      }
    }
  };

  // Render star icons
  const renderStars = () => {
    return (
      <div className="flex justify-center gap-1 my-3">
        {[...Array(5)].map((_, i) => (
          <svg
            key={i}
            className={`w-8 h-8 ${i < stars ? 'text-yellow-400' : 'text-gray-300'}`}
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        ))}
      </div>
    );
  };

  // Render mini solution grid
  const renderSolutionGrid = () => {
    if (!solution) return null;

    return (
      <div className="grid grid-cols-5 gap-1 my-4">
        {Array(GRID_SIZE).fill(null).map((_, row) => (
          Array(GRID_SIZE).fill(null).map((_, col) => {
            const isValid = isValidCell(row, col);
            const char = solution[row][col];

            if (!isValid) {
              return <div key={`${row}-${col}`} className="w-8 h-8 sm:w-10 sm:h-10" />;
            }

            return (
              <div
                key={`${row}-${col}`}
                className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center text-sm sm:text-base font-bold text-gray-800 dark:text-white border border-gray-200 dark:border-gray-600"
              >
                {char}
              </div>
            );
          })
        ))}
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center justify-center w-full text-center animate-in fade-in duration-500">
      {/* Stars */}
      {renderStars()}

      {/* Star message */}
      <p className="text-gray-600 dark:text-gray-400 font-medium text-lg mb-4">
        {status === 'LOST' && 'Без ѕвезди овој пат'}
        {status === 'WON' && stars === 5 && 'Совршено! 🎉'}
        {status === 'WON' && stars === 4 && 'Одлично!'}
        {status === 'WON' && stars === 3 && 'Многу добро!'}
        {status === 'WON' && stars === 2 && 'Добро!'}
        {status === 'WON' && stars === 1 && 'Успеа!'}
        {status === 'WON' && stars === 0 && 'Решено!'}
      </p>

      {/* Separator */}
      <div className="w-full h-[1px] bg-gray-200 dark:bg-gray-700 mb-4" />

      {/* Share Button */}
      <button
        onClick={handleShare}
        className={`${
          showCopied ? 'bg-[#58595b]' : 'bg-[#6aaa64] hover:bg-[#5a9a54]'
        } text-white font-bold py-3 px-12 rounded-lg shadow-md active:scale-95 transition-all mb-4 flex items-center gap-2 min-w-[180px] justify-center`}
      >
        {showCopied ? (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
            </svg>
            КОПИРАНО!
          </>
        ) : (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z"/>
            </svg>
            СПОДЕЛИ
          </>
        )}
      </button>

      {/* Next Waffle Timer */}
      <p className="text-gray-500 dark:text-gray-400 font-medium text-base mb-4">
        Следна Вафла: <span className="font-bold text-gray-800 dark:text-white text-lg">{timeLeft}</span>
      </p>

      {/* Separator */}
      <div className="w-full h-[1px] bg-gray-200 dark:bg-gray-700 mb-4" />

      {/* Stats Section */}
      <div className="w-full max-w-[320px] mb-4">
        <div className="flex justify-between py-3 border-b border-gray-100 dark:border-gray-700">
          <span className="text-sm font-semibold text-gray-500 dark:text-gray-400 tracking-wide">ТЕКОВНА СЕРИЈА</span>
          <span className="font-black text-gray-800 dark:text-white">{stats.currentStreak}</span>
        </div>
        <div className="flex justify-between py-3 border-b border-gray-100 dark:border-gray-700">
          <span className="text-sm font-semibold text-gray-500 dark:text-gray-400 tracking-wide">ОДИГРАНИ</span>
          <span className="font-black text-gray-800 dark:text-white">{stats.played}</span>
        </div>
        <div className="flex justify-between py-3">
          <span className="text-sm font-semibold text-gray-500 dark:text-gray-400 tracking-wide">ВКУПНО ЅВЕЗДИ</span>
          <span className="font-black text-gray-800 dark:text-white">{stats.totalStars}</span>
        </div>
      </div>

      {/* Show Solution Button - Only for LOST */}
      {status === 'LOST' && !showingSolution && (
        <button
          onClick={() => setShowingSolution(true)}
          className="bg-[#6aaa64] hover:bg-[#5a9a54] text-white font-bold py-3 px-8 rounded-lg shadow-md active:scale-95 transition-all mb-4 tracking-wider"
        >
          ВИДИ ГО РЕШЕНИЕТО
        </button>
      )}

      {/* Solution Grid */}
      {status === 'LOST' && showingSolution && (
        <div className="mb-4">
          {renderSolutionGrid()}
        </div>
      )}
    </div>
  );
};

export default ResultModal;
