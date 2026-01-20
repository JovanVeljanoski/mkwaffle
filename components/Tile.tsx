import React from 'react';
import { CellData, CellStatus } from '../types';
import { COLORS } from '../constants';

interface TileProps {
  data: CellData;
  row: number;
  col: number;
  isDraggingSource: boolean;
  isHoverTarget?: boolean;
  disabled?: boolean;
  isGameOver?: boolean;
  onPointerDown: (e: React.PointerEvent<HTMLDivElement>, row: number, col: number) => void;
  style?: React.CSSProperties;
}

const Tile: React.FC<TileProps> = React.memo(({
  data,
  row,
  col,
  isDraggingSource,
  isHoverTarget,
  disabled,
  isGameOver,
  onPointerDown,
  style
}) => {
  if (data.status === CellStatus.NONE) {
    return <div className="w-full h-full" />; // Empty spacer
  }

  // Game over: all tiles turn dark
  let colorClass = COLORS.GRAY;
  if (isGameOver) {
    colorClass = COLORS.DARK;
  } else if (data.status === CellStatus.CORRECT) {
    colorClass = COLORS.GREEN;
  } else if (data.status === CellStatus.PRESENT) {
    colorClass = COLORS.YELLOW;
  }

  // Base classes for the tile
  // Updated sizes: w-[3.8rem] (~60px) for mobile, sm:w-20 (80px) for larger screens
  const baseClasses = `
    relative w-[3.8rem] h-[3.8rem] sm:w-20 sm:h-20
    flex items-center justify-center
    text-3xl sm:text-5xl font-bold
    rounded-lg select-none
    border-b-[4px] sm:border-b-[6px]
    transition-all duration-500 ease-in-out
    touch-none
  `;

  // Cursor logic
  const cursorClass = disabled || data.status === CellStatus.CORRECT
    ? 'cursor-default'
    : 'cursor-grab active:cursor-grabbing';

  // Visual state
  let stateClass = '';

  if (isDraggingSource) {
      // The original tile spot when being dragged
      stateClass = 'opacity-20';
  } else if (isHoverTarget) {
      // When a valid tile is being hovered over
      stateClass = 'scale-110 z-10 shadow-inner ring-4 ring-green-400 ring-opacity-50 brightness-95';
  } else if (!disabled && data.status !== CellStatus.CORRECT) {
      // Normal interactive state
      stateClass = 'hover:scale-105 hover:brightness-105 active:scale-95';
  }

  const isInteractive = !disabled && data.status !== CellStatus.CORRECT;

  return (
    <div
      data-waffle-tile
      data-row={row}
      data-col={col}
      onPointerDown={(e) => isInteractive && onPointerDown(e, row, col)}
      style={style}
      className={`
        ${baseClasses}
        ${colorClass}
        ${stateClass}
        ${cursorClass}
      `}
    >
      {data.char}
    </div>
  );
});

Tile.displayName = 'Tile';

export default Tile;