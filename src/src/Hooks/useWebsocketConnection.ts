import { useEffect, useRef, useState } from 'react';
import { TournamentTimerClock } from '../model/api/tournamentTimers';

const WEBSOCKET_URL = 'wss://decklist.lol/ws';
const RECONNECT_DELAY = 3000;
const PING_INTERVAL = 120000;

type ForbiddenMessage = {
  message: string;
  connectionId: string;
  requestId: string;
}

const isForbiddenMessage = (data: unknown): data is ForbiddenMessage => {
  return (
    typeof data === 'object' &&
    data !== null &&
    'message' in data &&
    'connectionId' in data &&
    'requestId' in data
  );
};

const useDecklistWebSocketConnection = <T>(channelName: string) => {
  const [lastJsonMessage, setLastJsonMessage] = useState<T | undefined>(undefined);
  const [readyState, setReadyState] = useState<number>(WebSocket.CLOSED);

  useEffect(() => {
    let ws: WebSocket | null = null;
    let pingInterval: ReturnType<typeof setInterval>;
    let reconnectTimeout: ReturnType<typeof setTimeout>;
    let disposed = false;

    function connect() {
      const url = `${WEBSOCKET_URL}?channel=${encodeURIComponent(channelName)}`;
      ws = new WebSocket(url);

      ws.onopen = () => {
        console.log('WebSocket: opened connection');
        setReadyState(WebSocket.OPEN);

        pingInterval = setInterval(() => {
          if (ws?.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'PING' }));
          }
        }, PING_INTERVAL);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (isForbiddenMessage(data)) {
            console.log('WebSocket: Ping/Pong');
          } else {
            setLastJsonMessage(data as T);
          }
        } catch {
          console.error('WebSocket: failed to parse message', event.data);
        }
      };

      ws.onclose = () => {
        console.log('WebSocket: closed connection');
        setReadyState(WebSocket.CLOSED);
        clearInterval(pingInterval);
        if (!disposed) {
          reconnectTimeout = setTimeout(connect, RECONNECT_DELAY);
        }
      };

      ws.onerror = (event) => {
        console.error('WebSocket: error:', event);
      };
    }

    connect();

    return () => {
      disposed = true;
      clearTimeout(reconnectTimeout);
      clearInterval(pingInterval);
      ws?.close();
    };
  }, [channelName]);

  return { readyState, lastJsonMessage };
};

type EventUpdatedMessage = {
  updated_by_user_id: string;
  updated_by_session_id: string;
  refresh: boolean;
}

export const useEventUpdated = (effect: (message: EventUpdatedMessage) => void, eventId: string) => {
  const { lastJsonMessage, readyState } = useDecklistWebSocketConnection<EventUpdatedMessage>(`decklist.lol:event:${eventId}`);

  const effectRef = useRef(effect);
  useEffect(() => {
    effectRef.current = effect;
  }, [effect]);

  useEffect(() => {
    if (lastJsonMessage) {
      console.log("WebSocket: EventUpdateEvent Received", lastJsonMessage);
      effectRef.current(lastJsonMessage);
    }
  }, [lastJsonMessage]);

  return { readyState };
}

export enum WebSocketTournamentTimersRefreshMessageType {
  CLOCK_ADDED = "clock_added",
  CLOCK_DELETED = "clock_deleted",
  CLOCK_RESET = "clock_reset",
  CLOCK_PAUSED = "clock_paused",
  CLOCK_RESUMED = "clock_resumed",
  CLOCK_ADJUSTED = "clock_adjusted",
  FORCE_UPDATE = "force_update",
}

type TournamentTimersUpdatedMessage = {
  tournament_id: string;
  updated_by_user_id: string;
  updated_by_session_id: string;
  clock_id: string | null;
  updated_clock: TournamentTimerClock | null;
  message_type: WebSocketTournamentTimersRefreshMessageType;
}

export const useTournamentTimersUpdated = (effect: (message: TournamentTimersUpdatedMessage) => void, tournamentId: string) => {
  const { lastJsonMessage, readyState } = useDecklistWebSocketConnection<TournamentTimersUpdatedMessage>(`decklist.lol:timers:tournament:${tournamentId}`);

  const effectRef = useRef(effect);
  useEffect(() => {
    effectRef.current = effect;
  }, [effect]);

  useEffect(() => {
    if (lastJsonMessage) {
      effectRef.current(lastJsonMessage);
    }
  }, [lastJsonMessage]);

  return { readyState };
}
