import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import GoBoard from '../components/board/GoBoard';

interface GameState {
  gameType: 'ai' | 'pvp' | 'free';
  difficulty?: 'easy' | 'normal' | 'hard';
  boardSize?: number;
}

export default function BoardPage() {
  const location = useLocation();
  const [gameState, setGameState] = useState<GameState>({ gameType: 'free' });

  useEffect(() => {
    if (location.state?.gameType) {
      const { gameType, difficulty } = location.state;
      
      // 난이도에 따른 보드 크기 설정
      let boardSize = 19; // 기본값
      if (difficulty === 'easy') boardSize = 9;
      else if (difficulty === 'normal') boardSize = 13;
      else if (difficulty === 'hard') boardSize = 19;

      setGameState({
        gameType,
        difficulty,
        boardSize
      });
    }
  }, [location.state]);

  return (
    <div style={{ paddingTop: 'var(--spacing-md)' }}>
      {gameState.gameType === 'ai' && (
        <div style={{ 
          textAlign: 'center', 
          marginBottom: 'var(--spacing-md)',
          padding: 'var(--spacing-md)',
          backgroundColor: 'var(--color-bg-secondary)',
          borderRadius: '8px'
        }}>
          <h2>🤖 AI와의 대국</h2>
          <p>난이도: <strong>{
            gameState.difficulty === 'easy' ? '쉬움 (9x9)' :
            gameState.difficulty === 'normal' ? '보통 (13x13)' :
            '어려움 (19x19)'
          }</strong></p>
          <p style={{ color: 'var(--color-text-light)', fontSize: 'var(--font-size-sm)' }}>
            검정(黑)으로 먼저 두세요. AI는 흰돌(白)입니다.
          </p>
        </div>
      )}
      
      <GoBoard gameState={gameState} />
    </div>
  );
}
