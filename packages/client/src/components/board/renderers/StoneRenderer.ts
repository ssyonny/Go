import { StoneColor } from '@baduk/shared';

export class StoneRenderer {
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

  render(grid: StoneColor[][]) {
    const { ctx, padding, cellSize } = this;
    const dim = parseFloat(this.canvas.style.width);
    ctx.clearRect(0, 0, dim, dim);

    const stoneRadius = cellSize * 0.43;

    for (let y = 0; y < grid.length; y++) {
      for (let x = 0; x < grid[y].length; x++) {
        const color = grid[y][x];
        if (color === StoneColor.Empty) continue;

        const cx = padding + x * cellSize;
        const cy = padding + y * cellSize;

        // Shadow
        ctx.beginPath();
        ctx.arc(cx + 2, cy + 2, stoneRadius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.fill();

        // Stone
        const gradient = ctx.createRadialGradient(
          cx - stoneRadius * 0.3,
          cy - stoneRadius * 0.3,
          stoneRadius * 0.1,
          cx,
          cy,
          stoneRadius
        );

        if (color === StoneColor.Black) {
          gradient.addColorStop(0, '#4a4a4a');
          gradient.addColorStop(1, '#0a0a0a');
        } else {
          gradient.addColorStop(0, '#ffffff');
          gradient.addColorStop(1, '#c8c8c8');
        }

        ctx.beginPath();
        ctx.arc(cx, cy, stoneRadius, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
      }
    }
  }
}
