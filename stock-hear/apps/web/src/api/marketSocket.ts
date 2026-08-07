import type { ClientSocketMessage, ConnectionStatus, ServerSocketMessage } from "../types";

interface MarketSocketOptions {
  url: string;
  symbol: string;
  onStatusChange: (status: ConnectionStatus) => void;
  onMessage: (message: ServerSocketMessage) => void;
}

export class MarketSocket {
  private socket: WebSocket | null = null;
  private reconnectTimer: number | null = null;

  constructor(private readonly options: MarketSocketOptions) {}

  connect(): void {
    this.options.onStatusChange("connecting");
    this.socket = new WebSocket(this.options.url);

    this.socket.addEventListener("open", () => {
      this.options.onStatusChange("connected");
      this.send({ type: "subscribe", symbol: this.options.symbol });
    });

    this.socket.addEventListener("message", (event) => {
      const message = this.parseMessage(event.data);
      if (message) {
        this.options.onMessage(message);
      }
    });

    this.socket.addEventListener("close", () => {
      this.options.onStatusChange("disconnected");
      this.scheduleReconnect();
    });

    this.socket.addEventListener("error", () => {
      this.options.onStatusChange("error");
    });
  }

  subscribe(symbol: string): void {
    this.send({ type: "subscribe", symbol });
  }

  unsubscribe(symbol: string): void {
    this.send({ type: "unsubscribe", symbol });
  }

  disconnect(): void {
    if (this.reconnectTimer !== null) {
      window.clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    this.socket?.close();
    this.socket = null;
  }

  private send(message: ClientSocketMessage): void {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(message));
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimer !== null) {
      return;
    }

    this.reconnectTimer = window.setTimeout(() => {
      this.reconnectTimer = null;
      this.connect();
    }, 3000);
  }

  private parseMessage(data: unknown): ServerSocketMessage | null {
    if (typeof data !== "string") {
      return null;
    }

    try {
      return JSON.parse(data) as ServerSocketMessage;
    } catch {
      return null;
    }
  }
}

