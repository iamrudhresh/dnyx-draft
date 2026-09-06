import { describe, expect, it } from 'vitest';

// ---------------------------------------------------------------------------
// Trash 30-day retention logic — mirrors the helper in TrashModal.tsx
// ---------------------------------------------------------------------------
const TRASH_RETENTION_DAYS = 30;
const MS_PER_DAY = 24 * 60 * 60 * 1000;
const TRASH_RETENTION_MS = TRASH_RETENTION_DAYS * MS_PER_DAY;

function daysUntilExpiry(trashedAt?: number): number | null {
  if (!trashedAt) return null;
  const elapsed = Date.now() - trashedAt;
  const remaining = TRASH_RETENTION_DAYS - Math.floor(elapsed / MS_PER_DAY);
  return Math.max(0, remaining);
}

function isExpired(trashedAt?: number): boolean {
  if (!trashedAt) return false;
  return Date.now() - trashedAt > TRASH_RETENTION_MS;
}

describe('Trash 30-day retention', () => {
  it('returns null when trashedAt is undefined', () => {
    expect(daysUntilExpiry(undefined)).toBeNull();
  });

  it('returns 30 days for a just-trashed document', () => {
    const trashedAt = Date.now();
    expect(daysUntilExpiry(trashedAt)).toBe(30);
  });

  it('returns 15 days after 15 days in trash', () => {
    const trashedAt = Date.now() - 15 * MS_PER_DAY;
    expect(daysUntilExpiry(trashedAt)).toBe(15);
  });

  it('returns 1 day after 29 days in trash', () => {
    const trashedAt = Date.now() - 29 * MS_PER_DAY;
    expect(daysUntilExpiry(trashedAt)).toBe(1);
  });

  it('returns 0 (not negative) when exactly at expiry boundary', () => {
    const trashedAt = Date.now() - 30 * MS_PER_DAY;
    expect(daysUntilExpiry(trashedAt)).toBe(0);
  });

  it('returns 0 when over-due (31 days in trash)', () => {
    const trashedAt = Date.now() - 31 * MS_PER_DAY;
    expect(daysUntilExpiry(trashedAt)).toBe(0);
  });

  it('isExpired is false for a fresh item', () => {
    expect(isExpired(Date.now())).toBe(false);
  });

  it('isExpired is false at 29 days', () => {
    expect(isExpired(Date.now() - 29 * MS_PER_DAY)).toBe(false);
  });

  it('isExpired is true after 30+ days', () => {
    // 30 days + 1 second
    expect(isExpired(Date.now() - TRASH_RETENTION_MS - 1000)).toBe(true);
  });

  it('isExpired is false when trashedAt is undefined', () => {
    expect(isExpired(undefined)).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Auto-expire filter logic — mirrors what initialize() does in the store
// ---------------------------------------------------------------------------
describe('Auto-expire batch filter', () => {
  it('identifies only documents beyond 30-day threshold', () => {
    const now = Date.now();
    const docs = [
      { id: '1', isTrash: true, trashedAt: now - 31 * MS_PER_DAY }, // expired
      { id: '2', isTrash: true, trashedAt: now - 20 * MS_PER_DAY }, // still valid
      { id: '3', isTrash: true, trashedAt: undefined },              // no timestamp → skip
      { id: '4', isTrash: false, trashedAt: now - 31 * MS_PER_DAY }, // not in trash
    ];

    const expired = docs.filter(
      (d) => d.isTrash && d.trashedAt && now - d.trashedAt > TRASH_RETENTION_MS,
    );

    expect(expired).toHaveLength(1);
    expect(expired[0].id).toBe('1');
  });

  it('returns empty array when no documents are expired', () => {
    const now = Date.now();
    const docs = [
      { id: 'a', isTrash: true, trashedAt: now - 5 * MS_PER_DAY },
      { id: 'b', isTrash: false, trashedAt: now - 35 * MS_PER_DAY },
    ];
    const expired = docs.filter(
      (d) => d.isTrash && d.trashedAt && now - d.trashedAt > TRASH_RETENTION_MS,
    );
    expect(expired).toHaveLength(0);
  });
});
