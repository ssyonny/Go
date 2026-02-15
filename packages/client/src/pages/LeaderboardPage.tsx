import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { lobbyApi } from '../api/lobby.api';
import type { LeaderboardResponse } from '@baduk/shared';

export default function LeaderboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState<LeaderboardResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    lobbyApi.getLeaderboard(50, 0)
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ maxWidth: '700px', margin: '0 auto' }}>
      <h1 style={{ textAlign: 'center', marginBottom: 'var(--spacing-lg)', fontSize: 'var(--font-size-xl)' }}>
        순위표
      </h1>

      {loading && (
        <p style={{ textAlign: 'center', color: 'var(--color-text-light)', fontSize: 'var(--font-size-lg)' }}>
          불러오는 중...
        </p>
      )}

      {!loading && data && (
        <div style={{
          backgroundColor: 'var(--color-surface)',
          borderRadius: 'var(--radius-md)',
          boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
          overflow: 'hidden',
        }}>
          {/* Header */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '60px 1fr 120px 100px',
            padding: 'var(--spacing-md) var(--spacing-lg)',
            backgroundColor: 'var(--color-primary)',
            color: '#fff',
            fontWeight: 700,
            fontSize: 'var(--font-size-base)',
          }}>
            <span>순위</span>
            <span>닉네임</span>
            <span>등급</span>
            <span style={{ textAlign: 'right' }}>포인트</span>
          </div>

          {/* Entries */}
          {data.entries.map((entry) => {
            const isMe = user?.id === entry.userId;
            return (
              <div
                key={entry.userId}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '60px 1fr 120px 100px',
                  padding: 'var(--spacing-md) var(--spacing-lg)',
                  borderBottom: '1px solid var(--color-border)',
                  backgroundColor: isMe ? 'rgba(52, 152, 219, 0.1)' : 'transparent',
                  fontSize: 'var(--font-size-lg)',
                }}
              >
                <span style={{
                  fontWeight: 700,
                  color: entry.rank <= 3 ? 'var(--color-accent)' : 'var(--color-text)',
                  fontSize: entry.rank <= 3 ? 'var(--font-size-xl)' : 'var(--font-size-lg)',
                }}>
                  {entry.rank}
                </span>
                <span style={{ fontWeight: isMe ? 700 : 400 }}>
                  {entry.nickname} {isMe && '(나)'}
                </span>
                <span style={{ color: 'var(--color-text-light)' }}>
                  {entry.rankTier} {entry.rankLevel}단
                </span>
                <span style={{ textAlign: 'right', fontWeight: 600 }}>
                  {entry.points.toLocaleString()}
                </span>
              </div>
            );
          })}

          {data.entries.length === 0 && (
            <p style={{ padding: 'var(--spacing-xl)', textAlign: 'center', color: 'var(--color-text-light)', fontSize: 'var(--font-size-lg)' }}>
              아직 등록된 사용자가 없습니다.
            </p>
          )}
        </div>
      )}

      {/* 내 순위 */}
      {data && data.myRank !== null && (
        <div style={{
          marginTop: 'var(--spacing-lg)',
          padding: 'var(--spacing-lg)',
          backgroundColor: 'var(--color-primary)',
          color: '#fff',
          borderRadius: 'var(--radius-md)',
          textAlign: 'center',
          fontSize: 'var(--font-size-lg)',
        }}>
          내 순위: <strong style={{ fontSize: 'var(--font-size-xl)' }}>{data.myRank}위</strong>
          <span style={{ marginLeft: 'var(--spacing-md)' }}>
            (전체 {data.totalPlayers}명 중)
          </span>
        </div>
      )}
    </div>
  );
}
