import { useEffect, useCallback } from 'react';
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

  const connect = useCallback(() => {
    if (!user?.token || !roomCode) return;

    wsService.connect(user.token, () => {
      wsService.subscribeToGame(roomCode, (game) => {
        dispatch(updateGameState(game));
      });

      wsService.subscribeToErrors((msg) => {
        toast.error(`Game error: ${msg}`);
      });
    });
  }, [user?.token, roomCode, dispatch]);

  useEffect(() => {
    connect();
    return () => {
      if (roomCode) {
        wsService.unsubscribeFromGame(roomCode);
      }
    };
  }, [connect, roomCode]);

  return {
    isConnected: wsService.isConnected(),
    sendMove: wsService.sendMove.bind(wsService),
    sendUndo: wsService.sendUndo.bind(wsService),
    sendRestart: wsService.sendRestart.bind(wsService),
  };
}
