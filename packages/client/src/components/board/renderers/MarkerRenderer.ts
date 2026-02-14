import type { Position } from '@baduk/shared';
import { StoneColor } from '@baduk/shared';

export class MarkerRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private cellSize: number = 0;
  private padding: number = 0;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
  }

  resize(width: number, height: number, dpr: number) {
    const dim = Math.min(width, height);
    this.canvas.width = dim * dpr;
    this.canvas.height = dim * dpr;
    this.canvas.style.width = `${dim}px`;
    this.canvas.style.height = `${dim}px`;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  setMetrics(padding: number, cellSize: number) {
    this.padding = padding;
    this.cellSize = cellSize;
  }

  render(
    hoverPos: Position | null,
    lastMove: Position | null,
    currentTurn: StoneColor.Black | StoneColor.White,
    grid: StoneColor[][]
  ) {
    const { ctx, padding, cellSize } = this;
    const dim = parseFloat(this.canvas.style.width);
    ctx.clearRect(0, 0, dim, dim);

    const stoneRadius = cellSize * 0.43;

    // Hover preview
    if (hoverPos && grid[hoverPos.y]?.[hoverPos.x] === StoneColor.Empty) {
      const cx = padding + hoverPos.x * cellSize;
      const cy = padding + hoverPos.y * cellSize;

      ctx.beginPath();
      ctx.arc(cx, cy, stoneRadius, 0, Math.PI * 2);
      ctx.fillStyle = currentTurn === StoneColor.Black
        ? 'rgba(0, 0, 0, 0.4)'
        : 'rgba(255, 255, 255, 0.45)';
      ctx.fill();

      ctx.strokeStyle = currentTurn === StoneColor.Black
        ? 'rgba(201, 168, 76, 0.3)'
        : 'rgba(201, 168, 76, 0.25)';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // Last move marker
    if (lastMove) {
      const cx = padding + lastMove.x * cellSize;
      const cy = padding + lastMove.y * cellSize;
      const markerRadius = cellSize * 0.15;
      const stoneColor = grid[lastMove.y]?.[lastMove.x];

      ctx.beginPath();
      ctx.arc(cx, cy, markerRadius, 0, Math.PI * 2);
      ctx.fillStyle = stoneColor === StoneColor.Black
        ? 'rgba(255, 255, 255, 0.8)'
        : 'rgba(0, 0, 0, 0.6)';
      ctx.fill();
    }
  }
}
