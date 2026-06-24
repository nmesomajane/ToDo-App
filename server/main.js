import {websocket } from 'websocket';
import jwt from 'jsonwebtoken';

const wss = new WebSocketServer({ host: 'localhost', port: 5000 }); 
const clients = new Map(); // userId → ws

wss.on('connection', (ws, req) => {
  const token = new URL(req.url, 'http://localhost:5000').searchParams.get('token');
  try {
    const { id } = jwt.verify(token, process.env.JWT_SECRET);
    clients.set(id, ws);
    ws.on('close', () => clients.delete(id));
  } catch {
    ws.close(1008, 'Unauthorized');
  }
});

// helper you call from your cron job or controller
const notifyUser = (userId, payload) => {
  const ws = clients.get(userId);
  if (ws?.readyState === 1) ws.send(JSON.stringify(payload));
};