import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoginForm from '../components/auth/LoginForm';

export default function LoginPage() {
  const { user } = useAuth();

  if (user) return <Navigate to="/" replace />;

  return (
    <div style={{ paddingTop: 'var(--spacing-xl)' }}>
      <LoginForm />
      <p style={{ textAlign: 'center', marginTop: 'var(--spacing-lg)', color: 'var(--color-text-light)' }}>
        계정이 없으신가요? <Link to="/register">회원가입</Link>
      </p>
    </div>
  );
}
