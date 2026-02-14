import { useRef, useEffect, useCallback } from 'react';
import type { BoardState, Position } from '@baduk/shared';
import { GridRenderer } from './renderers/GridRenderer';
import { StoneRenderer } from './renderers/StoneRenderer';
import { MarkerRenderer } from './renderers/MarkerRenderer';
import { pixelToPosition } from '../../utils/board.utils';

interface BoardCanvasProps {
  boardState: BoardState;
  onIntersectionClick: (pos: Position) => boolean;
  soundEnabled?: boolean;
}

export default function BoardCanvas({ boardState, onIntersectionClick, soundEnabled = true }: BoardCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const gridCanvasRef = useRef<HTMLCanvasElement>(null);
  const stoneCanvasRef = useRef<HTMLCanvasElement>(null);
  const markerCanvasRef = useRef<HTMLCanvasElement>(null);

  const gridRendererRef = useRef<GridRenderer | null>(null);
  const stoneRendererRef = useRef<StoneRenderer | null>(null);
  const markerRendererRef = useRef<MarkerRenderer | null>(null);

  const hoverPosRef = useRef<Position | null>(null);
  const animFrameRef = useRef<number>(0);
  const isPlacingRef = useRef(false);

  // Preload sound
  const audioRef = useRef<HTMLAudioElement | null>(null);
  useEffect(() => {
    const audio = new Audio('/assets/sounds/stone-place.mp3');
    audio.preload = 'auto';
    audioRef.current = audio;
  }, []);

  const playStoneSound = useCallback(() => {
    if (!soundEnabled || !audioRef.current) return;
    const audio = audioRef.current;
    audio.currentTime = 0;
    audio.play().catch(() => {});
  }, [soundEnabled]);

  // Initialize renderers
  useEffect(() => {
    if (!gridCanvasRef.current || !stoneCanvasRef.current || !markerCanvasRef.current) return;

    gridRendererRef.current = new GridRenderer(gridCanvasRef.current, boardState.size);
    stoneRendererRef.current = new StoneRenderer(stoneCanvasRef.current);
    markerRendererRef.current = new MarkerRenderer(markerCanvasRef.current);
  }, []);

  // Resize handling
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleResize = () => {
      const rect = container.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;

      gridRendererRef.current?.setSize(boardState.size);
      gridRendererRef.current?.resize(rect.width, rect.height, dpr);
      stoneRendererRef.current?.resize(rect.width, rect.height, dpr);
      markerRendererRef.current?.resize(rect.width, rect.height, dpr);

      const padding = gridRendererRef.current?.gridPadding ?? 0;
      const cellSize = gridRendererRef.current?.gridCellSize ?? 0;
      stoneRendererRef.current?.setMetrics(padding, cellSize);
      markerRendererRef.current?.setMetrics(padding, cellSize);

      gridRendererRef.current?.render();
      stoneRendererRef.current?.render(boardState.grid);
      markerRendererRef.current?.render(
        hoverPosRef.current,
        boardState.lastMove,
        boardState.currentTurn,
        boardState.grid
      );
    };

    const observer = new ResizeObserver(handleResize);
    observer.observe(container);
    handleResize();

    return () => observer.disconnect();
  }, [boardState]);

  // Mouse/touch handlers
  const getPositionFromEvent = useCallback((e: React.MouseEvent | React.TouchEvent): Position | null => {
    const canvas = markerCanvasRef.current;
    if (!canvas || !gridRendererRef.current) return null;

    const rect = canvas.getBoundingClientRect();
    let clientX: number, clientY: number;

    if ('touches' in e) {
      if (e.touches.length === 0) return null;
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const px = clientX - rect.left;
    const py = clientY - rect.top;

    return pixelToPosition(
      px, py,
      gridRendererRef.current.gridPadding,
      gridRendererRef.current.gridCellSize,
      boardState.size
    );
  }, [boardState.size]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const pos = getPositionFromEvent(e);
    hoverPosRef.current = pos;

    cancelAnimationFrame(animFrameRef.current);
    animFrameRef.current = requestAnimationFrame(() => {
      markerRendererRef.current?.render(
        hoverPosRef.current,
        boardState.lastMove,
        boardState.currentTurn,
        boardState.grid
      );
    });
  }, [getPositionFromEvent, boardState]);

  const handleMouseLeave = useCallback(() => {
    hoverPosRef.current = null;
    markerRendererRef.current?.render(null, boardState.lastMove, boardState.currentTurn, boardState.grid);
  }, [boardState]);

  const handleClick = useCallback((e: React.MouseEvent) => {
    // Double-click prevention: 300ms cooldown
    if (isPlacingRef.current) return;

    const pos = getPositionFromEvent(e);
    if (!pos) return;

    isPlacingRef.current = true;
    const placed = onIntersectionClick(pos);
    if (placed) {
      playStoneSound();
    }

    setTimeout(() => {
      isPlacingRef.current = false;
    }, 300);
  }, [getPositionFromEvent, onIntersectionClick, playStoneSound]);

  const handleDoubleClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    if (isPlacingRef.current) return;

    const touch = e.changedTouches[0];
    if (!touch) return;

    const canvas = markerCanvasRef.current;
    if (!canvas || !gridRendererRef.current) return;

    const rect = canvas.getBoundingClientRect();
    const px = touch.clientX - rect.left;
    const py = touch.clientY - rect.top;

    const pos = pixelToPosition(
      px, py,
      gridRendererRef.current.gridPadding,
      gridRendererRef.current.gridCellSize,
      boardState.size
    );

    if (!pos) return;

    isPlacingRef.current = true;
    const placed = onIntersectionClick(pos);
    if (placed) {
      playStoneSound();
    }

    setTimeout(() => {
      isPlacingRef.current = false;
    }, 300);
  }, [onIntersectionClick, playStoneSound, boardState.size]);

  const canvasStyle: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
  };

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        width: '100%',
        aspectRatio: '1',
        maxWidth: '600px',
        maxHeight: '600px',
        cursor: 'pointer',
        touchAction: 'none',
      }}
    >
      <canvas ref={gridCanvasRef} style={{ ...canvasStyle, zIndex: 1 }} />
      <canvas ref={stoneCanvasRef} style={{ ...canvasStyle, zIndex: 2 }} />
      <canvas
        ref={markerCanvasRef}
        style={{ ...canvasStyle, zIndex: 3 }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
        onTouchEnd={handleTouchEnd}
      />
    </div>
  );
}
