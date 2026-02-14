import { StoneColor } from '@baduk/shared';
import type { BoardState } from '@baduk/shared';

export default function BoardInfo({ boardState }: { boardState: BoardState }) {
  const isBlackTurn = boardState.currentTurn === StoneColor.Black;

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--spacing-sm)',
      padding: 'var(--spacing-md)',
      backgroundColor: 'var(--color-surface)',
      borderRadius: 'var(--radius-md)',
      boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
        <div style={{
          width: '20px',
          height: '20px',
          borderRadius: '50%',
          backgroundColor: isBlackTurn ? '#1a1a1a' : '#f0f0f0',
          border: '1px solid #999',
        }} />
        <span style={{ fontWeight: 600 }}>
          {isBlackTurn ? '흑' : '백'} 차례
        </span>
      </div>

      <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-light)' }}>
        <p>착수: {boardState.moveCount}수</p>
        <p>흑 따낸 돌: {boardState.capturedBlack}</p>
        <p>백 따낸 돌: {boardState.capturedWhite}</p>
      </div>
    </div>
  );
}
