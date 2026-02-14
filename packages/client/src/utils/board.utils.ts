import type { BoardSize, BoardState, Position } from '@baduk/shared';
import { StoneColor } from '@baduk/shared';

export function createEmptyBoard(size: BoardSize): BoardState {
  const grid: StoneColor[][] = Array.from({ length: size }, () =>
    Array.from({ length: size }, () => StoneColor.Empty)
  );

  return {
    size,
    grid,
    currentTurn: StoneColor.Black,
    capturedBlack: 0,
    capturedWhite: 0,
    lastMove: null,
    moveCount: 0,
  };
}

export function pixelToPosition(
  px: number,
  py: number,
  padding: number,
  cellSize: number,
  boardSize: number
): Position | null {
  const x = Math.round((px - padding) / cellSize);
  const y = Math.round((py - padding) / cellSize);

  if (x < 0 || x >= boardSize || y < 0 || y >= boardSize) return null;

  const centerX = padding + x * cellSize;
  const centerY = padding + y * cellSize;
  const distance = Math.sqrt((px - centerX) ** 2 + (py - centerY) ** 2);

  if (distance > cellSize * 0.45) return null;

  return { x, y };
}

export function positionToPixel(
  pos: Position,
  padding: number,
  cellSize: number
): { x: number; y: number } {
  return {
    x: padding + pos.x * cellSize,
    y: padding + pos.y * cellSize,
  };
}
