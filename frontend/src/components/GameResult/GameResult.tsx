import type { GameResponse } from '@/types';

interface GameResultProps {
  game: GameResponse;
  currentUsername: string;
}

/**
 * Overlay banner shown when the game ends.
 */
export default function GameResult({ game, currentUsername }: GameResultProps) {
  if (game.status !== 'FINISHED') return null;

  let title: string;
  let subTitle: string;
  let bgClass: string;

  if (game.isDraw) {
    title = "It's a Draw!";
    subTitle = 'Great game, both equally matched!';
    bgClass = 'bg-yellow-50 border-yellow-400 text-yellow-800';
  } else {
    const winnerUsername =
      game.winner === 'X' ? game.playerXUsername : (game.playerOUsername ?? 'BOT');
    const didWin = winnerUsername === currentUsername;
    title = didWin ? '🎉 You Win!' : `${winnerUsername} Wins!`;
    subTitle = didWin ? 'Congratulations!' : 'Better luck next time!';
    bgClass = didWin
      ? 'bg-green-50 border-green-400 text-green-800'
      : 'bg-red-50 border-red-400 text-red-800';
  }

  return (
    <div
      className={`rounded-xl border-2 px-6 py-4 text-center animate-fade-in ${bgClass}`}
    >
      <h2 className="text-3xl font-extrabold">{title}</h2>
      <p className="mt-1 text-sm opacity-80">{subTitle}</p>
    </div>
  );
}
