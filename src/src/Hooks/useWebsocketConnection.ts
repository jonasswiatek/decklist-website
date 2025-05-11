import { useEffect, useRef } from 'react';
import useWebSocket from 'react-use-websocket';

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
  updatedBy: string;
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
  const { lastJsonMessage } = useDecklistWebSocketConnection<EventUpdatedMessage | ForbiddenMessage>(`decklist.lol:event:${eventId}`);
  
  const effectRef = useRef(effect);
  useEffect(() => {
    effectRef.current = effect;
  }, [effect]);

  useEffect(() => {
    if (lastJsonMessage && !isForbiddenMessage(lastJsonMessage) && 'updatedBy' in lastJsonMessage) {
      console.log("WebSocket: EventUpdateEvent Received", lastJsonMessage);
      effectRef.current(lastJsonMessage as EventUpdatedMessage);
    } else if (lastJsonMessage && isForbiddenMessage(lastJsonMessage)) {
      console.log("WebSocket: Ping/Pong");
    }
  }, [lastJsonMessage]); 
}