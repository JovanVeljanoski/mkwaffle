import React from 'react';
import { CellData, CellStatus } from '../types';
import { COLORS } from '../constants';

interface TileProps {
  data: CellData;
  row: number;
  col: number;
  isDraggingSource: boolean;
  disabled?: boolean;
  isGameOver?: boolean;
  noTransition?: boolean;
  onPointerDown: (e: React.PointerEvent<HTMLDivElement>, row: number, col: number) => void;
  style?: React.CSSProperties;
}

// Custom comparison to prevent unnecessary re-renders
const areTilePropsEqual = (prevProps: TileProps, nextProps: TileProps): boolean => {
  if (prevProps.row !== nextProps.row) return false;
  if (prevProps.col !== nextProps.col) return false;
  if (prevProps.isDraggingSource !== nextProps.isDraggingSource) return false;
  if (prevProps.disabled !== nextProps.disabled) return false;
  if (prevProps.isGameOver !== nextProps.isGameOver) return false;
  if (prevProps.noTransition !== nextProps.noTransition) return false;
  if (prevProps.data.char !== nextProps.data.char) return false;
  if (prevProps.data.status !== nextProps.data.status) return false;

  if (prevProps.style !== nextProps.style) {
    if (!prevProps.style || !nextProps.style) return false;
    const prevKeys = Object.keys(prevProps.style);
    const nextKeys = Object.keys(nextProps.style);
    if (prevKeys.length !== nextKeys.length) return false;
    for (const key of prevKeys) {
      if ((prevProps.style as Record<string, unknown>)[key] !== (nextProps.style as Record<string, unknown>)[key]) return false;
    }
  }
  return true;
};

const Tile: React.FC<TileProps> = React.memo(({
  data,
  row,
  col,
  isDraggingSource,
  disabled,
  isGameOver,
  noTransition,
  onPointerDown,
  style
}) => {
  if (data.status === CellStatus.NONE) {
    return <div className="w-full h-full" />;
  }

  let colorClass = COLORS.GRAY;
  if (isGameOver) {
    colorClass = COLORS.DARK;
  } else if (data.status === CellStatus.CORRECT) {
    colorClass = COLORS.GREEN;
  } else if (data.status === CellStatus.PRESENT) {
    colorClass = COLORS.YELLOW;
  }

  const isInteractive = !disabled && data.status !== CellStatus.CORRECT;
  const transitionClass = noTransition ? '' : 'transition-[background-color,border-color] duration-200 ease-in-out';
  const baseClasses = `
    relative w-[3.8rem] h-[3.8rem] sm:w-20 sm:h-20
    flex items-center justify-center
    text-3xl sm:text-5xl font-bold
    rounded-lg select-none
    border-b-[4px] sm:border-b-[6px]
    ${transitionClass}
    ${isInteractive ? 'touch-none' : ''}
  `;

  const cursorClass = disabled || data.status === CellStatus.CORRECT
    ? 'cursor-default'
    : 'cursor-grab active:cursor-grabbing';

  let stateClass = '';
  if (isDraggingSource) {
      stateClass = 'opacity-20';
  }

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
}, areTilePropsEqual);

Tile.displayName = 'Tile';

export default Tile;