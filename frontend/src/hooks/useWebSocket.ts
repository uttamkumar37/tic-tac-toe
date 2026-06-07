import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { wsService } from '@/services/websocketService';
import { updateGameState } from '@/store/gameSlice';
import { useAuth } from './useAuth';
import toast from 'react-hot-toast';

/**
 * Manages WebSocket lifecycle for a given game room.
 *
 * Connects once when the user is authenticated,
 * subscribes to room updates, and cleans up on unmount.
 */
export function useWebSocket(roomCode: string | null) {
  const dispatch = useDispatch();
  const { user } = useAuth();
  const [isConnected, setIsConnected] = useState(wsService.isConnected());

  useEffect(() => {
    if (!user?.token || !roomCode) return;

    const unsubscribeConnection = wsService.onConnectionChange(setIsConnected);
    const unsubscribeErrors = wsService.subscribeToErrors((msg) => {
      toast.error(`Game error: ${msg}`);
    });

    const subscribeToRoom = () => {
      wsService.subscribeToGame(roomCode, (game) => {
        dispatch(updateGameState(game));
      });
    };

    wsService.connect(user.token, subscribeToRoom);

    return () => {
      wsService.unsubscribeFromGame(roomCode);
      unsubscribeErrors();
      unsubscribeConnection();
    };
  }, [user?.token, roomCode, dispatch]);

  return {
    isConnected,
    sendMove: wsService.sendMove.bind(wsService),
    sendUndo: wsService.sendUndo.bind(wsService),
    sendRestart: wsService.sendRestart.bind(wsService),
  };
}
