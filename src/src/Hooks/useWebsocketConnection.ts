import { useEffect, useRef, useState } from 'react';
import useWebSocket from 'react-use-websocket';
import { TournamentTimerClock } from '../model/api/tournamentTimers';

const WEBSOCKET_URL = 'wss://decklist.lol/ws';
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
  const { sendJsonMessage, readyState, lastJsonMessage: webSocketLastMessage } = useWebSocket<T | undefined>(WEBSOCKET_URL, {
    queryParams: { channel: channelName },
    onOpen: () => console.log('WebSocket: opened connection'),
    onClose: () => console.log('WebSocket: closed connection'),
    onError: (event) => console.error('WebSocket: error:', event),
    shouldReconnect: () => true,
    heartbeat: {
      interval: 1200000,
      timeout: 130000,
    }
  });

  useEffect(() => {
    if (webSocketLastMessage) {
      if (isForbiddenMessage(webSocketLastMessage)) {
        console.log("WebSocket: Ping/Pong");
      } else {
        setLastJsonMessage(webSocketLastMessage as T);
      }
    }
  }, [webSocketLastMessage, setLastJsonMessage]);

  //The ping feature of react-use-websocket is not reliable, so we implement our own ping mechanism
  useEffect(() => {
    if (readyState === WebSocket.OPEN) {
      console.log("WebSocket: Starting ping interval");
      const intervalId = setInterval(() => {
        sendJsonMessage({ type: 'PING' });
      }, 120000);

      return () => {
        console.log("WebSocket: Stopping ping interval");
        clearInterval(intervalId);
      };
    }
  }, [readyState, sendJsonMessage]);

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