import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import type { BoardSize, GameRoom } from '@baduk/shared';
import { BOARD_SIZES } from '@baduk/shared';
import { lobbyApi } from '../api/lobby.api';
import { usePolling } from '../hooks/usePolling';
import Button from '../components/common/Button';

export default function LobbyPage() {
  const navigate = useNavigate();
  const [matchingSize, setMatchingSize] = useState<BoardSize | null>(null);
  const [showCreateMenu, setShowCreateMenu] = useState(false);

  const fetchRooms = useCallback(() => lobbyApi.listRooms(), []);
  const fetchOnline = useCallback(() => lobbyApi.getOnlineUsers(), []);

  const { data: roomData, loading: roomsLoading } = usePolling(fetchRooms, 5000);
  const { data: onlineData } = usePolling(fetchOnline, 10000);

  const rooms = roomData?.rooms ?? [];
  const onlineUsers = onlineData?.users ?? [];

  const handleAutoMatch = async (boardSize: BoardSize) => {
    setMatchingSize(boardSize);
    try {
      const result = await lobbyApi.autoMatch({ boardSize });
      if (result.created) {
        navigate(`/lobby/room/${result.room.roomId}`);
      } else {
        navigate('/board', {
          state: { gameType: 'pvp', room: result.room },
        });
      }
    } catch {
      alert('매칭에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setMatchingSize(null);
    }
  };

  const handleCreateRoom = async (boardSize: BoardSize) => {
    try {
      const result = await lobbyApi.createRoom({ boardSize });
      navigate(`/lobby/room/${result.room.roomId}`);
    } catch {
      alert('방 생성에 실패했습니다.');
    }
    setShowCreateMenu(false);
  };

  const handleJoinRoom = async (room: GameRoom) => {
    try {
      const result = await lobbyApi.joinRoom(room.roomId);
      navigate('/board', {
        state: { gameType: 'pvp', room: result.room },
      });
    } catch {
      alert('이미 다른 사람이 입장했습니다.');
    }
  };

  return (
    <div>
      <h1 style={{ textAlign: 'center', marginBottom: 'var(--spacing-lg)', fontSize: 'var(--font-size-xl)' }}>
        온라인 대국장
      </h1>

      {/* 빠른 매칭 */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--spacing-sm)',
        marginBottom: 'var(--spacing-xl)',
        padding: 'var(--spacing-lg)',
        backgroundColor: 'var(--color-surface)',
        borderRadius: 'var(--radius-md)',
        boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
      }}>
        <h2 style={{ fontSize: 'var(--font-size-lg)', marginBottom: 'var(--spacing-sm)' }}>빠른 대국 찾기</h2>
        <div style={{ display: 'flex', gap: 'var(--spacing-sm)', flexWrap: 'wrap' }}>
          {BOARD_SIZES.map((size) => (
            <Button
              key={size}
              onClick={() => handleAutoMatch(size)}
              disabled={matchingSize !== null}
              style={{ fontSize: 'var(--font-size-lg)', padding: '0.8rem 1.5rem', flex: '1 1 auto', minWidth: '120px' }}
            >
              {matchingSize === size ? '매칭 중...' : `${size}x${size}`}
            </Button>
          ))}
        </div>

        <div style={{ marginTop: 'var(--spacing-sm)' }}>
          <Button
            variant="secondary"
            onClick={() => setShowCreateMenu(!showCreateMenu)}
            style={{ fontSize: 'var(--font-size-base)' }}
          >
            방 직접 만들기
          </Button>
          {showCreateMenu && (
            <div style={{ display: 'flex', gap: 'var(--spacing-sm)', marginTop: 'var(--spacing-sm)' }}>
              {BOARD_SIZES.map((size) => (
                <Button key={size} variant="secondary" onClick={() => handleCreateRoom(size)}>
                  {size}x{size}
                </Button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 'var(--spacing-lg)', flexWrap: 'wrap' }}>
        {/* 대기 방 목록 */}
        <div style={{
          flex: '2 1 400px',
          padding: 'var(--spacing-lg)',
          backgroundColor: 'var(--color-surface)',
          borderRadius: 'var(--radius-md)',
          boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
        }}>
          <h2 style={{ fontSize: 'var(--font-size-lg)', marginBottom: 'var(--spacing-md)' }}>
            대기 중인 방 ({rooms.length})
          </h2>
          {roomsLoading && rooms.length === 0 && (
            <p style={{ color: 'var(--color-text-light)' }}>불러오는 중...</p>
          )}
          {!roomsLoading && rooms.length === 0 && (
            <p style={{ color: 'var(--color-text-light)', fontSize: 'var(--font-size-lg)' }}>
              대기 중인 방이 없습니다. 빠른 매칭을 시도해보세요!
            </p>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
            {rooms.map((room) => (
              <div
                key={room.roomId}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: 'var(--spacing-md)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-sm)',
                }}
              >
                <div>
                  <strong style={{ fontSize: 'var(--font-size-lg)' }}>{room.hostNickname}</strong>
                  <span style={{ color: 'var(--color-text-light)', marginLeft: 'var(--spacing-sm)' }}>
                    {room.hostRankTier} {room.hostRankLevel}단
                  </span>
                  <span style={{
                    marginLeft: 'var(--spacing-md)',
                    padding: '2px 8px',
                    backgroundColor: 'var(--color-primary)',
                    color: '#fff',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: 'var(--font-size-sm)',
                  }}>
                    {room.boardSize}x{room.boardSize}
                  </span>
                </div>
                <Button onClick={() => handleJoinRoom(room)} style={{ fontSize: 'var(--font-size-base)' }}>
                  입장하기
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* 접속 중 유저 */}
        <div style={{
          flex: '1 1 200px',
          padding: 'var(--spacing-lg)',
          backgroundColor: 'var(--color-surface)',
          borderRadius: 'var(--radius-md)',
          boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
          maxHeight: '500px',
          overflowY: 'auto',
        }}>
          <h2 style={{ fontSize: 'var(--font-size-lg)', marginBottom: 'var(--spacing-md)' }}>
            접속 중 ({onlineUsers.length})
          </h2>
          {onlineUsers.length === 0 && (
            <p style={{ color: 'var(--color-text-light)' }}>접속 중인 유저가 없습니다.</p>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xs)' }}>
            {onlineUsers.map((u) => (
              <div
                key={u.userId}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--spacing-sm)',
                  padding: 'var(--spacing-sm)',
                  borderBottom: '1px solid var(--color-border)',
                }}
              >
                <div style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--color-success)',
                  flexShrink: 0,
                }} />
                <span style={{ fontWeight: 600 }}>{u.nickname}</span>
                <span style={{ color: 'var(--color-text-light)', fontSize: 'var(--font-size-sm)' }}>
                  {u.rankTier} {u.rankLevel}단
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
