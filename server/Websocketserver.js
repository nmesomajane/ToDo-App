import { WebSocketServer } from 'ws';
import jwt from 'jsonwebtoken';
import { registerClient, removeClient } from './utils/websocket.js';
import logger from './utils/logger.js';

export function initWebSocketServer(httpServer) {
  const wss = new WebSocketServer({ noServer: true });

  httpServer.on('upgrade', (request, socket, head) => {
    const url = new URL(request.url, `http://${request.headers.host}`);
    const token = url.searchParams.get('token');

    if (!token) {
      socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
      socket.destroy();
      return;
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('WS decoded:', decoded); // temp debug
    } catch (err) {
      socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
      socket.destroy();
      return;
    }

    // Your JWT uses userId as the key
    const userId = decoded.userId;
    console.log('WS userId extracted:', userId); // temp debug

    if (!userId) {
      socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
      socket.destroy();
      return;
    }

    // Attach to request BEFORE handleUpgrade
    request.userId = userId;

    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit('connection', ws, request);
    });
  });

  wss.on('connection', (ws, request) => {
    const userId = request.userId;
    console.log('WS connection handler userId:', userId); // temp debug

    registerClient(userId, ws);
    logger.info(`WS connected: user ${userId}`);

    ws.send(JSON.stringify({ type: 'connected', message: 'WebSocket ready' }));

    ws.on('close', () => {
      removeClient(userId, ws);
      logger.info(`WS disconnected: user ${userId}`);
    });

    ws.on('error', (err) => {
      logger.error(`WS error for user ${userId}:`, err.message);
      removeClient(userId, ws);
    });
  });

  logger.info('WebSocket server initialised');
  return wss;
}