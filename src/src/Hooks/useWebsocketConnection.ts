import { useState, useEffect, useRef, useCallback } from 'react';

interface UseWebsocketConnectionOptions {
  channelName: string | null | undefined;
  onMessage: (event: string) => void;
}

interface UseWebsocketConnectionResult {
  isConnected: boolean;
}

const WEBSOCKET_BASE_URL = 'wss://decklist.lol/ws';
const INITIAL_RECONNECT_DELAY = 1000; // 1 second
const MAX_RECONNECT_DELAY = 30000; // 30 seconds
const KEEP_ALIVE_INTERVAL = 60000; // 60 seconds

// Class to manage WebSocket connection lifecycle
class WebSocketManager {
  private ws: WebSocket | null = null;
  private channelName: string | null | undefined = null;
  private onMessageCallback: (event: string) => void;
  private onStateChangeCallback: (isConnected: boolean) => void;
  private retryCount = 0;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private keepAliveInterval: NodeJS.Timeout | null = null;
  private intentionalClose = false;
  private _isConnected = false;

  constructor(
    initialChannelName: string | null | undefined,
    onMessage: (event: string) => void,
    onStateChange: (isConnected: boolean) => void
  ) {
    this.channelName = initialChannelName;
    this.onMessageCallback = onMessage;
    this.onStateChangeCallback = onStateChange;
    if (this.channelName) {
      this.connect();
    }
  }

  // Add public getter for isConnected state
  public getIsConnected(): boolean {
    return this._isConnected;
  }

  private setState(isConnected: boolean) {
    if (this._isConnected !== isConnected) {
      this._isConnected = isConnected;
      this.onStateChangeCallback(isConnected);
    }
  }

  public setChannel(newChannelName: string | null | undefined) {
    if (this.channelName === newChannelName) {
      return; // No change
    }

    console.log(`Channel changing from ${this.channelName} to ${newChannelName}`);
    this.disconnect(true); // Disconnect intentionally
    this.channelName = newChannelName;
    if (this.channelName) {
      this.connect(); // Connect to the new channel if provided
    }
  }

  public setOnMessage(newOnMessage: (event: string) => void) {
    this.onMessageCallback = newOnMessage;
  }

  public connect() {
    if (!this.channelName || this.ws) {
      // Don't connect if no channel or already connected/connecting
      return;
    }

    this.intentionalClose = false; // Reset flag
    const url = `${WEBSOCKET_BASE_URL}?channel=${this.channelName}`;
    console.log(`Connecting WebSocket to: ${url} (Attempt: ${this.retryCount + 1})`);
    this.ws = new WebSocket(url);

    this.ws.onopen = this.handleOpen;
    this.ws.onmessage = this.handleMessage;
    this.ws.onerror = this.handleError;
    this.ws.onclose = this.handleClose;
  }

  public disconnect(intentional: boolean) {
    console.log(`Disconnect called. Intentional: ${intentional}, Current WS: ${!!this.ws}`);
    this.intentionalClose = intentional;
    this.clearReconnectTimer();
    this.clearKeepAliveTimer();
    if (this.ws) {
      this.ws.close();
      // Ensure state is updated even if onclose doesn't fire immediately or was already closed
      if (this._isConnected) {
          this.setState(false);
      }
      this.ws = null; // Clear reference immediately after calling close
    }
     // Explicitly set state to disconnected if it wasn't already
    this.setState(false);
  }

  private handleOpen = () => {
    console.log(`WebSocket connected to channel: ${this.channelName}`);
    this.setState(true);
    this.retryCount = 0; // Reset retry count on successful connection
    this.clearReconnectTimer(); // Clear any pending reconnect timer
    this.startKeepAlive();
  };

  private handleMessage = (event: MessageEvent) => {
    console.log(`WebSocket message received on channel ${this.channelName}:`, event.data);
    try {
      const data = JSON.parse(event.data);
      // Check if it's the specific keep-alive response from the server
      if (data && data.message === "Forbidden" && data.connectionId && data.requestId) {
        console.log(`Keep-alive pong received on channel ${this.channelName}, ignoring.`);
        return; // Don't call the user's onMessage handler
      }
    } catch (error) {
      // If parsing fails, assume it's not the keep-alive response
      console.warn(`Failed to parse WebSocket message on channel ${this.channelName}:`, error);
    }
    this.onMessageCallback(event.data);
  };

