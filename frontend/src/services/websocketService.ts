import SockJS from 'sockjs-client';
import { Client, type IMessage } from '@stomp/stompjs';
import { appConfig } from '@/config/appConfig';
import type { GameResponse, MakeMoveRequest } from '@/types';

type MessageHandler = (game: GameResponse) => void;
type ErrorHandler = (msg: string) => void;
type ConnectionHandler = (connected: boolean) => void;

/**
 * Singleton WebSocket service.
 *
 * Uses SockJS + STOMP over the Spring Boot message broker.
 * Reconnects automatically on disconnect (STOMP client built-in).
 */
class WebSocketService {
  private client: Client | null = null;
  private subscriptions = new Map<string, () => void>();
  private errorSubscription: (() => void) | null = null;
  private errorHandlers = new Set<ErrorHandler>();
  private connectionHandlers = new Set<ConnectionHandler>();
  private pendingConnectCallbacks = new Set<() => void>();

  connect(token: string, onConnected?: () => void): void {
    if (appConfig.isDemoMode) {
      onConnected?.();
      this.notifyConnection(false);
      return;
    }

    if (this.client?.connected) {
      onConnected?.();
      return;
    }

    if (onConnected) {
      this.pendingConnectCallbacks.add(onConnected);
    }

    if (this.client?.active) return;

    this.client = new Client({
      // SockJS fallback transport
      webSocketFactory: () => new SockJS(appConfig.wsBaseUrl || '/ws'),

      // Attach JWT in STOMP connect headers (used by Spring Security WS interceptors)
      connectHeaders: { Authorization: `Bearer ${token}` },

      reconnectDelay: 3000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,

      onConnect: () => {
        this.notifyConnection(true);
        this.ensureErrorSubscription();
        this.pendingConnectCallbacks.forEach((callback) => callback());
        this.pendingConnectCallbacks.clear();
      },

      onDisconnect: () => {
        this.notifyConnection(false);
      },

      onStompError: (frame) => {
        this.errorHandlers.forEach((handler) =>
          handler(frame.headers['message'] ?? 'WebSocket error')
        );
      },
    });

    this.client.activate();
  }

  disconnect(): void {
    this.subscriptions.clear();
    this.errorSubscription?.();
    this.errorSubscription = null;
    this.errorHandlers.clear();
    this.pendingConnectCallbacks.clear();
    this.client?.deactivate();
    this.client = null;
    this.notifyConnection(false);
  }

  /** Subscribe to game state updates for a room */
  subscribeToGame(roomCode: string, onMessage: MessageHandler): void {
    if (appConfig.isDemoMode) return;
    if (!this.client?.connected) return;

    this.unsubscribeFromGame(roomCode);

    const topic = `/topic/game/${roomCode}`;
    const sub = this.client.subscribe(topic, (msg: IMessage) => {
      onMessage(JSON.parse(msg.body) as GameResponse);
    });

    // Store unsubscribe callback
    this.subscriptions.set(roomCode, () => sub.unsubscribe());
  }

  /** Subscribe to per-user error messages */
  subscribeToErrors(onError: ErrorHandler): () => void {
    this.errorHandlers.add(onError);
    this.ensureErrorSubscription();

    return () => {
      this.errorHandlers.delete(onError);
      if (this.errorHandlers.size === 0) {
        this.errorSubscription?.();
        this.errorSubscription = null;
      }
    };
  }

  unsubscribeFromGame(roomCode: string): void {
    this.subscriptions.get(roomCode)?.();
    this.subscriptions.delete(roomCode);
  }

  sendMove(req: MakeMoveRequest): void {
    if (appConfig.isDemoMode) return;
    this.client?.publish({
      destination: '/app/game.move',
      body: JSON.stringify(req),
    });
  }

  sendUndo(roomCode: string): void {
    if (appConfig.isDemoMode) return;
    this.client?.publish({
      destination: '/app/game.undo',
      body: JSON.stringify({ roomCode, position: 0 }),
    });
  }

  sendRestart(roomCode: string): void {
    if (appConfig.isDemoMode) return;
    this.client?.publish({
      destination: '/app/game.restart',
      body: JSON.stringify({ roomCode, position: 0 }),
    });
  }

  isConnected(): boolean {
    return this.client?.connected ?? false;
  }

  onConnectionChange(handler: ConnectionHandler): () => void {
    this.connectionHandlers.add(handler);
    handler(this.isConnected());

    return () => {
      this.connectionHandlers.delete(handler);
    };
  }

  private ensureErrorSubscription(): void {
    if (!this.client?.connected || this.errorSubscription) return;

    const sub = this.client.subscribe('/user/queue/errors', (msg: IMessage) => {
      this.errorHandlers.forEach((handler) => handler(msg.body));
    });
    this.errorSubscription = () => sub.unsubscribe();
  }

  private notifyConnection(connected: boolean): void {
    this.connectionHandlers.forEach((handler) => handler(connected));
  }
}

// Export a single shared instance
export const wsService = new WebSocketService();
