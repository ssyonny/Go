import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import RegisterForm from '../components/auth/RegisterForm';

export default function RegisterPage() {
  const { user } = useAuth();

  if (user) return <Navigate to="/" replace />;

  return (
    <div style={{ paddingTop: 'var(--spacing-xl)' }}>
      <RegisterForm />
      <p style={{ textAlign: 'center', marginTop: 'var(--spacing-lg)', color: 'var(--color-text-light)' }}>
        이미 계정이 있으신가요? <Link to="/login">로그인</Link>
      </p>
    </div>
  );
}
