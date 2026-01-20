import React, { useState, useEffect, useRef, useCallback } from 'react';
import Header from './components/Header';
import Board from './components/Board';
import Tile from './components/Tile';
import ResultModal from './components/ResultModal';
import HelpModal from './components/HelpModal';
import StatsModal from './components/StatsModal';
import AboutPanel from './components/AboutPanel';
import MenuPanel from './components/MenuPanel';
import OptionsModal from './components/OptionsModal';
import { Grid, Coords, GameStatus, CellStatus, CellData } from './types';
import { getDailyPuzzle, getDailySeed } from './utils/daily';
import { generateInitialState, updateColors, checkWin } from './utils/gameLogic';
import { TOTAL_SWAPS } from './constants';
import { useStats } from './utils/useStats';
import { saveGameState, loadGameState } from './utils/statsDb';
import { useDarkMode } from './utils/useDarkMode';

interface DragTarget {
  row: number;
  col: number;
  rect: DOMRect;
}

interface DraggingState {
  source: Coords;
  tileData: CellData;
  origin: { x: number; y: number }; // Fixed position (viewport) where drag started
  startClient: { x: number; y: number }; // Mouse position at start
  width: number;
  height: number;
  targets: DragTarget[]; // Cache valid targets on drag start
}

const App: React.FC = () => {
  const [grid, setGrid] = useState<Grid | null>(null);
  const [solution, setSolution] = useState<string[][] | null>(null);
  const [swaps, setSwaps] = useState<number>(TOTAL_SWAPS);
  const [status, setStatus] = useState<GameStatus>('PLAYING');
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isStatsOpen, setIsStatsOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);
  const [hasRecordedResult, setHasRecordedResult] = useState(false);

  // Stats management
  const { stats, recordResult } = useStats();

  // Dark mode
  const { isDarkMode, toggleDarkMode } = useDarkMode();

  // Custom Drag State
  const [dragging, setDragging] = useState<DraggingState | null>(null);
  const [hoverTarget, setHoverTarget] = useState<Coords | null>(null);

  // Ref for the floating element to update styles directly without re-renders
  const floatingRef = useRef<HTMLDivElement>(null);

  // Initialization - load saved state or start new game
  useEffect(() => {
    const initGame = async () => {
      const puzzleId = getDailySeed();
      const savedState = await loadGameState(puzzleId);

      if (savedState) {
        // Restore saved game state
        setGrid(savedState.grid);
        setSolution(savedState.solution);
        setSwaps(savedState.swaps);
        setStatus(savedState.status);

        // If game was already finished, mark as recorded
        if (savedState.status !== 'PLAYING') {
          setHasRecordedResult(true);
        }
      } else {
        // Start new game
        const puzzle = getDailyPuzzle();
        setSolution(puzzle.solution);
        const initialGrid = generateInitialState(puzzle.solution);
        setGrid(initialGrid);

        // Check if puzzle is already solved (rare edge case)
        if (checkWin(initialGrid)) {
          setStatus('WON');
        }

        // Save initial state
        await saveGameState({
          puzzleId,
          grid: initialGrid,
          swaps: TOTAL_SWAPS,
          status: 'PLAYING',
          solution: puzzle.solution,
        });
      }
    };

    initGame();
  }, []);

  // Record game result when game ends
  useEffect(() => {
    if (status !== 'PLAYING' && !hasRecordedResult) {
      const won = status === 'WON';
      // Stars = swaps remaining (capped at 5)
      const starsEarned = won ? Math.min(5, Math.max(0, swaps)) : 0;
      recordResult(won, starsEarned);
      setHasRecordedResult(true);
    }
  }, [status, swaps, hasRecordedResult, recordResult]);

  // --- Core Game Logic ---

  const performSwap = useCallback(async (from: Coords, to: Coords) => {
    if (!grid || !solution || status !== 'PLAYING') return;

    // Prevent swapping if one is fixed (Green)
    if (grid[from.row][from.col].status === CellStatus.CORRECT) return;
    if (grid[to.row][to.col].status === CellStatus.CORRECT) return;

    // Prevent swapping with self
    if (from.row === to.row && from.col === to.col) {
        return;
    }

    // Create deep copy
    const newGrid = grid.map(r => r.map(c => ({...c})));

    // Swap chars
    const tempChar = newGrid[from.row][from.col].char;
    newGrid[from.row][from.col].char = newGrid[to.row][to.col].char;
    newGrid[to.row][to.col].char = tempChar;

    // Recalculate colors
    const coloredGrid = updateColors(newGrid, solution);
    setGrid(coloredGrid);

    // Update Swaps
    const newSwaps = swaps - 1;
    setSwaps(newSwaps);

    // Check Win or Loss
    const isWin = checkWin(coloredGrid);
    let newStatus: GameStatus = 'PLAYING';
    if (isWin) {
      newStatus = 'WON';
      setStatus('WON');
    } else if (newSwaps <= 0) {
      newStatus = 'LOST';
      setStatus('LOST');
    }

    // Save game state after each move
    const puzzleId = getDailySeed();
    await saveGameState({
      puzzleId,
      grid: coloredGrid,
      swaps: newSwaps,
      status: newStatus,
      solution,
    });
  }, [grid, solution, status, swaps]);

  // --- Pointer Event Handlers (Unified Mouse & Touch) ---

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>, row: number, col: number) => {
    if (status !== 'PLAYING' || !grid || isHelpOpen) return;

    const tile = grid[row][col];
    if (tile.status === CellStatus.CORRECT) return;

    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);

    const rect = e.currentTarget.getBoundingClientRect();

    // Pre-calculate valid targets to avoid layout thrashing during drag
    const validTargets: DragTarget[] = [];
    const tileElements = document.querySelectorAll('[data-waffle-tile]');

    tileElements.forEach(el => {
      const rStr = el.getAttribute('data-row');
      const cStr = el.getAttribute('data-col');
      if (!rStr || !cStr) return;

      const r = parseInt(rStr, 10);
      const c = parseInt(cStr, 10);

      // Don't target self
      if (r === row && c === col) return;

      // Don't target solved tiles
      if (grid[r][c].status === CellStatus.CORRECT) return;

      validTargets.push({
        row: r,
        col: c,
        rect: el.getBoundingClientRect()
      });
    });

    setDragging({
      source: { row, col },
      tileData: tile,
      origin: { x: rect.left, y: rect.top },
      startClient: { x: e.clientX, y: e.clientY },
      width: rect.width,
      height: rect.height,
      targets: validTargets
    });
    setHoverTarget(null);
  };

  // Global Pointer Listeners for Dragging
  useEffect(() => {
    if (!dragging) return;

    const onPointerMove = (e: PointerEvent) => {
      e.preventDefault();

      const dx = e.clientX - dragging.startClient.x;
      const dy = e.clientY - dragging.startClient.y;

      // 1. Move Visual
      if (floatingRef.current) {
        floatingRef.current.style.transform = `translate3d(${dx}px, ${dy}px, 0) scale(1.1)`;
      }

      // 2. Find Drop Target (Intersection Area)
      const dragLeft = dragging.origin.x + dx;
      const dragTop = dragging.origin.y + dy;
      const dragRight = dragLeft + dragging.width;
      const dragBottom = dragTop + dragging.height;

      let maxOverlapArea = 0;
      let bestCandidate: Coords | null = null;

      // We only loop through pre-calculated valid targets
      for (const target of dragging.targets) {
        const tRect = target.rect;

        // Calculate intersection rectangle
        const x_overlap = Math.max(0, Math.min(dragRight, tRect.right) - Math.max(dragLeft, tRect.left));
        const y_overlap = Math.max(0, Math.min(dragBottom, tRect.bottom) - Math.max(dragTop, tRect.top));

        const area = x_overlap * y_overlap;

        if (area > maxOverlapArea) {
          maxOverlapArea = area;
          bestCandidate = { row: target.row, col: target.col };
        }
      }

      // Require a minimum overlap (e.g., 30% of the tile area) to snap
      const threshold = (dragging.width * dragging.height) * 0.3;

      if (bestCandidate && maxOverlapArea > threshold) {
        setHoverTarget(prev =>
          (prev?.row === bestCandidate!.row && prev?.col === bestCandidate!.col)
            ? prev
            : bestCandidate
        );
      } else {
        setHoverTarget(null);
      }
    };

    const onPointerUp = (_e: PointerEvent) => {
      if (hoverTarget) {
          performSwap(dragging.source, hoverTarget);
      }
      setDragging(null);
      setHoverTarget(null);
    };

    window.addEventListener('pointermove', onPointerMove, { passive: false });
    window.addEventListener('pointerup', onPointerUp);

    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    };
  }, [dragging, hoverTarget, performSwap]);

  if (!grid) return <div className="h-screen flex items-center justify-center font-bold text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-900">Се вчитува...</div>;

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 flex flex-col items-center font-sans overflow-x-hidden touch-none pb-10 transition-colors duration-300">
      <Header
        onHelpClick={() => setIsHelpOpen(true)}
        onStatsClick={() => setIsStatsOpen(true)}
        onAboutClick={() => setIsAboutOpen(true)}
        onMenuClick={() => setIsMenuOpen(true)}
      />

      <main className="flex-1 w-full max-w-[600px] flex flex-col items-center px-2 relative">

        <Board
          grid={grid}
          dragSource={dragging?.source || null}
          hoverTarget={hoverTarget}
          onTilePointerDown={handlePointerDown}
          isGameActive={status === 'PLAYING' && !isHelpOpen}
          isGameOver={status === 'LOST'}
        />

        {/* Swaps counter or Game Over banner */}
        <div className="mt-4 mb-4 w-full flex flex-col items-center">
          {status === 'PLAYING' && (
            <div className="text-xl text-gray-700 dark:text-gray-300 tracking-widest font-sans flex items-center px-6 py-3">
              <span className="text-3xl font-black text-gray-800 dark:text-white">{swaps}</span>
              <span className="ml-3 font-bold text-gray-500 dark:text-gray-400 text-sm sm:text-base">
                {swaps === 1 ? 'ПРЕОСТАНАТ ПОТЕГ' : 'ПРЕОСТАНАТИ ПОТЕЗИ'}
              </span>
            </div>
          )}

          {status === 'LOST' && (
            <div className="w-full bg-[#58595b] py-3 text-center animate-in slide-in-from-bottom duration-500">
              <span className="text-white font-black text-xl tracking-wider">КРАЈ НА ИГРАТА</span>
            </div>
          )}

          {status === 'WON' && (
            <div className="w-full bg-[#6aaa64] py-3 text-center animate-in slide-in-from-bottom duration-500">
              <span className="text-white font-black text-xl tracking-wider">БРАВО!</span>
            </div>
          )}
        </div>

        {/* Result details */}
        {status !== 'PLAYING' && (
          <div className="w-full flex justify-center">
            <ResultModal status={status} swapsRemaining={swaps} solution={solution} stats={stats} grid={grid} />
          </div>
        )}

      </main>

      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
      <StatsModal isOpen={isStatsOpen} onClose={() => setIsStatsOpen(false)} stats={stats} />
      <AboutPanel
        isOpen={isAboutOpen}
        onClose={() => setIsAboutOpen(false)}
        onHelpClick={() => setIsHelpOpen(true)}
        onStatsClick={() => setIsStatsOpen(true)}
      />
      <MenuPanel
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        onStatsClick={() => setIsStatsOpen(true)}
        onAboutClick={() => setIsAboutOpen(true)}
        onHelpClick={() => setIsHelpOpen(true)}
        onOptionsClick={() => setIsOptionsOpen(true)}
      />
      <OptionsModal
        isOpen={isOptionsOpen}
        onClose={() => setIsOptionsOpen(false)}
        isDarkMode={isDarkMode}
        onToggleDarkMode={toggleDarkMode}
      />

      {/* Floating Tile Layer */}
      {dragging && (
        <div
          ref={floatingRef}
          className="fixed pointer-events-none z-[200] will-change-transform"
          style={{
            left: dragging.origin.x,
            top: dragging.origin.y,
            width: dragging.width,
            height: dragging.height,
            // Initial transform is handled by CSS mostly, but we set explicit here for consistency
            transform: 'scale(1.1)',
            filter: 'drop-shadow(0 10px 15px rgba(0,0,0,0.3))'
          }}
        >
           <Tile
              data={dragging.tileData}
              row={-1}
              col={-1}
              isDraggingSource={false}
              onPointerDown={() => {}}
              style={{
                width: '100%',
                height: '100%',
              }}
           />
        </div>
      )}
    </div>
  );
};

export default App;