import { PacketInspectorEvent, InspectorFilter } from '../types';

export type WebSocketConnectionState = 'CONNECTING' | 'OPEN' | 'CLOSED' | 'ERROR';

export type PacketCallback = (packet: PacketInspectorEvent) => void;
export type StateCallback = (state: WebSocketConnectionState) => void;
export type StatsCallback = (stats: { activeClients: number; historyCount: number }) => void;
export type FilterAckCallback = (filter: InspectorFilter) => void;

export class InspectorWebSocketService {
  private ws: WebSocket | null = null;
  private url: string;
  private reconnectAttempts = 0;
  private maxReconnectDelay = 10000;
  private reconnectTimer: any = null;
  private pingIntervalTimer: any = null;
  private isExplicitlyClosed = false;
  private state: WebSocketConnectionState = 'CLOSED';

  private packetListeners: Set<PacketCallback> = new Set();
  private stateListeners: Set<StateCallback> = new Set();
  private statsListeners: Set<StatsCallback> = new Set();
  private filterAckListeners: Set<FilterAckCallback> = new Set();

  constructor(customUrl?: string) {
    if (customUrl) {
      this.url = customUrl;
    } else if (import.meta.env.VITE_WS_URL) {
      this.url = `${import.meta.env.VITE_WS_URL}/ws/inspector`;
    } else if (import.meta.env.VITE_API_URL) {
      const apiUrl = import.meta.env.VITE_API_URL;
      const wsProto = apiUrl.startsWith('https:') ? 'wss:' : 'ws:';
      const host = apiUrl.replace(/^https?:\/\//, '').replace(/\/+$/, '');
      this.url = `${wsProto}//${host}/ws/inspector`;
    } else {
      const protocol = typeof window !== 'undefined' && window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const host = typeof window !== 'undefined' ? window.location.host : 'localhost:3000';
      this.url = `${protocol}//${host}/ws/inspector`;
    }
  }

  public getState(): WebSocketConnectionState {
    return this.state;
  }

  public connect(): void {
    if (typeof WebSocket === 'undefined') return;
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      return;
    }

    this.isExplicitlyClosed = false;
    this.setState('CONNECTING');

    try {
      this.ws = new WebSocket(this.url);

      this.ws.onopen = () => {
        this.reconnectAttempts = 0;
        this.setState('OPEN');
        this.startHeartbeat();
      };

      this.ws.onmessage = (event: MessageEvent) => {
        try {
          const raw = typeof event.data === 'string' ? event.data : '';
          const message = JSON.parse(raw);

          switch (message.type) {
            case 'CONNECTED':
              this.notifyStats({
                activeClients: message.activeClients || 1,
                historyCount: message.historyCount || 0,
              });
              break;

            case 'PACKET':
              if (message.data) {
                this.notifyPacket(message.data);
              }
              break;

            case 'FILTER_UPDATED':
              this.notifyFilterAck(message.filter || {});
              break;

            case 'HISTORY_CLEARED':
              // Clear ack
              break;

            case 'PONG':
              // Heartbeat acknowledged
              break;

            case 'ERROR':
              console.warn('[InspectorWebSocketService] Server error:', message.message);
              break;

            default:
              break;
          }
        } catch (err) {
          console.error('[InspectorWebSocketService] Failed to parse message:', err);
        }
      };

      this.ws.onclose = () => {
        this.cleanupSocket();
        this.setState('CLOSED');
        if (!this.isExplicitlyClosed) {
          this.scheduleReconnect();
        }
      };

      this.ws.onerror = (err) => {
        console.error('[InspectorWebSocketService] Socket error:', err);
        this.setState('ERROR');
      };
    } catch (err) {
      console.error('[InspectorWebSocketService] Connect exception:', err);
      this.setState('ERROR');
      this.scheduleReconnect();
    }
  }

  public disconnect(): void {
    this.isExplicitlyClosed = true;
    this.clearTimers();
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.setState('CLOSED');
  }

  public sendFilter(filter: InspectorFilter): void {
    this.sendJson({
      action: 'filter',
      filter,
    });
  }

  public clearHistory(): void {
    this.sendJson({
      action: 'clear_history',
    });
  }

  public ping(): void {
    this.sendJson({
      action: 'ping',
    });
  }

  private sendJson(obj: Record<string, any>): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(obj));
    }
  }

  private startHeartbeat(): void {
    this.stopHeartbeat();
    this.pingIntervalTimer = setInterval(() => {
      this.ping();
    }, 15000);
  }

  private stopHeartbeat(): void {
    if (this.pingIntervalTimer) {
      clearInterval(this.pingIntervalTimer);
      this.pingIntervalTimer = null;
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimer) return;
    const delay = Math.min(1000 * Math.pow(1.5, this.reconnectAttempts), this.maxReconnectDelay);
    this.reconnectAttempts++;

    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      if (!this.isExplicitlyClosed) {
        this.connect();
      }
    }, delay);
  }

  private clearTimers(): void {
    this.stopHeartbeat();
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  private cleanupSocket(): void {
    this.stopHeartbeat();
    if (this.ws) {
      this.ws.onopen = null;
      this.ws.onmessage = null;
      this.ws.onclose = null;
      this.ws.onerror = null;
      this.ws = null;
    }
  }

  private setState(newState: WebSocketConnectionState): void {
    if (this.state !== newState) {
      this.state = newState;
      this.stateListeners.forEach((cb) => cb(newState));
    }
  }

  private notifyPacket(packet: PacketInspectorEvent): void {
    this.packetListeners.forEach((cb) => cb(packet));
  }

  private notifyStats(stats: { activeClients: number; historyCount: number }): void {
    this.statsListeners.forEach((cb) => cb(stats));
  }

  private notifyFilterAck(filter: InspectorFilter): void {
    this.filterAckListeners.forEach((cb) => cb(filter));
  }

  // Subscription management
  public onPacket(cb: PacketCallback): () => void {
    this.packetListeners.add(cb);
    return () => this.packetListeners.delete(cb);
  }

  public onStateChange(cb: StateCallback): () => void {
    this.stateListeners.add(cb);
    cb(this.state);
    return () => this.stateListeners.delete(cb);
  }

  public onStats(cb: StatsCallback): () => void {
    this.statsListeners.add(cb);
    return () => this.statsListeners.delete(cb);
  }

  public onFilterAck(cb: FilterAckCallback): () => void {
    this.filterAckListeners.add(cb);
    return () => this.filterAckListeners.delete(cb);
  }
}

// Global default singleton instance
export const inspectorWebSocketService = new InspectorWebSocketService();
export default inspectorWebSocketService;
