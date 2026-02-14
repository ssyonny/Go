import { BoardSize, Position } from '../types/board.types';

export const BOARD_SIZES: BoardSize[] = [9, 13, 19];

export const STAR_POINTS: Record<BoardSize, Position[]> = {
  9: [
    { x: 2, y: 2 }, { x: 6, y: 2 },
    { x: 2, y: 6 }, { x: 6, y: 6 },
    { x: 4, y: 4 },
  ],
  13: [
    { x: 3, y: 3 }, { x: 9, y: 3 },
    { x: 3, y: 9 }, { x: 9, y: 9 },
    { x: 6, y: 6 },
    { x: 3, y: 6 }, { x: 9, y: 6 },
    { x: 6, y: 3 }, { x: 6, y: 9 },
  ],
  19: [
    { x: 3, y: 3 },  { x: 9, y: 3 },  { x: 15, y: 3 },
    { x: 3, y: 9 },  { x: 9, y: 9 },  { x: 15, y: 9 },
    { x: 3, y: 15 }, { x: 9, y: 15 }, { x: 15, y: 15 },
  ],
};

export const KOMI = 6.5;
