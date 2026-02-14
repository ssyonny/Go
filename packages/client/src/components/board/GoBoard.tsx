import { useState, useRef, useEffect } from 'react';
import { useBoard } from '../../hooks/useBoard';
import BoardCanvas from './BoardCanvas';
import BoardControls from './BoardControls';
import BoardInfo from './BoardInfo';
import { StoneColor } from '@baduk/shared';
import type { Position, BoardState } from '@baduk/shared';

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
  const aiTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastMoveCountRef = useRef(0);
  const boardStateRef = useRef<BoardState | null>(null);
  
  const { boardState, placeStone, pass, reset, changeBoardSize } = useBoard(initialBoardSize);
  
  // boardStateRef를 항상 최신으로 유지
  boardStateRef.current = boardState;

  // AI 게임일 때 turn 변경 감시
  useEffect(() => {
    // AI 게임이 아니거나 이미 AI가 생각 중이면 무시
    if (gameState?.gameType !== 'ai' || isAIThinking) return;
    
    const currentBoard = boardStateRef.current;
    if (!currentBoard) return;
    
    // 움직임이 없으면 무시
    if (currentBoard.moveCount === lastMoveCountRef.current) return;
    
    console.log('moveCount changed:', lastMoveCountRef.current, '->', currentBoard.moveCount);
    
    // 플레이어 차례면 무시 (흑=플레이어이므로)
    if (currentBoard.currentTurn === StoneColor.Black) {
      console.log('Player turn');
      lastMoveCountRef.current = currentBoard.moveCount;
      return;
    }

    // AI 차례
    console.log('AI turn detected, moveCount:', currentBoard.moveCount);
    lastMoveCountRef.current = currentBoard.moveCount;
    setIsAIThinking(true);
    
    if (aiTimeoutRef.current) {
      clearTimeout(aiTimeoutRef.current);
    }

    aiTimeoutRef.current = setTimeout(() => {
      const shouldPass = Math.random() > 0.7;
      
      if (shouldPass) {
        console.log('AI: Pass');
        pass();
      } else {
        // 한 번에 한 수만 놓기
        let placed = false;
        
        // 최대 100번까지 시도
        for (let attempt = 0; attempt < 100; attempt++) {
          const x = Math.floor(Math.random() * currentBoard.size);
          const y = Math.floor(Math.random() * currentBoard.size);
          
          if (currentBoard.grid[y][x] === StoneColor.Empty) {
            placed = placeStone({ x, y });
            console.log(`AI placed at (${x}, ${y}):`, placed);
            break;
          }
        }
        
        if (!placed) {
          console.log('AI: No valid move, passing');
          pass();
        }
      }
      
      setIsAIThinking(false);
      aiTimeoutRef.current = null;
    }, 1500);

  }, [gameState?.gameType, boardState.moveCount, boardState.currentTurn, isAIThinking]);

  const handlePlaceStone = (pos: Position): boolean => {
    if (gameState?.gameType === 'ai') {
      // AI 게임일 때는 흑(검은돌)일 때만 클릭 허용
      if (boardState.currentTurn !== StoneColor.Black || isAIThinking) {
        return false;
      }
    }

    return placeStone(pos);
  };

  const handlePass = () => {
    if (gameState?.gameType === 'ai' && isAIThinking) {
      return;
    }
    pass();
  };

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
          onBoardSizeChange={changeBoardSize}
          onPass={handlePass}
          onReset={() => reset()}
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
                ? '🤖 AI 생각 중...'
                : boardState.currentTurn === StoneColor.Black 
                  ? '🎯 당신의 차례'
                  : '🤖 AI의 차례'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
