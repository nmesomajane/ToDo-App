
const clients = new Map(); 

export function registerClient(user, ws) {
  if (!clients.has(user)) {
    clients.set(user, new Set());
  }
  clients.get(user).add(ws);
}



export function removeClient(user, ws) {
  const sockets = clients.get(user);
  if (sockets) {
    sockets.delete(ws);
    if (sockets.size === 0) {
      clients.delete(user);
    }
  }
}


export function sendToUser(user, payload) {
  const sockets = clients.get(String(user));
  if (!sockets || sockets.size === 0) return; // user offline — skip

  const message = JSON.stringify(payload);
  for (const ws of sockets) {
    // ws.readyState === 1 means OPEN
    if (ws.readyState === 1) {
      ws.send(message);
    }
  }
}


export function isUserOnline(user) {
  const sockets = clients.get(String(user));
  return sockets && sockets.size > 0;
}