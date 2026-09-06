/**
 * Cloudflare Pages Function: /api/live-room
 *
 * This function handles the Live Share polling API at the edge, routing
 * POST / GET / PATCH / DELETE requests for collaborative editing rooms.
 *
 * The in-memory Map persists within a single Cloudflare Worker isolate.
 * For multi-region persistence, swap the Map for Cloudflare KV or a
 * Durable Object — the API contract remains identical.
 */

interface Participant {
  id: string;
  name: string;
  role: 'host' | 'editor' | 'viewer';
  lastSeen: number;
}

interface Room {
  id: string;
  title: string;
  content: string;
  accessMode: 'edit' | 'view';
  participants: Participant[];
  lastUpdatedBy: string;
  createdAt: number;
}

// Worker-scoped in-memory store (survives across requests in the same isolate).
const rooms = new Map<string, Room>();

function pruneRooms() {
  const now = Date.now();
  for (const [id, room] of rooms) {
    room.participants = room.participants.filter((p) => now - p.lastSeen < 30_000);
    if (now - room.createdAt > 6 * 60 * 60 * 1000) rooms.delete(id);
  }
}

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  });
}

export const onRequestOptions: PagesFunction = async () => {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
};

export const onRequestPost: PagesFunction = async ({ request }) => {
  const body = await request.json<{
    content: string;
    title?: string;
    hostName?: string;
    hostId: string;
    accessMode?: 'edit' | 'view';
  }>();
  const { content, title, hostName, hostId, accessMode } = body;

  if (!content || !hostId) {
    return json({ error: 'Missing required fields' }, 400);
  }

  pruneRooms();

  const roomId = Math.random().toString(36).slice(2, 10);
  const room: Room = {
    id: roomId,
    title: title ?? 'Untitled',
    content,
    accessMode: accessMode ?? 'edit',
    participants: [{ id: hostId, name: hostName ?? 'Host', role: 'host', lastSeen: Date.now() }],
    lastUpdatedBy: hostId,
    createdAt: Date.now(),
  };
  rooms.set(roomId, room);

  return json({ roomId });
};

export const onRequestGet: PagesFunction = async ({ request }) => {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  const clientId = searchParams.get('clientId');
  const name = searchParams.get('name');
  const role = (searchParams.get('role') as 'editor' | 'viewer') ?? 'editor';

  if (!id || !clientId) {
    return json({ error: 'Missing id or clientId' }, 400);
  }

  const room = rooms.get(id);
  if (!room) {
    return json({ error: 'Room not found' }, 404);
  }

  const existing = room.participants.find((p) => p.id === clientId);
  if (existing) {
    existing.lastSeen = Date.now();
    if (name) existing.name = name;
  } else if (name) {
    const participantRole = room.accessMode === 'view' ? 'viewer' : role;
    room.participants.push({ id: clientId, name, role: participantRole, lastSeen: Date.now() });
  }

  pruneRooms();

  return json({
    content: room.content,
    title: room.title,
    accessMode: room.accessMode,
    participants: room.participants.map(({ id: pid, name: pname, role: prole }) => ({
      id: pid,
      name: pname,
      role: prole,
    })),
  });
};

export const onRequestPatch: PagesFunction = async ({ request }) => {
  const body = await request.json<{ roomId: string; content: string; clientId: string }>();
  const { roomId, content, clientId } = body;

  if (!roomId || content === undefined || !clientId) {
    return json({ error: 'Missing required fields' }, 400);
  }

  const room = rooms.get(roomId);
  if (!room) {
    return json({ error: 'Room not found' }, 404);
  }

  const participant = room.participants.find((p) => p.id === clientId);
  if (
    participant &&
    (participant.role === 'host' || (participant.role === 'editor' && room.accessMode === 'edit'))
  ) {
    room.content = content;
    room.lastUpdatedBy = clientId;
  }

  return json({ ok: true });
};

export const onRequestDelete: PagesFunction = async ({ request }) => {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (id) rooms.delete(id);
  return json({ ok: true });
};
