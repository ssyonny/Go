import { useState, useCallback, useRef } from 'react';
import type { BoardSize, BoardState, Position } from '@baduk/shared';
import { StoneColor } from '@baduk/shared';
import { createEmptyBoard } from '../utils/board.utils';

export function useBoard(initialSize: BoardSize = 19) {
  const [boardState, setBoardState] = useState<BoardState>(() => createEmptyBoard(initialSize));
  const boardStateRef = useRef<BoardState>(boardState);

  // boardStateRef를 항상 최신 상태로 유지
  boardStateRef.current = boardState;

  const placeStone = useCallback((pos: Position): boolean => {
    const prev = boardStateRef.current;

    // 동기적으로 유효성 검사
    if (pos.x < 0 || pos.x >= prev.size || pos.y < 0 || pos.y >= prev.size) return false;
    if (prev.grid[pos.y][pos.x] !== StoneColor.Empty) return false;

    const newGrid = prev.grid.map((row) => [...row]);
    newGrid[pos.y][pos.x] = prev.currentTurn;

    const newState: BoardState = {
      ...prev,
      grid: newGrid,
      currentTurn: prev.currentTurn === StoneColor.Black ? StoneColor.White : StoneColor.Black,
      lastMove: pos,
      moveCount: prev.moveCount + 1,
    };

    boardStateRef.current = newState;
    setBoardState(newState);
    return true;
  }, []);

  const pass = useCallback(() => {
    const prev = boardStateRef.current;
    const newState: BoardState = {
      ...prev,
      currentTurn: prev.currentTurn === StoneColor.Black ? StoneColor.White : StoneColor.Black,
      moveCount: prev.moveCount + 1,
    };
    boardStateRef.current = newState;
    setBoardState(newState);
  }, []);

  const reset = useCallback((size?: BoardSize) => {
    const prev = boardStateRef.current;
    const newState = createEmptyBoard(size ?? prev.size);
    boardStateRef.current = newState;
    setBoardState(newState);
  }, []);

  const changeBoardSize = useCallback((size: BoardSize) => {
    const newState = createEmptyBoard(size);
    boardStateRef.current = newState;
    setBoardState(newState);
  }, []);

  return { boardState, boardStateRef, placeStone, pass, reset, changeBoardSize };
}
