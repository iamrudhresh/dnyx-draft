/**
 * In-memory snapshot store shared between the POST and GET API routes.
 *
 * ⚠️  Production note: module-level Maps are ephemeral in serverless runtimes
 * (Vercel, Cloudflare Workers). Each function instance has its own copy.
 * For production, replace this with Redis / KV / Postgres persistence.
 */
export interface Snapshot {
  id: string;
  title: string;
  content: string;
  createdAt: number;
  expiresAt: number;
}

export const snapshots = new Map<string, Snapshot>();
