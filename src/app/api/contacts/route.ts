import { getDb } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const db = getDb();
  const entityId = new URL(req.url).searchParams.get('entity_id');
  let query = 'SELECT c.*, e.name AS entity_name FROM contacts c JOIN entities e ON c.entity_id = e.id';
  const params: any[] = [];
  if (entityId) { query += ' WHERE c.entity_id = ?'; params.push(entityId); }
  query += ' ORDER BY c.name';
  const rows = db.prepare(query).all(...params);
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const db = getDb();
  const { entity_id, name, role, email, phone, personality_notes } = await req.json();
  const result = db.prepare('INSERT INTO contacts (entity_id, name, role, email, phone, personality_notes) VALUES (?, ?, ?, ?, ?, ?)').run(entity_id, name, role ?? null, email ?? null, phone ?? null, personality_notes ?? null);
  const row = db.prepare('SELECT c.*, e.name AS entity_name FROM contacts c JOIN entities e ON c.entity_id = e.id WHERE c.id = ?').get(result.lastInsertRowid);
  return NextResponse.json(row, { status: 201 });
}
