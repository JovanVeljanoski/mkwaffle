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
  origin: { x: number; y: number };
  startClient: { x: number; y: number };
  width: number;
  height: number;
  targets: DragTarget[];
}

interface SwappingState {
  from: Coords;
  to: Coords;
  fromRect: { x: number; y: number; width: number; height: number };
  toRect: { x: number; y: number; width: number; height: number };
  fromData: CellData;
  toData: CellData;
  futureFromStatus: CellStatus;
  futureToStatus: CellStatus;
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

  const { stats, recordResult } = useStats();
  const { isDarkMode, toggleDarkMode } = useDarkMode();

  const [dragging, setDragging] = useState<DraggingState | null>(null);
  const [swapping, setSwapping] = useState<SwappingState | null>(null);
  const hoverTargetRef = useRef<Coords | null>(null);
  const floatingRef = useRef<HTMLDivElement>(null);

  // Memoized callbacks for Header to prevent unnecessary re-renders
  const openHelp = useCallback(() => setIsHelpOpen(true), []);
  const openStats = useCallback(() => setIsStatsOpen(true), []);
  const openAbout = useCallback(() => setIsAboutOpen(true), []);
  const openMenu = useCallback(() => setIsMenuOpen(true), []);
  const closeHelp = useCallback(() => setIsHelpOpen(false), []);
  const closeStats = useCallback(() => setIsStatsOpen(false), []);
  const closeAbout = useCallback(() => setIsAboutOpen(false), []);
  const closeMenu = useCallback(() => setIsMenuOpen(false), []);
  const openOptions = useCallback(() => setIsOptionsOpen(true), []);
  const closeOptions = useCallback(() => setIsOptionsOpen(false), []);

  // Stable noop for floating tile
  const noop = useCallback(() => {}, []);

