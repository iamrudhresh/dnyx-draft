import { type NextRequest, NextResponse } from 'next/server';

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

// In-memory store — works for development and single-instance deploys.
// For multi-instance production, replace with Redis or Cloudflare Durable Objects.
const rooms = new Map<string, Room>();

// Prune stale participants older than 30s and rooms older than 6h
function pruneRooms() {
  const now = Date.now();
  for (const [id, room] of rooms) {
    room.participants = room.participants.filter((p) => now - p.lastSeen < 30_000);
    if (now - room.createdAt > 6 * 60 * 60 * 1000) rooms.delete(id);
  }
}

// POST /api/live-room — create a new room
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { content, title, hostName, hostId, accessMode } = body;

  if (!content || !hostId) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  pruneRooms();

  const roomId = Math.random().toString(36).slice(2, 10);
  const room: Room = {
    id: roomId,
    title: title ?? 'Untitled',
    content: content ?? '',
    accessMode: accessMode ?? 'edit',
    participants: [{ id: hostId, name: hostName ?? 'Host', role: 'host', lastSeen: Date.now() }],
    lastUpdatedBy: hostId,
    createdAt: Date.now(),
  };
  rooms.set(roomId, room);

  return NextResponse.json({ roomId });
}

// GET /api/live-room?id=&clientId=&name=&role= — join/poll room
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  const clientId = searchParams.get('clientId');
  const name = searchParams.get('name');
  const role = (searchParams.get('role') as 'editor' | 'viewer') ?? 'editor';

  if (!id || !clientId) {
    return NextResponse.json({ error: 'Missing id or clientId' }, { status: 400 });
  }

  const room = rooms.get(id);
  if (!room) {
    return NextResponse.json({ error: 'Room not found' }, { status: 404 });
  }

  // Upsert participant
  const existing = room.participants.find((p) => p.id === clientId);
  if (existing) {
    existing.lastSeen = Date.now();
    if (name) existing.name = name;
  } else if (name) {
    const participantRole = room.accessMode === 'view' ? 'viewer' : role;
    room.participants.push({ id: clientId, name, role: participantRole, lastSeen: Date.now() });
  }

  pruneRooms();

  return NextResponse.json({
    content: room.content,
    title: room.title,
    accessMode: room.accessMode,
    participants: room.participants.map(({ id: pid, name: pname, role: prole }) => ({
      id: pid,
      name: pname,
      role: prole,
    })),
  });
}

// PATCH /api/live-room — push content update
export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const { roomId, content, clientId } = body;

  if (!roomId || content === undefined || !clientId) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const room = rooms.get(roomId);
  if (!room) {
    return NextResponse.json({ error: 'Room not found' }, { status: 404 });
  }

  // Only allow edits from hosts or editors when room is in edit mode
  const participant = room.participants.find((p) => p.id === clientId);
  if (
    participant &&
    (participant.role === 'host' || (participant.role === 'editor' && room.accessMode === 'edit'))
  ) {
    room.content = content;
    room.lastUpdatedBy = clientId;
  }

  return NextResponse.json({ ok: true });
}

// DELETE /api/live-room — close room
export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (id) rooms.delete(id);
  return NextResponse.json({ ok: true });
}
