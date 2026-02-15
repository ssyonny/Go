import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { validateUsername, validatePassword, validateNickname } from '@baduk/shared';
import { useAuth } from '../../contexts/AuthContext';
import { authApi } from '../../api/auth.api';
import Input from '../common/Input';
import Button from '../common/Button';

export default function RegisterForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [nickname, setNickname] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const validateField = (field: string, value: string) => {
    const newErrors = { ...errors };

    if (field === 'username') {
      const result = validateUsername(value);
      if (!result.valid) newErrors.username = result.error!;
      else delete newErrors.username;
    }
    if (field === 'password') {
      const result = validatePassword(value);
      if (!result.valid) newErrors.password = result.error!;
      else delete newErrors.password;
    }
    if (field === 'passwordConfirm' || (field === 'password' && passwordConfirm)) {
      const confirmValue = field === 'passwordConfirm' ? value : passwordConfirm;
      const passValue = field === 'password' ? value : password;
      if (confirmValue && confirmValue !== passValue) {
        newErrors.passwordConfirm = '비밀번호가 일치하지 않습니다.';
      } else {
        delete newErrors.passwordConfirm;
      }
    }
    if (field === 'nickname') {
      const result = validateNickname(value);
      if (!result.valid) newErrors.nickname = result.error!;
      else delete newErrors.nickname;
    }

    setErrors(newErrors);
  };

  const checkAvailability = async (field: 'username' | 'nickname', value: string) => {
    if (errors[field]) return;
    try {
      const available = field === 'username'
        ? await authApi.checkUsername(value)
        : await authApi.checkNickname(value);
      if (!available) {
        setErrors((prev) => ({ ...prev, [field]: `이미 사용 중인 ${field === 'username' ? '아이디' : '닉네임'}입니다.` }));
      }
    } catch {
      // server not available, skip check
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    validateField('username', username);
    validateField('password', password);
    validateField('passwordConfirm', passwordConfirm);
    validateField('nickname', nickname);

    if (Object.keys(errors).length > 0 || !username || !password || !nickname) return;
    if (password !== passwordConfirm) return;

    setSubmitting(true);
    setServerError('');

    try {
      await register(username, password, nickname);
      navigate('/');
    } catch (err: any) {
      setServerError(err.response?.data?.error?.message || '회원가입에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: '400px', margin: '0 auto' }}>
      <h2 style={{ marginBottom: 'var(--spacing-lg)', textAlign: 'center' }}>회원가입</h2>

      {serverError && (
        <div style={{ color: 'var(--color-error)', marginBottom: 'var(--spacing-md)', textAlign: 'center' }}>
          {serverError}
        </div>
      )}

      <Input
        label="아이디"
        value={username}
        onChange={(e) => { setUsername(e.target.value); validateField('username', e.target.value); }}
        onBlur={() => checkAvailability('username', username)}
        placeholder="영문+숫자 4~20자"
        error={errors.username}
        required
      />

      <Input
        label="비밀번호"
        type="password"
        value={password}
        onChange={(e) => { setPassword(e.target.value); validateField('password', e.target.value); }}
        placeholder="영문+숫자 포함 8자 이상"
        error={errors.password}
        required
      />

      <Input
        label="비밀번호 확인"
        type="password"
        value={passwordConfirm}
        onChange={(e) => { setPasswordConfirm(e.target.value); validateField('passwordConfirm', e.target.value); }}
        placeholder="비밀번호를 다시 입력하세요"
        error={errors.passwordConfirm}
        required
      />

      <Input
        label="닉네임"
        value={nickname}
        onChange={(e) => { setNickname(e.target.value); validateField('nickname', e.target.value); }}
        onBlur={() => checkAvailability('nickname', nickname)}
        placeholder="2~10자"
        error={errors.nickname}
        required
      />

      <Button type="submit" fullWidth disabled={submitting}>
        {submitting ? '가입 중...' : '회원가입'}
      </Button>
    </form>
  );
}
