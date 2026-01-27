import { getDb } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const db = getDb();
  const entityId = new URL(req.url).searchParams.get('entity_id');
  let query = 'SELECT p.*, e.name AS entity_name FROM platforms p JOIN entities e ON p.entity_id = e.id';
  const params: any[] = [];
  if (entityId) { query += ' WHERE p.entity_id = ?'; params.push(entityId); }
  query += ' ORDER BY p.deadline ASC';
  const rows = db.prepare(query).all(...params);
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const db = getDb();
  const { entity_id, name, status, action, deadline, progress, target_platform, notes } = await req.json();
  const result = db.prepare('INSERT INTO platforms (entity_id, name, status, action, deadline, progress, target_platform, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)').run(entity_id, name, status ?? 'active', action ?? 'consolidate', deadline ?? null, progress ?? 0, target_platform ?? null, notes ?? null);
  const row = db.prepare('SELECT p.*, e.name AS entity_name FROM platforms p JOIN entities e ON p.entity_id = e.id WHERE p.id = ?').get(result.lastInsertRowid);
  return NextResponse.json(row, { status: 201 });
}
