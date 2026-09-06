import { type NextRequest } from 'next/server';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { DELETE, GET, PATCH, POST } from '@/app/api/live-room/route';

// The live-room route uses an in-memory Map at module scope.
// We cannot clear it between tests directly, so we create fresh room IDs
// per test to keep tests isolated.

function makePostReq(body: object): NextRequest {
  return new Request('http://localhost/api/live-room', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  }) as unknown as NextRequest;
}

function makeGetReq(params: Record<string, string>): NextRequest {
  const qs = new URLSearchParams(params).toString();
  return new Request(`http://localhost/api/live-room?${qs}`) as unknown as NextRequest;
}

function makePatchReq(body: object): NextRequest {
  return new Request('http://localhost/api/live-room', {
    method: 'PATCH',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  }) as unknown as NextRequest;
}

function makeDeleteReq(id: string): NextRequest {
  return new Request(
    `http://localhost/api/live-room?id=${encodeURIComponent(id)}`,
    { method: 'DELETE' },
  ) as unknown as NextRequest;
}

// ---------------------------------------------------------------------------
// POST — create room
// ---------------------------------------------------------------------------
describe('POST /api/live-room', () => {
  it('creates a room and returns a roomId', async () => {
    const res = await POST(makePostReq({
      content: '# Hello',
      title: 'My Room',
      hostName: 'Alice',
      hostId: 'host-1',
      accessMode: 'edit',
    }));

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(typeof body.roomId).toBe('string');
    expect(body.roomId.length).toBeGreaterThan(0);
  });

  it('returns 400 when content is missing', async () => {
    const res = await POST(makePostReq({ hostId: 'host-1' }));
    expect(res.status).toBe(400);
  });

  it('returns 400 when hostId is missing', async () => {
    const res = await POST(makePostReq({ content: '# Hi' }));
    expect(res.status).toBe(400);
  });

  it('defaults title to "Untitled" when omitted', async () => {
    const res = await POST(makePostReq({ content: '# Hi', hostId: 'h1' }));
    const { roomId } = await res.json();

    const getRes = await GET(makeGetReq({ id: roomId, clientId: 'h1' }));
    const room = await getRes.json();
    expect(room.title).toBe('Untitled');
  });
});

