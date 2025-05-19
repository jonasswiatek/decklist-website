import { useEffect, useRef } from 'react';
import useWebSocket from 'react-use-websocket';
import { TournamentTimerClock } from '../model/api/tournamentTimers';

const WEBSOCKET_URL = 'wss://decklist.lol/ws';
export const useDecklistWebSocketConnection = <T>(channelName: string) => {
  return useWebSocket<T | undefined>(WEBSOCKET_URL, {
    queryParams: { channel: channelName },
    onOpen: () => console.log('WebSocket: opened connection'),
    onClose: () => console.log('WebSocket: closed connection'),
    onError: (event) => console.error('WebSocket: error:', event),
    shouldReconnect: () => true,
    heartbeat: {
      message: "PING",
      interval: 50000,
      timeout: 60000,
    }
  });
};

type EventUpdatedMessage = {
  updated_by_user_id: string;
  updated_by_session_id: string;
  refresh: boolean;
}

type ForbiddenMessage = {
  message: string;
  connectionId: string;
  requestId: string;
}

export const isForbiddenMessage = (data: unknown): data is ForbiddenMessage => {
  return (
    typeof data === 'object' &&
    data !== null &&
    'message' in data &&
    'connectionId' in data &&
    'requestId' in data
  );
};

export const useEventUpdated = (effect: (message: EventUpdatedMessage) => void, eventId: string) => {
  const { lastJsonMessage, readyState } = useDecklistWebSocketConnection<EventUpdatedMessage | ForbiddenMessage>(`decklist.lol:event:${eventId}`);
  
  const effectRef = useRef(effect);
  useEffect(() => {
    effectRef.current = effect;
  }, [effect]);

  useEffect(() => {
    if (lastJsonMessage && !isForbiddenMessage(lastJsonMessage)) {
      console.log("WebSocket: EventUpdateEvent Received", lastJsonMessage);
      effectRef.current(lastJsonMessage as EventUpdatedMessage);
    } else if (lastJsonMessage && isForbiddenMessage(lastJsonMessage)) {
      console.log("WebSocket: Ping/Pong");
    }
  }, [lastJsonMessage]);

  return { readyState };
}

type TournamentTimersUpdatedMessage = {
  tournament_id: string;
  updated_by_user_id: string;
  updated_by_session_id: string;
  clock_id: string;
  updated_clock: TournamentTimerClock;
}

export const useTournamentTimersUpdated = (effect: (message: TournamentTimersUpdatedMessage) => void, tournamentId: string) => {
  const { lastJsonMessage, readyState } = useDecklistWebSocketConnection<TournamentTimersUpdatedMessage | ForbiddenMessage>(`decklist.lol:timers:tournament:${tournamentId}`);
  
  const effectRef = useRef(effect);
  useEffect(() => {
    effectRef.current = effect;
  }, [effect]);

  useEffect(() => {
    if (lastJsonMessage && !isForbiddenMessage(lastJsonMessage)) {
      effectRef.current(lastJsonMessage as TournamentTimersUpdatedMessage);
    } else if (lastJsonMessage && isForbiddenMessage(lastJsonMessage)) {
      console.log("WebSocket: Ping/Pong");
    }
  }, [lastJsonMessage]);
  
  return { readyState };
}