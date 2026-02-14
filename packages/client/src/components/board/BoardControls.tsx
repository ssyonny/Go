import type { BoardSize } from '@baduk/shared';
import { BOARD_SIZES } from '@baduk/shared';
import Button from '../common/Button';

interface BoardControlsProps {
  boardSize: BoardSize;
  onBoardSizeChange: (size: BoardSize) => void;
  onPass: () => void;
  onReset: () => void;
}

export default function BoardControls({ boardSize, onBoardSizeChange, onPass, onReset }: BoardControlsProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
      <div>
        <p style={{ fontWeight: 600, marginBottom: 'var(--spacing-sm)', fontSize: 'var(--font-size-sm)' }}>바둑판 크기</p>
        <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
          {BOARD_SIZES.map((size) => (
            <button
              key={size}
              onClick={() => onBoardSizeChange(size)}
              style={{
                padding: '0.5rem 1rem',
                border: `2px solid ${boardSize === size ? 'var(--color-primary)' : 'var(--color-border)'}`,
                borderRadius: 'var(--radius-sm)',
                backgroundColor: boardSize === size ? 'var(--color-primary)' : 'var(--color-surface)',
                color: boardSize === size ? '#fff' : 'var(--color-text)',
                cursor: 'pointer',
                fontWeight: 600,
              }}
            >
              {size}x{size}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
        <Button variant="secondary" onClick={onPass}>패스</Button>
        <Button variant="danger" onClick={onReset}>리셋</Button>
      </div>
    </div>
  );
}
