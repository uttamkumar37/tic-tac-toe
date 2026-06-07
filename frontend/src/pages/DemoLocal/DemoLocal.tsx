import { useState } from 'react';
import toast from 'react-hot-toast';
import DemoGameBoard from '@/components/Demo/DemoGameBoard';
import { demoGameService } from '@/services/demo/demoGameService';
import type { DemoGame } from '@/services/demo/demoStorage';

export default function DemoLocal() {
  const [game, setGame] = useState<DemoGame>(() => demoGameService.createLocalGame());

  const handleMove = (position: number) => {
    const next = demoGameService.makeDemoMove(game.roomCode, position);
    setGame(next);
    if (next.status === 'FINISHED') toast.success(next.winner ? `${next.winner} wins` : 'Draw game');
  };

  return (
    <DemoGameBoard
      game={game}
      title="Local 2 Player"
      subtitle="X and O play from the same browser. Completed results are stored locally for history and profile stats."
      onMove={handleMove}
      onUndo={() => setGame(demoGameService.undoDemoMove(game.roomCode))}
      onRestart={() => setGame(demoGameService.restartDemoGame(game.roomCode))}
    />
  );
}
