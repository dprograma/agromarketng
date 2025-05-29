import { NextRequest } from 'next/server';
import { Server as NetServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { WebSocketServer } from 'ws';
import jwt from 'jsonwebtoken';
import { initSocket } from '@/lib/socket';

interface SocketServer extends NetServer {
  io?: SocketIOServer;
}

interface SocketResponse extends Response {
  socket: {
    server: SocketServer;
    webSocket: WebSocketServer;
  };
}

export async function GET(req: NextRequest) {
  const upgrade = req.headers.get('upgrade');

  if (upgrade?.toLowerCase() === 'websocket') {
    try {
      const res = new Response(null, {
        status: 101,
      }) as SocketResponse;

      const server = res.socket.server;

      // Use our enhanced socket implementation
      initSocket(server);

      return res;
    } catch (error) {
      console.error('WebSocket initialization error:', error);
      return new Response('WebSocket initialization failed', { status: 500 });
    }
  }

  return new Response('WebSocket upgrade required', { status: 426 });
}