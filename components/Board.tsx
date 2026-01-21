import React, { memo } from 'react';
import Tile from './Tile';
import { Grid, Coords } from '../types';

interface BoardProps {
  grid: Grid;
  dragSource: Coords | null;
  swapping?: { from: Coords; to: Coords } | null;
  onTilePointerDown: (e: React.PointerEvent<HTMLDivElement>, row: number, col: number) => void;
  isGameActive: boolean;
  isGameOver?: boolean;
}

// Custom comparison for Board - compare coordinates by value, not reference
const areBoardPropsEqual = (prevProps: BoardProps, nextProps: BoardProps): boolean => {
  const prevDrag = prevProps.dragSource;
  const nextDrag = nextProps.dragSource;
  if (prevDrag?.row !== nextDrag?.row || prevDrag?.col !== nextDrag?.col) return false;

  const prevSwap = prevProps.swapping;
  const nextSwap = nextProps.swapping;
  if (prevSwap?.from.row !== nextSwap?.from.row || prevSwap?.from.col !== nextSwap?.from.col) return false;
  if (prevSwap?.to.row !== nextSwap?.to.row || prevSwap?.to.col !== nextSwap?.to.col) return false;

  if (prevProps.isGameActive !== nextProps.isGameActive) return false;
  if (prevProps.isGameOver !== nextProps.isGameOver) return false;

  const prevGrid = prevProps.grid;
  const nextGrid = nextProps.grid;
  if (prevGrid !== nextGrid) {
    for (let r = 0; r < prevGrid.length; r++) {
      for (let c = 0; c < prevGrid[r].length; c++) {
        if (prevGrid[r][c].char !== nextGrid[r][c].char) return false;
        if (prevGrid[r][c].status !== nextGrid[r][c].status) return false;
      }
    }
  }
  return true;
};

const Board: React.FC<BoardProps> = memo(({
  grid,
  dragSource,
  swapping,
  onTilePointerDown,
  isGameActive,
  isGameOver = false
}) => {
  const touchClass = isGameActive ? 'touch-none' : '';

  return (
    <div className={`grid grid-cols-5 gap-1.5 sm:gap-2 p-1 rounded-xl select-none ${touchClass}`}>
      {grid.map((row, rIndex) => (
        <React.Fragment key={rIndex}>
          {row.map((cell, cIndex) => {
            const isSwapping = (swapping?.from.row === rIndex && swapping?.from.col === cIndex) ||
                              (swapping?.to.row === rIndex && swapping?.to.col === cIndex);

            return (
              <Tile
                key={`${rIndex}-${cIndex}`}
                data={cell}
                row={rIndex}
                col={cIndex}
                isDraggingSource={(dragSource?.row === rIndex && dragSource?.col === cIndex) || isSwapping}
                noTransition={isSwapping}
                onPointerDown={onTilePointerDown}
                disabled={!isGameActive}
                isGameOver={isGameOver}
              />
            );
          })}
        </React.Fragment>
      ))}
    </div>
  );
}, areBoardPropsEqual);

Board.displayName = 'Board';

export default Board;