import { useAuth } from '../contexts/AuthContext';
import ProfileCard from '../components/auth/ProfileCard';

export default function ProfilePage() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div style={{ paddingTop: 'var(--spacing-xl)' }}>
      <ProfileCard user={user} />
    </div>
  );
}
