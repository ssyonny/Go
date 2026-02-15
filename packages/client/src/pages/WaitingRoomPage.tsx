import { useCallback, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { lobbyApi } from '../api/lobby.api';
import { usePolling } from '../hooks/usePolling';
import Button from '../components/common/Button';

export default function WaitingRoomPage() {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();

  const fetcher = useCallback(() => {
    if (!roomId) return Promise.reject('no roomId');
    return lobbyApi.getRoomStatus(roomId);
  }, [roomId]);

  const { data, loading } = usePolling(fetcher, 2000, !!roomId);

  const room = data?.room;

  // 상대가 입장하면 대국 시작
  useEffect(() => {
    if (room?.status === 'full') {
      navigate('/board', {
        state: { gameType: 'pvp', room },
      });
    }
  }, [room, navigate]);

  const handleCancel = async () => {
    if (roomId) {
      await lobbyApi.leaveRoom(roomId).catch(() => {});
    }
    navigate('/lobby');
  };

  if (loading && !room) {
    return (
      <div style={{ textAlign: 'center', paddingTop: 'var(--spacing-xl)' }}>
        <p style={{ fontSize: 'var(--font-size-lg)' }}>방 정보를 불러오는 중...</p>
      </div>
    );
  }

  if (!room) {
    return (
      <div style={{ textAlign: 'center', paddingTop: 'var(--spacing-xl)' }}>
        <p style={{ fontSize: 'var(--font-size-lg)', color: 'var(--color-error)' }}>방을 찾을 수 없습니다.</p>
        <Button onClick={() => navigate('/lobby')} style={{ marginTop: 'var(--spacing-lg)' }}>
          대국장으로 돌아가기
        </Button>
      </div>
    );
  }

  return (
    <div style={{
      maxWidth: '500px',
      margin: '0 auto',
      paddingTop: 'var(--spacing-xl)',
      textAlign: 'center',
    }}>
      <div style={{
        padding: 'var(--spacing-xl)',
        backgroundColor: 'var(--color-surface)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      }}>
        <h1 style={{ fontSize: 'var(--font-size-xl)', marginBottom: 'var(--spacing-lg)' }}>
          대국 대기 중...
        </h1>

        <div style={{
          width: '60px',
          height: '60px',
          border: '4px solid var(--color-border)',
          borderTop: '4px solid var(--color-primary)',
          borderRadius: '50%',
          margin: '0 auto var(--spacing-lg)',
          animation: 'spin 1s linear infinite',
        }} />

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--spacing-md)',
          fontSize: 'var(--font-size-lg)',
          textAlign: 'left',
          padding: 'var(--spacing-md)',
          backgroundColor: 'var(--color-bg)',
          borderRadius: 'var(--radius-md)',
          marginBottom: 'var(--spacing-lg)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--color-text-light)' }}>바둑판</span>
            <strong>{room.boardSize}x{room.boardSize}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--color-text-light)' }}>흑</span>
            <strong>{room.hostNickname} ({room.hostRankTier} {room.hostRankLevel}단)</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--color-text-light)' }}>백</span>
            <strong style={{ color: 'var(--color-primary)' }}>
              {room.guestNickname || '상대를 기다리는 중...'}
            </strong>
          </div>
        </div>

        <Button variant="danger" onClick={handleCancel} style={{ fontSize: 'var(--font-size-lg)', padding: '0.8rem 2rem' }}>
          취소하기
        </Button>
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
