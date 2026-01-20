import React from 'react';
import Tile from './Tile';
import { Grid, Coords } from '../types';

interface BoardProps {
  grid: Grid;
  dragSource: Coords | null;
  hoverTarget: Coords | null;
  onTilePointerDown: (e: React.PointerEvent<HTMLDivElement>, row: number, col: number) => void;
  isGameActive: boolean;
  isGameOver?: boolean;
}

const Board: React.FC<BoardProps> = ({
  grid,
  dragSource,
  hoverTarget,
  onTilePointerDown,
  isGameActive,
  isGameOver = false
}) => {
  // Only disable touch on the board during active gameplay (to allow drag without scroll)
  // After game ends, allow normal touch interactions
  const touchClass = isGameActive ? 'touch-none' : '';

  return (
    // Reduced gap from gap-2/gap-3 to gap-1.5/gap-2 for a tighter look
    <div className={`grid grid-cols-5 gap-1.5 sm:gap-2 p-1 rounded-xl select-none ${touchClass}`}>
      {grid.map((row, rIndex) => (
        <React.Fragment key={rIndex}>
          {row.map((cell, cIndex) => (
            <Tile
              key={`${rIndex}-${cIndex}`}
              data={cell}
              row={rIndex}
              col={cIndex}
              isDraggingSource={dragSource?.row === rIndex && dragSource?.col === cIndex}
              isHoverTarget={hoverTarget?.row === rIndex && hoverTarget?.col === cIndex}
              onPointerDown={onTilePointerDown}
              disabled={!isGameActive}
              isGameOver={isGameOver}
            />
          ))}
        </React.Fragment>
      ))}
    </div>
  );
};

export default Board;