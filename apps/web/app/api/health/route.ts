import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    app: 'Dnyx Draft',
    version: '4.0.0',
    timestamp: new Date().toISOString(),
    engine: 'Next.js 16 App Router (Turbopack)',
  });
}
