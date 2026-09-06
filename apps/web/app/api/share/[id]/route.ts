import { NextResponse } from 'next/server';
import { snapshots } from '@/lib/share-store';

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const snapshot = snapshots.get(id);

  if (!snapshot) {
    return NextResponse.json({ error: 'Snapshot not found' }, { status: 404 });
  }

  if (snapshot.expiresAt < Date.now()) {
    snapshots.delete(id);
    return NextResponse.json({ error: 'Snapshot has expired' }, { status: 410 });
  }

  return NextResponse.json({
    id: snapshot.id,
    title: snapshot.title,
    content: snapshot.content,
    createdAt: snapshot.createdAt,
    expiresAt: snapshot.expiresAt,
  });
}
