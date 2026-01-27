import { getDb } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const db = getDb();
  const sp = new URL(req.url).searchParams;
  const entityId = sp.get('entity_id');
  const status = sp.get('status');
  let query = `SELECT m.*, e.name AS entity_name, e.acronym AS entity_acronym,
    c.name AS contact_name, c.role AS contact_role
    FROM meetings m JOIN entities e ON m.entity_id = e.id JOIN contacts c ON m.contact_id = c.id`;
  const conds: string[] = [];
  const params: any[] = [];
  if (entityId) { conds.push('m.entity_id = ?'); params.push(entityId); }
  if (status) { conds.push('m.status = ?'); params.push(status); }
  if (conds.length) query += ' WHERE ' + conds.join(' AND ');
  query += ' ORDER BY m.date DESC, m.time DESC';
  const rows = db.prepare(query).all(...params);
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const db = getDb();
  const { entity_id, contact_id, title, date, time, location, status, purpose } = await req.json();
  const result = db.prepare('INSERT INTO meetings (entity_id, contact_id, title, date, time, location, status, purpose) VALUES (?, ?, ?, ?, ?, ?, ?, ?)').run(entity_id, contact_id, title, date, time ?? null, location ?? null, status ?? 'scheduled', purpose ?? null);
  const row = db.prepare(`SELECT m.*, e.name AS entity_name, c.name AS contact_name FROM meetings m JOIN entities e ON m.entity_id = e.id JOIN contacts c ON m.contact_id = c.id WHERE m.id = ?`).get(result.lastInsertRowid);
  return NextResponse.json(row, { status: 201 });
}