  useEffect(() => {
    const initGame = async () => {
      const puzzleId = getDailySeed();
      const savedState = await loadGameState(puzzleId);

      if (savedState) {
        setGrid(savedState.grid);
        setSolution(savedState.solution);
        setSwaps(savedState.swaps);
        setStatus(savedState.status);

        if (savedState.status !== 'PLAYING') {
          setHasRecordedResult(true);
        }
      } else {
        const puzzle = getDailyPuzzle();
        setSolution(puzzle.solution);
        const initialGrid = generateInitialState(puzzle.solution);
        setGrid(initialGrid);

        if (checkWin(initialGrid)) {
          setStatus('WON');
        }

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

  useEffect(() => {
    if (status !== 'PLAYING' && !hasRecordedResult) {
      const won = status === 'WON';
      const starsEarned = won ? Math.min(5, Math.max(0, swaps)) : 0;
      recordResult(won, starsEarned);
      setHasRecordedResult(true);
    }
  }, [status, swaps, hasRecordedResult, recordResult]);

  const performSwap = useCallback(async (from: Coords, to: Coords) => {
    if (!grid || !solution || status !== 'PLAYING') return;
    if (grid[from.row][from.col].status === CellStatus.CORRECT) return;
    if (grid[to.row][to.col].status === CellStatus.CORRECT) return;
    if (from.row === to.row && from.col === to.col) return;

    const newGrid = grid.map(r => r.map(c => ({...c})));

    const tempChar = newGrid[from.row][from.col].char;
    newGrid[from.row][from.col].char = newGrid[to.row][to.col].char;
    newGrid[to.row][to.col].char = tempChar;

    const coloredGrid = updateColors(newGrid, solution);
    setGrid(coloredGrid);

    const newSwaps = swaps - 1;
    setSwaps(newSwaps);

    const isWin = checkWin(coloredGrid);
    let newStatus: GameStatus = 'PLAYING';
    if (isWin) {
      newStatus = 'WON';
      setStatus('WON');
    } else if (newSwaps <= 0) {
      newStatus = 'LOST';
      setStatus('LOST');
    }

    const puzzleId = getDailySeed();
    await saveGameState({
      puzzleId,
      grid: coloredGrid,
      swaps: newSwaps,
      status: newStatus,
      solution,
    });
  }, [grid, solution, status, swaps]);

  const handlePointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>, row: number, col: number) => {
    if (status !== 'PLAYING' || !grid || isHelpOpen) return;

    const tile = grid[row][col];
    if (tile.status === CellStatus.CORRECT) return;

    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);

    const rect = e.currentTarget.getBoundingClientRect();

    const validTargets: DragTarget[] = [];
    const tileElements = document.querySelectorAll('[data-waffle-tile]');

    tileElements.forEach(el => {
      const rStr = el.getAttribute('data-row');
      const cStr = el.getAttribute('data-col');
      if (!rStr || !cStr) return;

      const r = parseInt(rStr, 10);
      const c = parseInt(cStr, 10);

      if (r === row && c === col) return;
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
    hoverTargetRef.current = null;
  }, [status, grid, isHelpOpen]);

  useEffect(() => {
    if (!dragging) return;

    const onPointerMove = (e: PointerEvent) => {
      e.preventDefault();

      const dx = e.clientX - dragging.startClient.x;
      const dy = e.clientY - dragging.startClient.y;

      if (floatingRef.current) {
        floatingRef.current.style.transform = `translate3d(${dx}px, ${dy}px, 0) scale(1.1)`;
      }

      const dragLeft = dragging.origin.x + dx;
      const dragTop = dragging.origin.y + dy;
      const dragRight = dragLeft + dragging.width;
      const dragBottom = dragTop + dragging.height;

      let maxOverlapArea = 0;
      let bestCandidate: Coords | null = null;

      for (const target of dragging.targets) {
        const tRect = target.rect;
        const x_overlap = Math.max(0, Math.min(dragRight, tRect.right) - Math.max(dragLeft, tRect.left));
        const y_overlap = Math.max(0, Math.min(dragBottom, tRect.bottom) - Math.max(dragTop, tRect.top));
        const area = x_overlap * y_overlap;

        if (area > maxOverlapArea) {
          maxOverlapArea = area;
          bestCandidate = { row: target.row, col: target.col };
        }
      }

      const threshold = (dragging.width * dragging.height) * 0.3;

      if (bestCandidate && maxOverlapArea > threshold) {
        hoverTargetRef.current = bestCandidate;
      } else {
        hoverTargetRef.current = null;
      }
    };

    const onPointerUp = () => {
      if (hoverTargetRef.current && grid) {
        const target = hoverTargetRef.current;
        const targetElement = dragging.targets.find(t => t.row === target.row && t.col === target.col);

        if (targetElement && solution) {
          const newGrid = grid.map(r => r.map(c => ({ ...c })));
          const tempChar = newGrid[dragging.source.row][dragging.source.col].char;
          newGrid[dragging.source.row][dragging.source.col].char = newGrid[target.row][target.col].char;
          newGrid[target.row][target.col].char = tempChar;
          const coloredGrid = updateColors(newGrid, solution);

          setSwapping({
            from: dragging.source,
            to: target,
            fromRect: { x: dragging.origin.x, y: dragging.origin.y, width: dragging.width, height: dragging.height },
            toRect: { x: targetElement.rect.left, y: targetElement.rect.top, width: targetElement.rect.width, height: targetElement.rect.height },
            fromData: dragging.tileData,
            toData: grid[target.row][target.col],
            futureFromStatus: coloredGrid[dragging.source.row][dragging.source.col].status,
            futureToStatus: coloredGrid[target.row][target.col].status
          });

          setTimeout(() => {
            performSwap(dragging.source, target);
            requestAnimationFrame(() => {
              requestAnimationFrame(() => {
                setSwapping(null);
              });
            });
          }, 195);
        }
      }
      setDragging(null);
      hoverTargetRef.current = null;
    };

    window.addEventListener('pointermove', onPointerMove, { passive: false });
    window.addEventListener('pointerup', onPointerUp);

    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    };
  }, [dragging, grid, performSwap, solution]);

  if (!grid) {
    return (
      <div className="h-screen flex items-center justify-center font-bold text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-900">
        Се вчитува...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 flex flex-col items-center font-sans overflow-x-hidden overscroll-none pb-10 transition-colors duration-300">
      <Header
        onHelpClick={openHelp}
        onStatsClick={openStats}
        onAboutClick={openAbout}
        onMenuClick={openMenu}
      />

      <main className="flex-1 w-full max-w-[600px] flex flex-col items-center px-2 relative">
        <Board
          grid={grid}
          dragSource={dragging?.source || null}
          swapping={swapping}
          onTilePointerDown={handlePointerDown}
          isGameActive={status === 'PLAYING' && !isHelpOpen}
          isGameOver={status === 'LOST'}
        />

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

        {status !== 'PLAYING' && (
          <div className="w-full flex justify-center">
            <ResultModal status={status} swapsRemaining={swaps} solution={solution} stats={stats} grid={grid} />
          </div>
        )}
      </main>

      <HelpModal isOpen={isHelpOpen} onClose={closeHelp} />
      <StatsModal isOpen={isStatsOpen} onClose={closeStats} stats={stats} />
      <AboutPanel
        isOpen={isAboutOpen}
        onClose={closeAbout}
        onHelpClick={openHelp}
        onStatsClick={openStats}
      />
      <MenuPanel
        isOpen={isMenuOpen}
        onClose={closeMenu}
        onStatsClick={openStats}
        onAboutClick={openAbout}
        onHelpClick={openHelp}
        onOptionsClick={openOptions}
      />
      <OptionsModal
        isOpen={isOptionsOpen}
        onClose={closeOptions}
        isDarkMode={isDarkMode}
        onToggleDarkMode={toggleDarkMode}
      />

      {dragging && (
        <div
          ref={floatingRef}
          className="fixed pointer-events-none z-[200] will-change-transform"
          style={{
            left: dragging.origin.x,
            top: dragging.origin.y,
            width: dragging.width,
            height: dragging.height,
            transform: 'scale(1.1)',
            filter: 'drop-shadow(0 10px 15px rgba(0,0,0,0.3))'
          }}
        >
          <Tile
            data={dragging.tileData}
            row={-1}
            col={-1}
            isDraggingSource={false}
            onPointerDown={noop}
            style={{ width: '100%', height: '100%' }}
          />
        </div>
      )}
      {swapping && (
        <div className="fixed inset-0 pointer-events-none z-[300]">
          <div
            className="absolute transition-all duration-200 ease-in-out"
            style={{
              left: swapping.toRect.x,
              top: swapping.toRect.y,
              width: swapping.toRect.width,
              height: swapping.toRect.height,
              transform: 'scale(1)',
              animation: 'fly-from-source 200ms ease-in-out forwards'
            }}
          >
            <Tile
              data={{ ...swapping.fromData, status: swapping.futureToStatus }}
              row={-1}
              col={-1}
              isDraggingSource={false}
              onPointerDown={noop}
              style={{ width: '100%', height: '100%' }}
            />
          </div>

          <div
            className="absolute transition-all duration-200 ease-in-out"
            style={{
              left: swapping.fromRect.x,
              top: swapping.fromRect.y,
              width: swapping.fromRect.width,
              height: swapping.fromRect.height,
              animation: 'fly-from-target 200ms ease-in-out forwards'
            }}
          >
            <Tile
              data={{ ...swapping.toData, status: swapping.futureFromStatus }}
              row={-1}
              col={-1}
              isDraggingSource={false}
              onPointerDown={noop}
              style={{ width: '100%', height: '100%' }}
            />
          </div>

          <style>{`
            @keyframes fly-from-source {
              0% {
                transform: translate(${swapping.fromRect.x - swapping.toRect.x}px, ${swapping.fromRect.y - swapping.toRect.y}px) scale(1.1);
                filter: drop-shadow(0 10px 15px rgba(0,0,0,0.3));
              }
              100% {
                transform: translate(0, 0) scale(1);
                filter: drop-shadow(0 0px 0px rgba(0,0,0,0));
              }
            }
            @keyframes fly-from-target {
              0% { transform: translate(${swapping.toRect.x - swapping.fromRect.x}px, ${swapping.toRect.y - swapping.fromRect.y}px); }
              100% { transform: translate(0, 0); }
            }
          `}</style>
        </div>
      )}
    </div>
  );
};

export default App;
