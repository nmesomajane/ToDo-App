// hooks/useWebSocket.js
import { useEffect, useRef, useCallback, useState } from 'react';

const BASE_DELAY   = 1000;
const MAX_DELAY    = 30000;
const MAX_ATTEMPTS = 10;

export function useWebSocket(token, onMessage) {
  const wsRef        = useRef(null);
  const attemptsRef  = useRef(0);
  const timeoutRef   = useRef(null);
  const onMessageRef = useRef(onMessage);

  // Keep onMessageRef current without re-running the effect
  useEffect(() => { onMessageRef.current = onMessage; }, [onMessage]);

  const [notification, setNotification] = useState(null);
  const clearNotification = useCallback(() => setNotification(null), []);

  useEffect(() => {
    if (!token) return;

    // Plain function inside the effect — can reference itself freely
    function connect() {
      if (wsRef.current?.readyState === WebSocket.OPEN) return;

      const wsUrl = `${import.meta.env.VITE_WS_URL || 'ws://localhost:5000'}/ws?token=${token}`;
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        attemptsRef.current = 0;
      };

      ws.onmessage = (event) => {
        let data;
        try { data = JSON.parse(event.data); } catch { return; }

        if (data.type === 'connected') return;

        if (data.type === 'TASK_OVERDUE' || data.type === 'TASK_COMPLETED') {
          setNotification({ id: Date.now(), type: data.type, title: data.title, message: data.message });
        }

        onMessageRef.current?.(data);
      };

      ws.onclose = (event) => {
        if (event.code === 1000) return; // intentional close, don't reconnect

        attemptsRef.current += 1;
        if (attemptsRef.current > MAX_ATTEMPTS) return;

        const delay = Math.min(BASE_DELAY * 2 ** (attemptsRef.current - 1), MAX_DELAY);
        timeoutRef.current = setTimeout(connect, delay); // ✅ plain function, no circular dep
      };

      ws.onerror = () => ws.close();
    }

    connect();

    return () => {
      clearTimeout(timeoutRef.current);
      // Code 1000 = normal closure, suppresses reconnect in onclose
      wsRef.current?.close(1000, 'effect cleanup');
    };
  }, [token]); // re-runs on login/logout

  return { notification, clearNotification };
}