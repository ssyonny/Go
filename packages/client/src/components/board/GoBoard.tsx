import { useBoard } from '../../hooks/useBoard';
import BoardCanvas from './BoardCanvas';
import BoardControls from './BoardControls';
import BoardInfo from './BoardInfo';

export default function GoBoard() {
  const { boardState, placeStone, pass, reset, changeBoardSize } = useBoard(19);

  return (
    <div style={{
      display: 'flex',
      flexWrap: 'wrap',
      gap: 'var(--spacing-lg)',
      justifyContent: 'center',
      alignItems: 'flex-start',
    }}>
      <BoardCanvas
        boardState={boardState}
        onIntersectionClick={placeStone}
      />

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--spacing-lg)',
        minWidth: '200px',
      }}>
        <BoardInfo boardState={boardState} />
        <BoardControls
          boardSize={boardState.size}
          onBoardSizeChange={changeBoardSize}
          onPass={pass}
          onReset={() => reset()}
        />
      </div>
    </div>
  );
}
