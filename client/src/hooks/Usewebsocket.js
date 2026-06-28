import { useEffect, useRef, useCallback, useState } from 'react';

const BASE_DELAY   = 1000;
const MAX_DELAY    = 30000;
const MAX_ATTEMPTS = 10;

export function useWebSocket(token, onMessage) {
  const wsRef        = useRef(null);
  const attemptsRef  = useRef(0);
  const timeoutRef   = useRef(null);
  const onMessageRef = useRef(onMessage);
  const tokenRef     = useRef(token);

  // Keep refs current without triggering reconnects
  useEffect(() => { onMessageRef.current = onMessage; }, [onMessage]);
  useEffect(() => { tokenRef.current = token; }, [token]);

  const [notification, setNotification] = useState(null);
  const clearNotification = useCallback(() => setNotification(null), []);

  useEffect(() => {
    if (!token) return;

    function connect() {
      // Don't reconnect if already open
      if (wsRef.current?.readyState === WebSocket.OPEN ||
          wsRef.current?.readyState === WebSocket.CONNECTING) return;

      const wsUrl = `${import.meta.env.VITE_WS_URL || 'ws://localhost:5000'}/ws?token=${tokenRef.current}`;
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('WS open');
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
        console.log('WS closed, code:', event.code);
        if (event.code === 1000) return; // intentional, don't reconnect

        attemptsRef.current += 1;
        if (attemptsRef.current > MAX_ATTEMPTS) return;

        const delay = Math.min(BASE_DELAY * 2 ** (attemptsRef.current - 1), MAX_DELAY);
        console.log(`WS reconnecting in ${delay}ms (attempt ${attemptsRef.current})`);
        timeoutRef.current = setTimeout(connect, delay);
      };

      ws.onerror = (err) => {
        console.log('WS error:', err);
        ws.close();
      };
    }

    // Small delay on first connect to ensure token is fully set
    timeoutRef.current = setTimeout(connect, 100);

    return () => {
      clearTimeout(timeoutRef.current);
      if (wsRef.current) {
        wsRef.current.onclose = null; // prevent reconnect on intentional close
        wsRef.current.close(1000, 'cleanup');
        wsRef.current = null;
      }
    };
  }, [token]); 
  return { notification, clearNotification };
}