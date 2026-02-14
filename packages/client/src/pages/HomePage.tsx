import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/common/Button';

export default function HomePage() {
  const { user } = useAuth();

  return (
    <div style={{ textAlign: 'center', paddingTop: 'var(--spacing-xl)' }}>
      <h1 style={{ fontSize: '2.5rem', marginBottom: 'var(--spacing-md)' }}>모두를위한바둑</h1>
      <p style={{ color: 'var(--color-text-light)', fontSize: 'var(--font-size-lg)', marginBottom: 'var(--spacing-xl)' }}>
        고연령들도 즐길 수 있는 바둑
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--spacing-md)' }}>
        <Link to="/board">
          <Button style={{ fontSize: 'var(--font-size-lg)', padding: '1rem 3rem' }}>
            바둑판 열기
          </Button>
        </Link>

        {!user && (
          <p style={{ color: 'var(--color-text-light)', fontSize: 'var(--font-size-sm)' }}>
            <Link to="/login">로그인</Link> 또는 <Link to="/register">회원가입</Link>하여 대국을 시작하세요
          </p>
        )}

        {user && (
          <p style={{ color: 'var(--color-text-light)' }}>
            환영합니다, <strong>{user.nickname}</strong>님! ({user.rankTier} {user.rankLevel}단)
          </p>
        )}
      </div>
    </div>
  );
}
