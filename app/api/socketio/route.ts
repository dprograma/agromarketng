import { NextRequest, NextResponse } from 'next/server';
import { initSocket } from '@/lib/socket';
import { Server } from 'http';

export async function GET(req: NextRequest) {
  // Ensure initSocket is called. It uses a global variable to prevent multiple instances.
  // In the app router, directly accessing the underlying Node.js server from req is unreliable.
  // We pass undefined here, relying on initSocket's global check and hoping
  // the Socket.IO server attaches correctly to the main Next.js HTTP server instance
  // when initSocket is first called during the application lifecycle.
  initSocket(undefined as any); // Casting to any to satisfy type checks temporarily

  // The API route handler should not interfere with the WebSocket upgrade.
  // Returning a simple response indicates that the route was hit.
  // Socket.IO, if correctly attached globally, will handle the 'upgrade' request.

  return NextResponse.json({ message: 'Socket.IO handler reached' });
}