import SockJS from 'sockjs-client';
import { Client, type IMessage } from '@stomp/stompjs';
import type { GameResponse, MakeMoveRequest } from '@/types';

type MessageHandler = (game: GameResponse) => void;
type ErrorHandler = (msg: string) => void;

/**
 * Singleton WebSocket service.
 *
 * Uses SockJS + STOMP over the Spring Boot message broker.
 * Reconnects automatically on disconnect (STOMP client built-in).
 */
class WebSocketService {
  private client: Client | null = null;
  private subscriptions = new Map<string, () => void>();

  connect(token: string, onConnected?: () => void): void {
    if (this.client?.active) return;

    this.client = new Client({
      // SockJS fallback transport
      webSocketFactory: () => new SockJS('/ws'),

      // Attach JWT in STOMP connect headers (used by Spring Security WS interceptors)
      connectHeaders: { Authorization: `Bearer ${token}` },

      reconnectDelay: 3000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,

      onConnect: () => {
        console.log('[WS] Connected');
        onConnected?.();
      },

      onDisconnect: () => {
        console.log('[WS] Disconnected');
      },

      onStompError: (frame) => {
        console.error('[WS] STOMP error:', frame.headers['message']);
      },
    });

    this.client.activate();
  }

  disconnect(): void {
    this.subscriptions.clear();
    this.client?.deactivate();
    this.client = null;
  }

  /** Subscribe to game state updates for a room */
  subscribeToGame(roomCode: string, onMessage: MessageHandler): void {
    if (!this.client?.active) return;

    const topic = `/topic/game/${roomCode}`;
    const sub = this.client.subscribe(topic, (msg: IMessage) => {
      onMessage(JSON.parse(msg.body) as GameResponse);
    });

    // Store unsubscribe callback
    this.subscriptions.set(roomCode, () => sub.unsubscribe());
  }

  /** Subscribe to per-user error messages */
  subscribeToErrors(onError: ErrorHandler): void {
    if (!this.client?.active) return;
    this.client.subscribe('/user/queue/errors', (msg: IMessage) => {
      onError(msg.body);
    });
  }

  unsubscribeFromGame(roomCode: string): void {
    this.subscriptions.get(roomCode)?.();
    this.subscriptions.delete(roomCode);
  }

  sendMove(req: MakeMoveRequest): void {
    this.client?.publish({
      destination: '/app/game.move',
      body: JSON.stringify(req),
    });
  }

  sendUndo(roomCode: string): void {
    this.client?.publish({
      destination: '/app/game.undo',
      body: JSON.stringify({ roomCode, position: 0 }),
    });
  }

  sendRestart(roomCode: string): void {
    this.client?.publish({
      destination: '/app/game.restart',
      body: JSON.stringify({ roomCode, position: 0 }),
    });
  }

  isConnected(): boolean {
    return this.client?.active ?? false;
  }
}

// Export a single shared instance
export const wsService = new WebSocketService();
