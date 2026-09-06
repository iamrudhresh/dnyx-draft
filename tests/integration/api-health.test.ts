import { describe, expect, it } from 'vitest';
import { GET } from '@/app/api/health/route';

// ---------------------------------------------------------------------------
// GET /api/health
// ---------------------------------------------------------------------------
describe('GET /api/health', () => {
  it('returns HTTP 200', async () => {
    const res = await GET();
    expect(res.status).toBe(200);
  });

  it('returns JSON content-type', async () => {
    const res = await GET();
    expect(res.headers.get('content-type')).toMatch(/application\/json/);
  });

  it('body has status "healthy"', async () => {
    const res = await GET();
    const body = await res.json();
    expect(body.status).toBe('healthy');
  });

  it('body includes app name and version', async () => {
    const res = await GET();
    const body = await res.json();
    expect(body.app).toBe('Dnyx Draft');
    expect(body.version).toBe('4.0.0');
  });

  it('body has a valid ISO timestamp', async () => {
    const before = Date.now();
    const res = await GET();
    const after = Date.now();
    const body = await res.json();
    const ts = new Date(body.timestamp).getTime();
    expect(ts).toBeGreaterThanOrEqual(before);
    expect(ts).toBeLessThanOrEqual(after);
  });

  it('body mentions the Next.js engine', async () => {
    const res = await GET();
    const body = await res.json();
    expect(body.engine).toMatch(/Next\.js/i);
  });
});