  private handleError = (event: Event) => {
    console.error(`WebSocket error on channel ${this.channelName}:`, event);
    // Reconnection logic is handled in handleClose
  };

  private handleClose = (event: CloseEvent) => {
    console.log(`WebSocket disconnected from channel ${this.channelName}. Code: ${event.code}, Reason: ${event.reason}, Intentional: ${this.intentionalClose}`);
    const previousWs = this.ws; // Capture the closing WebSocket instance
    this.clearKeepAliveTimer(); // Stop keep-alive pings

    // Only update state and attempt reconnect if this specific instance is closing
    if (this.ws === previousWs) {
        this.ws = null; // Clear the reference
        this.setState(false);

        if (!this.intentionalClose) {
            this.scheduleReconnect();
        }
    } else {
        console.log("onclose event received for an already replaced WebSocket instance. Ignoring.");
    }
  };

  private scheduleReconnect() {
    this.clearReconnectTimer(); // Ensure no duplicate timers
    const delay = Math.min(
      INITIAL_RECONNECT_DELAY * Math.pow(2, this.retryCount),
      MAX_RECONNECT_DELAY
    );
    console.log(`Scheduling reconnect for channel ${this.channelName} in ${delay}ms`);
    this.retryCount += 1;
    this.reconnectTimeout = setTimeout(() => {
        // Check if still disconnected and channel exists before attempting reconnect
        if (!this.ws && this.channelName && !this.intentionalClose) {
            this.connect();
        }
    }, delay);
  }

  private startKeepAlive() {
    this.clearKeepAliveTimer(); // Clear any existing timer first
    this.keepAliveInterval = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        console.log(`Sending keep-alive ping to channel: ${this.channelName}`);
        this.ws.send(JSON.stringify({ ping: "keepalive" }));
      } else {
        console.log(`Keep-alive: Connection not open for channel ${this.channelName}, clearing timer.`);
        this.clearKeepAliveTimer();
        // Optional: Consider triggering a reconnect check here if needed
      }
    }, KEEP_ALIVE_INTERVAL);
  }

  private clearKeepAliveTimer() {
    if (this.keepAliveInterval) {
      clearInterval(this.keepAliveInterval);
      this.keepAliveInterval = null;
    }
  }

  private clearReconnectTimer() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
  }
}


export function useWebsocketConnection({
  channelName,
  onMessage,
}: UseWebsocketConnectionOptions): UseWebsocketConnectionResult {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const managerRef = useRef<WebSocketManager | null>(null);

  // Stable callback to update hook state from manager
  const handleStateChange = useCallback((newIsConnectedState: boolean) => {
    setIsConnected(newIsConnectedState);
  }, []);

  // Effect for initialization and cleanup
  useEffect(() => {
    console.log("Mount effect: Creating WebSocketManager instance");
    // Create manager instance only on mount
    managerRef.current = new WebSocketManager(channelName, onMessage, handleStateChange);
    // Sync initial state right after creation
    setIsConnected(managerRef.current.getIsConnected());

    // Return cleanup function
    return () => {
      console.log("Cleanup effect: Disconnecting WebSocketManager");
      managerRef.current?.disconnect(true); // Disconnect intentionally on unmount
      managerRef.current = null; // Clear the ref
    };
    // Empty dependency array ensures this runs only once on mount and cleanup on unmount
    // We pass initial channelName and onMessage here, updates are handled by the next effect.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [handleStateChange]); // Include handleStateChange as it's used in constructor

  // Effect for handling updates to channelName or onMessage after initial mount
  useEffect(() => {
    if (managerRef.current) {
        managerRef.current.setOnMessage(onMessage);
        managerRef.current.setChannel(channelName); // Manager handles connect/disconnect logic internally
    }
  }, [channelName, onMessage]); // Re-run only if channelName or onMessage changes

  return { isConnected };
}