import { nanoid } from 'nanoid';
import { NextResponse } from 'next/server';
import { snapshots } from '@/lib/share-store';
import { shareSnapshotSchema } from '@/lib/validations';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = shareSnapshotSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.format() }, { status: 400 });
    }

    const id = nanoid(10);
    const now = Date.now();
    const expiresAt = now + parsed.data.expiresInDays * 24 * 60 * 60 * 1000;

    snapshots.set(id, {
      id,
      title: parsed.data.title,
      content: parsed.data.content,
      createdAt: now,
      expiresAt,
    });

    return NextResponse.json({ id, expiresAt });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
