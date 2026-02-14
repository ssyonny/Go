import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export default function Header() {
  const { user, logout } = useAuth();

  return (
    <header style={{
      height: 'var(--header-height)',
      backgroundColor: 'var(--color-primary)',
      color: '#fff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 var(--spacing-lg)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      <Link to="/" style={{ color: '#fff', fontSize: 'var(--font-size-lg)', fontWeight: 700 }}>
        모두를위한바둑
      </Link>
      <nav style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
        <Link to="/board" style={{ color: '#fff' }}>바둑판</Link>
        {user ? (
          <>
            <Link to="/profile" style={{ color: '#fff' }}>{user.nickname}</Link>
            <button
              onClick={logout}
              style={{
                background: 'rgba(255,255,255,0.15)',
                border: '1px solid rgba(255,255,255,0.3)',
                color: '#fff',
                padding: '0.4rem 0.8rem',
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer',
              }}
            >
              로그아웃
            </button>
          </>
        ) : (
          <>
            <Link to="/login" style={{ color: '#fff' }}>로그인</Link>
            <Link to="/register" style={{ color: '#fff' }}>회원가입</Link>
          </>
        )}
      </nav>
    </header>
  );
}