// ---------------------------------------------------------------------------
// GET — join / poll room
// ---------------------------------------------------------------------------
describe('GET /api/live-room', () => {
  let roomId: string;

  beforeEach(async () => {
    const res = await POST(makePostReq({
      content: '# Initial',
      title: 'Test Room',
      hostName: 'Host',
      hostId: 'host-get',
      accessMode: 'edit',
    }));
    ({ roomId } = await res.json());
  });

  it('returns room content for a known room', async () => {
    const res = await GET(makeGetReq({ id: roomId, clientId: 'host-get' }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.content).toBe('# Initial');
    expect(body.title).toBe('Test Room');
  });

  it('returns 404 for an unknown room id', async () => {
    const res = await GET(makeGetReq({ id: 'no-such-room', clientId: 'x' }));
    expect(res.status).toBe(404);
  });

  it('returns 400 when id is missing', async () => {
    const res = await GET(makeGetReq({ clientId: 'x' }));
    expect(res.status).toBe(400);
  });

  it('returns 400 when clientId is missing', async () => {
    const res = await GET(makeGetReq({ id: roomId }));
    expect(res.status).toBe(400);
  });

  it('adds a new participant when a name is supplied', async () => {
    await GET(makeGetReq({ id: roomId, clientId: 'viewer-1', name: 'Bob', role: 'viewer' }));

    const res = await GET(makeGetReq({ id: roomId, clientId: 'host-get' }));
    const { participants } = await res.json();
    const names = participants.map((p: { name: string }) => p.name);
    expect(names).toContain('Bob');
  });

  it('returns participants list without lastSeen field', async () => {
    const res = await GET(makeGetReq({ id: roomId, clientId: 'host-get' }));
    const { participants } = await res.json();
    for (const p of participants) {
      expect(p).not.toHaveProperty('lastSeen');
    }
  });
});

// ---------------------------------------------------------------------------
// PATCH — push content update
// ---------------------------------------------------------------------------
describe('PATCH /api/live-room', () => {
  let roomId: string;

  beforeEach(async () => {
    const res = await POST(makePostReq({
      content: '# Before',
      title: 'Patch Room',
      hostName: 'Host',
      hostId: 'host-patch',
      accessMode: 'edit',
    }));
    ({ roomId } = await res.json());
  });

  it('updates content and returns { ok: true }', async () => {
    const res = await PATCH(makePatchReq({
      roomId,
      content: '# After',
      clientId: 'host-patch',
    }));

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.ok).toBe(true);

    // Verify the content changed
    const getRes = await GET(makeGetReq({ id: roomId, clientId: 'host-patch' }));
    const room = await getRes.json();
    expect(room.content).toBe('# After');
  });

  it('returns 400 when roomId is missing', async () => {
    const res = await PATCH(makePatchReq({ content: '# X', clientId: 'host-patch' }));
    expect(res.status).toBe(400);
  });

  it('returns 400 when clientId is missing', async () => {
    const res = await PATCH(makePatchReq({ roomId, content: '# X' }));
    expect(res.status).toBe(400);
  });

  it('returns 404 for an unknown roomId', async () => {
    const res = await PATCH(makePatchReq({
      roomId: 'no-room',
      content: '# X',
      clientId: 'host-patch',
    }));
    expect(res.status).toBe(404);
  });

  it('ignores updates from unknown participants (content unchanged)', async () => {
    await PATCH(makePatchReq({
      roomId,
      content: '# Unauthorized edit',
      clientId: 'unknown-stranger',
    }));

    const getRes = await GET(makeGetReq({ id: roomId, clientId: 'host-patch' }));
    const room = await getRes.json();
    expect(room.content).toBe('# Before');
  });
});

// ---------------------------------------------------------------------------
// DELETE — close room
// ---------------------------------------------------------------------------
describe('DELETE /api/live-room', () => {
  it('deletes the room and subsequent GET returns 404', async () => {
    const createRes = await POST(makePostReq({
      content: '# To delete',
      hostId: 'host-del',
    }));
    const { roomId } = await createRes.json();

    const delRes = await DELETE(makeDeleteReq(roomId));
    expect(delRes.status).toBe(200);
    expect((await delRes.json()).ok).toBe(true);

    const getRes = await GET(makeGetReq({ id: roomId, clientId: 'host-del' }));
    expect(getRes.status).toBe(404);
  });

  it('returns ok:true even when deleting a non-existent room', async () => {
    const res = await DELETE(makeDeleteReq('ghost-room'));
    expect(res.status).toBe(200);
    expect((await res.json()).ok).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Full round-trip: create → join → edit → poll → delete
// ---------------------------------------------------------------------------
describe('Live-room full round-trip', () => {
  it('completes a host-creates, viewer-joins, host-edits, viewer-sees flow', async () => {
    // 1. Host creates room
    const createRes = await POST(makePostReq({
      content: '# Draft',
      title: 'Collaboration',
      hostName: 'Alice',
      hostId: 'alice',
      accessMode: 'edit',
    }));
    const { roomId } = await createRes.json();

    // 2. Viewer joins
    await GET(makeGetReq({ id: roomId, clientId: 'bob', name: 'Bob', role: 'viewer' }));

    // 3. Host edits
    await PATCH(makePatchReq({ roomId, content: '# Final', clientId: 'alice' }));

    // 4. Viewer polls and sees updated content
    const pollRes = await GET(makeGetReq({ id: roomId, clientId: 'bob', name: 'Bob' }));
    const room = await pollRes.json();
    expect(room.content).toBe('# Final');
    expect(room.participants.map((p: { name: string }) => p.name)).toContain('Bob');

    // 5. Host closes room
    await DELETE(makeDeleteReq(roomId));
    const finalRes = await GET(makeGetReq({ id: roomId, clientId: 'alice' }));
    expect(finalRes.status).toBe(404);
  });
});
