import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Input from '../common/Input';
import Button from '../common/Button';

export default function LoginForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await login(username, password, rememberMe);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.error?.message || '로그인에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: '400px', margin: '0 auto' }}>
      <h2 style={{ marginBottom: 'var(--spacing-lg)', textAlign: 'center' }}>로그인</h2>

      {error && (
        <div style={{ color: 'var(--color-error)', marginBottom: 'var(--spacing-md)', textAlign: 'center' }}>
          {error}
        </div>
      )}

      <Input
        label="아이디"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="아이디를 입력하세요"
        required
      />

      <Input
        label="비밀번호"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="비밀번호를 입력하세요"
        required
      />

      <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-lg)', cursor: 'pointer' }}>
        <input
          type="checkbox"
          checked={rememberMe}
          onChange={(e) => setRememberMe(e.target.checked)}
          style={{ width: '16px', height: '16px' }}
        />
        <span style={{ fontSize: 'var(--font-size-sm)' }}>자동 로그인</span>
      </label>

      <Button type="submit" fullWidth disabled={submitting}>
        {submitting ? '로그인 중...' : '로그인'}
      </Button>
    </form>
  );
}
