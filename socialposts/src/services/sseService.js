/**
 * Server-Sent Events (SSE) service.
 * Pushes real-time events to connected browser clients.
 */

const clients = new Set();

/** Register a new SSE client response object. */
function addClient(res) {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.flushHeaders();

  // Send a heartbeat immediately so the connection is established
  res.write('event: connected\ndata: {}\n\n');

  clients.add(res);

  // Keep-alive ping every 25 seconds
  const ping = setInterval(() => {
    if (res.writableEnded) {
      clearInterval(ping);
      clients.delete(res);
    } else {
      res.write(':ping\n\n');
    }
  }, 25000);

  res.on('close', () => {
    clearInterval(ping);
    clients.delete(res);
    console.log(`[SSE] Client disconnected. Active: ${clients.size}`);
  });

  console.log(`[SSE] Client connected. Active: ${clients.size}`);
}

/**
 * Broadcast an event to all connected SSE clients.
 * @param {string} event  - event name (e.g. 'batch_generated', 'post_published')
 * @param {object} data   - payload object (will be JSON-serialised)
 */
function broadcast(event, data = {}) {
  const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  for (const res of clients) {
    if (!res.writableEnded) {
      res.write(payload);
    } else {
      clients.delete(res);
    }
  }
  if (clients.size > 0) {
    console.log(`[SSE] Broadcast "${event}" to ${clients.size} client(s)`);
  }
}

module.exports = { addClient, broadcast };
