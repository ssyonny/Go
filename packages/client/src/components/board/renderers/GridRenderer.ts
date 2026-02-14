import type { BoardSize, Position } from '@baduk/shared';
import { STAR_POINTS } from '@baduk/shared';

export class GridRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private size: BoardSize;
  private cellSize: number = 0;
  private padding: number = 0;

  constructor(canvas: HTMLCanvasElement, size: BoardSize) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', { alpha: false })!;
    this.size = size;
  }

  setSize(size: BoardSize) {
    this.size = size;
  }

  resize(width: number, height: number, dpr: number) {
    const dim = Math.min(width, height);
    this.canvas.width = dim * dpr;
    this.canvas.height = dim * dpr;
    this.canvas.style.width = `${dim}px`;
    this.canvas.style.height = `${dim}px`;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    this.padding = dim * 0.04 + 12;
    this.cellSize = (dim - 2 * this.padding) / (this.size - 1);
  }

  get gridPadding() { return this.padding; }
  get gridCellSize() { return this.cellSize; }

  render() {
    const { ctx, size, padding, cellSize } = this;
    const dim = padding * 2 + cellSize * (size - 1);

    // === Outer frame (gold ornate border) ===
    ctx.fillStyle = '#1a1008';
    ctx.fillRect(0, 0, dim, dim);

    // Gold outer border
    const borderWidth = Math.max(3, dim * 0.006);
    ctx.strokeStyle = '#c9a84c';
    ctx.lineWidth = borderWidth;
    ctx.strokeRect(borderWidth / 2, borderWidth / 2, dim - borderWidth, dim - borderWidth);

    // Inner gold border (double-line frame)
    const innerOffset = borderWidth + Math.max(2, dim * 0.004);
    ctx.strokeStyle = '#a0853a';
    ctx.lineWidth = Math.max(1, dim * 0.002);
    ctx.strokeRect(innerOffset, innerOffset, dim - innerOffset * 2, dim - innerOffset * 2);

    // === Board surface (dark lacquered wood) ===
    const boardMargin = padding * 0.15;
    const boardX = boardMargin;
    const boardY = boardMargin;
    const boardW = dim - boardMargin * 2;
    const boardH = dim - boardMargin * 2;

    // Dark wood gradient
    const woodGradient = ctx.createLinearGradient(boardX, boardY, boardX + boardW, boardY + boardH);
    woodGradient.addColorStop(0, '#2a1f0e');
    woodGradient.addColorStop(0.3, '#1e1609');
    woodGradient.addColorStop(0.5, '#241a0c');
    woodGradient.addColorStop(0.7, '#1c1408');
    woodGradient.addColorStop(1, '#221809');
    ctx.fillStyle = woodGradient;
    ctx.fillRect(boardX, boardY, boardW, boardH);

    // Subtle wood grain texture (horizontal lines with slight opacity variation)
    ctx.globalAlpha = 0.06;
    for (let i = 0; i < dim; i += 3) {
      const wobble = Math.sin(i * 0.05) * 2;
      ctx.beginPath();
      ctx.moveTo(boardX, boardY + i);
      ctx.bezierCurveTo(
        boardX + boardW * 0.3, boardY + i + wobble,
        boardX + boardW * 0.7, boardY + i - wobble,
        boardX + boardW, boardY + i
      );
      ctx.strokeStyle = i % 6 === 0 ? '#c9a84c' : '#000000';
      ctx.lineWidth = 0.5;
      ctx.stroke();
    }
    ctx.globalAlpha = 1;

    // === Corner decorations (gold floral accents) ===
    this.drawCornerDecoration(ctx, dim, borderWidth);

    // === Grid lines (gold) ===
    ctx.strokeStyle = '#c9a84c';
    ctx.lineWidth = Math.max(0.8, cellSize * 0.02);
    ctx.shadowColor = 'rgba(201, 168, 76, 0.15)';
    ctx.shadowBlur = 1;

    for (let i = 0; i < size; i++) {
      const pos = padding + i * cellSize;

      // Vertical lines
      ctx.beginPath();
      ctx.moveTo(pos, padding);
      ctx.lineTo(pos, padding + (size - 1) * cellSize);
      ctx.stroke();

      // Horizontal lines
      ctx.beginPath();
      ctx.moveTo(padding, pos);
      ctx.lineTo(padding + (size - 1) * cellSize, pos);
      ctx.stroke();
    }

    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;

    // Thicker border lines around the grid edge
    ctx.strokeStyle = '#c9a84c';
    ctx.lineWidth = Math.max(1.5, cellSize * 0.04);
    ctx.strokeRect(
      padding, padding,
      (size - 1) * cellSize, (size - 1) * cellSize
    );

    // === Star points (gold) ===
    const starPoints = STAR_POINTS[size];
    const radius = cellSize * 0.13;

    for (const sp of starPoints) {
      const cx = padding + sp.x * cellSize;
      const cy = padding + sp.y * cellSize;

      // Gold glow
      const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius * 2);
      glow.addColorStop(0, 'rgba(201, 168, 76, 0.25)');
      glow.addColorStop(1, 'rgba(201, 168, 76, 0)');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 2, 0, Math.PI * 2);
      ctx.fill();

      // Star point dot
      const starGradient = ctx.createRadialGradient(
        cx - radius * 0.3, cy - radius * 0.3, 0,
        cx, cy, radius
      );
      starGradient.addColorStop(0, '#e0c864');
      starGradient.addColorStop(1, '#a0853a');
      ctx.fillStyle = starGradient;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fill();
    }

    // === Coordinate labels (muted gold) ===
    ctx.fillStyle = '#8a7340';
    ctx.font = `${Math.max(10, cellSize * 0.35)}px serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const letters = 'ABCDEFGHJKLMNOPQRST'; // I is skipped in Go
    for (let i = 0; i < size; i++) {
      const x = padding + i * cellSize;
      // Top
      ctx.fillText(letters[i], x, padding * 0.4);
      // Bottom
      ctx.fillText(letters[i], x, padding + (size - 1) * cellSize + padding * 0.6);

      // Left
      const num = String(size - i);
      ctx.fillText(num, padding * 0.35, padding + i * cellSize);
      // Right
      ctx.fillText(num, padding + (size - 1) * cellSize + padding * 0.65, padding + i * cellSize);
    }
  }

  private drawCornerDecoration(ctx: CanvasRenderingContext2D, dim: number, borderWidth: number) {
    const decoSize = Math.max(12, dim * 0.04);
    const offset = borderWidth + decoSize * 0.4;

    ctx.strokeStyle = '#a0853a';
    ctx.lineWidth = Math.max(1, dim * 0.002);
    ctx.globalAlpha = 0.6;

    // Four corners
    const corners = [
      { x: offset, y: offset, sx: 1, sy: 1 },
      { x: dim - offset, y: offset, sx: -1, sy: 1 },
      { x: offset, y: dim - offset, sx: 1, sy: -1 },
      { x: dim - offset, y: dim - offset, sx: -1, sy: -1 },
    ];

    for (const c of corners) {
      ctx.save();
      ctx.translate(c.x, c.y);
      ctx.scale(c.sx, c.sy);

      // Small ornate corner flourish
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(decoSize * 0.6, decoSize * 0.1, decoSize, 0);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(decoSize * 0.1, decoSize * 0.6, 0, decoSize);
      ctx.stroke();

      // Small diamond accent
      const d = decoSize * 0.2;
      ctx.beginPath();
      ctx.moveTo(d, 0);
      ctx.lineTo(d * 1.5, d * 0.5);
      ctx.lineTo(d, d);
      ctx.lineTo(d * 0.5, d * 0.5);
      ctx.closePath();
      ctx.fillStyle = '#a0853a';
      ctx.fill();

      ctx.restore();
    }

    ctx.globalAlpha = 1;
  }
}
