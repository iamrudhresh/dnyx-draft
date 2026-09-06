import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { GET } from '@/app/api/share/[id]/route';
import { POST } from '@/app/api/share/route';
import { snapshots } from '@/lib/share-store';

// Clear the in-memory store before and after each test to keep tests isolated.
beforeEach(() => snapshots.clear());
afterEach(() => snapshots.clear());

// ---------------------------------------------------------------------------
// POST /api/share — create a snapshot
// ---------------------------------------------------------------------------
describe('POST /api/share', () => {
  it('creates a snapshot and returns id + expiresAt', async () => {
    const req = new Request('http://localhost/api/share', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ title: 'My Note', content: '# Hello' }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.id).toBeTruthy();
    expect(typeof body.expiresAt).toBe('number');
    expect(body.expiresAt).toBeGreaterThan(Date.now());
  });

  it('stores snapshot in the in-memory map', async () => {
    const req = new Request('http://localhost/api/share', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ title: 'Stored Note', content: '# Content' }),
    });

    const res = await POST(req);
    const { id } = await res.json();

    expect(snapshots.has(id)).toBe(true);
    expect(snapshots.get(id)?.title).toBe('Stored Note');
  });

  it('uses 30-day default expiry', async () => {
    const req = new Request('http://localhost/api/share', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ title: 'Default expiry', content: '# Hi' }),
    });

    const before = Date.now();
    const res = await POST(req);
    const { expiresAt } = await res.json();

    const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
    expect(expiresAt).toBeGreaterThanOrEqual(before + thirtyDaysMs - 100);
  });

  it('accepts custom expiresInDays', async () => {
    const req = new Request('http://localhost/api/share', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ title: 'Short link', content: '# Hi', expiresInDays: 7 }),
    });

    const before = Date.now();
    const res = await POST(req);
    const { expiresAt } = await res.json();

    const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
    expect(expiresAt).toBeGreaterThanOrEqual(before + sevenDaysMs - 100);
    expect(expiresAt).toBeLessThan(before + 8 * 24 * 60 * 60 * 1000);
  });

  it('returns 400 for missing title', async () => {
    const req = new Request('http://localhost/api/share', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ content: '# No title' }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('returns 400 for empty content', async () => {
    const req = new Request('http://localhost/api/share', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ title: 'Valid title', content: '' }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('returns 400 when expiresInDays exceeds 90', async () => {
    const req = new Request('http://localhost/api/share', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ title: 'Too long', content: '# Hi', expiresInDays: 91 }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
  });
});

// ---------------------------------------------------------------------------
// GET /api/share/[id] — fetch a snapshot
// ---------------------------------------------------------------------------
describe('GET /api/share/[id]', () => {
  async function createSnapshot(title = 'Test', content = '# Content', expiresInDays = 30) {
    const req = new Request('http://localhost/api/share', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ title, content, expiresInDays }),
    });
    const res = await POST(req);
    return res.json() as Promise<{ id: string; expiresAt: number }>;
  }

  it('returns the snapshot for a valid id', async () => {
    const { id } = await createSnapshot('Hello Note', '# Hello');

    const res = await GET(new Request(`http://localhost/api/share/${id}`), {
      params: Promise.resolve({ id }),
    });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.title).toBe('Hello Note');
    expect(body.content).toBe('# Hello');
    expect(body.id).toBe(id);
  });

  it('returns 404 for an unknown id', async () => {
    const res = await GET(new Request('http://localhost/api/share/nonexistent-id'), {
      params: Promise.resolve({ id: 'nonexistent-id' }),
    });

    expect(res.status).toBe(404);
  });

  it('returns 410 Gone for an expired snapshot', async () => {
    const id = 'expired-snap';
    // Manually insert an already-expired snapshot
    snapshots.set(id, {
      id,
      title: 'Old',
      content: '# Old',
      createdAt: Date.now() - 31 * 24 * 60 * 60 * 1000,
      expiresAt: Date.now() - 1000, // expired 1 s ago
    });

    const res = await GET(new Request(`http://localhost/api/share/${id}`), {
      params: Promise.resolve({ id }),
    });

    expect(res.status).toBe(410);
    // The expired snapshot should be removed from the store
    expect(snapshots.has(id)).toBe(false);
  });

  it('response body includes createdAt and expiresAt timestamps', async () => {
    const { id } = await createSnapshot();

    const res = await GET(new Request(`http://localhost/api/share/${id}`), {
      params: Promise.resolve({ id }),
    });

    const body = await res.json();
    expect(typeof body.createdAt).toBe('number');
    expect(typeof body.expiresAt).toBe('number');
  });
});
