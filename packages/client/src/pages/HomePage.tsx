import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/common/Button';

export default function HomePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showAIMenu, setShowAIMenu] = useState(false);

  const handleStartAIGame = (difficulty: 'easy' | 'normal' | 'hard') => {
    navigate('/board', { state: { gameType: 'ai', difficulty } });
  };

  return (
    <div style={{ textAlign: 'center', paddingTop: 'var(--spacing-xl)' }}>
      <h1 style={{ fontSize: '2.5rem', marginBottom: 'var(--spacing-md)' }}>모두를위한바둑</h1>
      <p style={{ color: 'var(--color-text-light)', fontSize: 'var(--font-size-lg)', marginBottom: 'var(--spacing-xl)' }}>
        고연령들도 즐길 수 있는 바둑
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--spacing-md)' }}>
        <div style={{ display: 'flex', gap: 'var(--spacing-md)', flexDirection: 'column' }}>
          <Button 
            onClick={() => setShowAIMenu(!showAIMenu)}
            style={{ fontSize: 'var(--font-size-lg)', padding: '1rem 3rem' }}
          >
            AI와 대국하기 🤖
          </Button>
          
          {showAIMenu && (
            <div style={{ 
              display: 'flex', 
              gap: 'var(--spacing-sm)',
              flexDirection: 'column',
              padding: 'var(--spacing-md)',
              backgroundColor: 'var(--color-bg-secondary)',
              borderRadius: '8px'
            }}>
              <Button 
                onClick={() => handleStartAIGame('easy')}
                style={{ padding: '0.75rem 1.5rem', fontSize: 'var(--font-size-sm)' }}
              >
                쉬움 (9x9)
              </Button>
              <Button 
                onClick={() => handleStartAIGame('normal')}
                style={{ padding: '0.75rem 1.5rem', fontSize: 'var(--font-size-sm)' }}
              >
                보통 (13x13)
              </Button>
              <Button 
                onClick={() => handleStartAIGame('hard')}
                style={{ padding: '0.75rem 1.5rem', fontSize: 'var(--font-size-sm)' }}
              >
                어려움 (19x19)
              </Button>
            </div>
          )}

          <Link to="/board">
            <Button style={{ fontSize: 'var(--font-size-lg)', padding: '1rem 3rem' }}>
              자유대국 (테스트 모드)
            </Button>
          </Link>
        </div>

        {!user && (
          <p style={{ color: 'var(--color-text-light)', fontSize: 'var(--font-size-sm)', marginTop: 'var(--spacing-lg)' }}>
            <Link to="/login">로그인</Link> 또는 <Link to="/register">회원가입</Link>하여 AI와 대국을 시작하세요
          </p>
        )}

        {user && (
          <p style={{ color: 'var(--color-text-light)', marginTop: 'var(--spacing-lg)' }}>
            환영합니다, <strong>{user.nickname}</strong>님! ({user.rankTier} {user.rankLevel}단)
          </p>
        )}
      </div>
    </div>
  );
}
