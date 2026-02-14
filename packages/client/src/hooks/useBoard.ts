import { useState, useCallback } from 'react';
import type { BoardSize, BoardState, Position } from '@baduk/shared';
import { StoneColor } from '@baduk/shared';
import { createEmptyBoard } from '../utils/board.utils';

export function useBoard(initialSize: BoardSize = 19) {
  const [boardState, setBoardState] = useState<BoardState>(() => createEmptyBoard(initialSize));

  const placeStone = useCallback((pos: Position): boolean => {
    let placed = false;
    setBoardState((prev) => {
      if (pos.x < 0 || pos.x >= prev.size || pos.y < 0 || pos.y >= prev.size) return prev;
      if (prev.grid[pos.y][pos.x] !== StoneColor.Empty) return prev;

      const newGrid = prev.grid.map((row) => [...row]);
      newGrid[pos.y][pos.x] = prev.currentTurn;

      placed = true;
      return {
        ...prev,
        grid: newGrid,
        currentTurn: prev.currentTurn === StoneColor.Black ? StoneColor.White : StoneColor.Black,
        lastMove: pos,
        moveCount: prev.moveCount + 1,
      };
    });
    return placed;
  }, []);

  const pass = useCallback(() => {
    setBoardState((prev) => ({
      ...prev,
      currentTurn: prev.currentTurn === StoneColor.Black ? StoneColor.White : StoneColor.Black,
      moveCount: prev.moveCount + 1,
    }));
  }, []);

  const reset = useCallback((size?: BoardSize) => {
    setBoardState((prev) => createEmptyBoard(size ?? prev.size));
  }, []);

  const changeBoardSize = useCallback((size: BoardSize) => {
    setBoardState(createEmptyBoard(size));
  }, []);

  return { boardState, placeStone, pass, reset, changeBoardSize };
}
