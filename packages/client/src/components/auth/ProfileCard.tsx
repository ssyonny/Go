import type { User } from '@baduk/shared';

export default function ProfileCard({ user }: { user: User }) {
  return (
    <div style={{
      backgroundColor: 'var(--color-surface)',
      borderRadius: 'var(--radius-lg)',
      padding: 'var(--spacing-xl)',
      maxWidth: '400px',
      margin: '0 auto',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    }}>
      <h2 style={{ marginBottom: 'var(--spacing-lg)', textAlign: 'center' }}>프로필</h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
        <InfoRow label="닉네임" value={user.nickname} />
        <InfoRow label="아이디" value={user.username} />
        <InfoRow label="등급" value={`${user.rankTier} ${user.rankLevel}단`} />
        <InfoRow label="포인트" value={`${user.points}점`} />
        <InfoRow label="가입일" value={new Date(user.createdAt).toLocaleDateString('ko-KR')} />
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: 'var(--spacing-sm) 0', borderBottom: '1px solid var(--color-border)' }}>
      <span style={{ color: 'var(--color-text-light)', fontWeight: 500 }}>{label}</span>
      <span style={{ fontWeight: 600 }}>{value}</span>
    </div>
  );
}
