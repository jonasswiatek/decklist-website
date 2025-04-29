import { useEffect, useRef } from 'react';
import useWebSocket from 'react-use-websocket';

const WEBSOCKET_URL = 'wss://decklist.lol/ws';
export const useDecklistWebSocketConnection = <T>(channelName: string) => {
  const isPingMessage = (message: string) => {
    try {
      const parsedMessage = JSON.parse(message);
      return parsedMessage && parsedMessage.message === 'Forbidden' && parsedMessage.connectionId && parsedMessage.requestId;
    } catch (e) {
      return false;
    }
  };

  return useWebSocket<T | undefined>(WEBSOCKET_URL, {
    queryParams: { channel: channelName },
    onOpen: () => console.log('WebSocket: opened connection'),
    onClose: () => console.log('WebSocket: closed connection'),
    onError: (event) => console.error('WebSocket: error:', event),
    shouldReconnect: () => true,
    filter: (message) => !isPingMessage(message.data),
  });
};

type EventUpdatedMessage = {
  updatedBy: string;
  refresh: boolean;
}

export const useEventUpdated = (effect: (message: EventUpdatedMessage) => void, eventId: string) => {
  const { lastJsonMessage } = useDecklistWebSocketConnection<EventUpdatedMessage>(`decklist.lol:event:${eventId}`);
  
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
}