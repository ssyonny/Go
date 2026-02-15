import { useState, useRef, useEffect, useCallback } from 'react';
import { useBoard } from '../../hooks/useBoard';
import BoardCanvas from './BoardCanvas';
import BoardControls from './BoardControls';
import BoardInfo from './BoardInfo';
import { StoneColor } from '@baduk/shared';
import type { Position } from '@baduk/shared';

interface GameState {
  gameType: 'ai' | 'pvp' | 'free';
  difficulty?: 'easy' | 'normal' | 'hard';
  boardSize?: number;
}

interface GoBoardProps {
  gameState?: GameState;
}

export default function GoBoard({ gameState }: GoBoardProps) {
  const initialBoardSize = (gameState?.boardSize || 19) as 9 | 13 | 19;
  const [isAIThinking, setIsAIThinking] = useState(false);
  const aiTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isAIThinkingRef = useRef(false);

  const { boardState, boardStateRef, placeStone, pass, reset, changeBoardSize } = useBoard(initialBoardSize);

  const clearAITimeout = useCallback(() => {
    if (aiTimeoutRef.current) {
      clearTimeout(aiTimeoutRef.current);
      aiTimeoutRef.current = null;
    }
    isAIThinkingRef.current = false;
    setIsAIThinking(false);
  }, []);

  const executeAIMove = useCallback(() => {
    // 착수 시점에 최신 보드 상태를 읽음 (stale closure 방지)
    const current = boardStateRef.current;

    // AI 차례가 아니면 무시 (리셋 등으로 상태가 바뀐 경우)
    if (current.currentTurn !== StoneColor.White) {
      clearAITimeout();
      return;
    }

    // 빈 자리 목록 수집
    const emptyPositions: Position[] = [];
    for (let y = 0; y < current.size; y++) {
      for (let x = 0; x < current.size; x++) {
        if (current.grid[y][x] === StoneColor.Empty) {
          emptyPositions.push({ x, y });
        }
      }
    }

    if (emptyPositions.length === 0) {
      pass();
    } else {
      // 빈 자리 중 랜덤 선택
      const idx = Math.floor(Math.random() * emptyPositions.length);
      const pos = emptyPositions[idx];
      const placed = placeStone(pos);

      if (!placed) {
        // 혹시 실패하면 패스
        pass();
      }
    }

    isAIThinkingRef.current = false;
    setIsAIThinking(false);
    aiTimeoutRef.current = null;
  }, [boardStateRef, placeStone, pass, clearAITimeout]);

  // AI 차례 감지 및 착수 예약
  useEffect(() => {
    if (gameState?.gameType !== 'ai') return;
    if (boardState.currentTurn !== StoneColor.White) return;
    if (isAIThinkingRef.current) return;

    // AI 착수 예약
    isAIThinkingRef.current = true;
    setIsAIThinking(true);

    aiTimeoutRef.current = setTimeout(executeAIMove, 1500);

    return () => {
      // 이 effect가 재실행되거나 언마운트될 때 정리
      if (aiTimeoutRef.current) {
        clearTimeout(aiTimeoutRef.current);
        aiTimeoutRef.current = null;
      }
    };
  }, [gameState?.gameType, boardState.moveCount]);

  // 리셋/사이즈 변경 시 AI timeout 정리
  const handleReset = useCallback(() => {
    clearAITimeout();
    reset();
  }, [clearAITimeout, reset]);

  const handleBoardSizeChange = useCallback((size: 9 | 13 | 19) => {
    clearAITimeout();
    changeBoardSize(size);
  }, [clearAITimeout, changeBoardSize]);

  const handlePlaceStone = useCallback((pos: Position): boolean => {
    if (gameState?.gameType === 'ai') {
      // AI 게임일 때는 흑(플레이어) 차례에만 착수 허용
      if (boardStateRef.current.currentTurn !== StoneColor.Black || isAIThinkingRef.current) {
        return false;
      }
    }
    return placeStone(pos);
  }, [gameState?.gameType, boardStateRef, placeStone]);

  const handlePass = useCallback(() => {
    if (gameState?.gameType === 'ai' && isAIThinkingRef.current) return;
    pass();
  }, [gameState?.gameType, pass]);

  return (
    <div style={{
      display: 'flex',
      flexWrap: 'wrap',
      gap: 'var(--spacing-lg)',
      justifyContent: 'center',
      alignItems: 'flex-start',
    }}>
      <BoardCanvas
        boardState={boardState}
        onIntersectionClick={handlePlaceStone}
      />

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--spacing-lg)',
        minWidth: '200px',
      }}>
        <BoardInfo boardState={boardState} />
        <BoardControls
          boardSize={boardState.size}
          onBoardSizeChange={handleBoardSizeChange}
          onPass={handlePass}
          onReset={handleReset}
        />

        {gameState?.gameType === 'ai' && (
          <div style={{
            padding: 'var(--spacing-md)',
            backgroundColor: isAIThinking ? 'var(--color-primary)' : 'var(--color-bg-secondary)',
            borderRadius: '8px',
            textAlign: 'center',
            color: isAIThinking ? 'white' : 'var(--color-text)',
            fontWeight: isAIThinking ? 'bold' : 'normal'
          }}>
            <p style={{ fontSize: 'var(--font-size-sm)', margin: 0 }}>
              {isAIThinking
                ? 'AI 생각 중...'
                : boardState.currentTurn === StoneColor.Black
                  ? '당신의 차례'
                  : 'AI의 차례'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
