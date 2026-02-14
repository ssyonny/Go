export type BoardSize = 9 | 13 | 19;

export enum StoneColor {
  Empty = 0,
  Black = 1,
  White = 2,
}

export interface Position {
  x: number;
  y: number;
}

export interface BoardState {
  size: BoardSize;
  grid: StoneColor[][];
  currentTurn: StoneColor.Black | StoneColor.White;
  capturedBlack: number;
  capturedWhite: number;
  lastMove: Position | null;
  moveCount: number;
}
