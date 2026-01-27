import { getDb } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const db = getDb();
  const sectorId = new URL(req.url).searchParams.get('sector_id');
  let query = 'SELECT e.*, s.name AS sector_name FROM entities e JOIN sectors s ON e.sector_id = s.id';
  const params: any[] = [];
  if (sectorId) { query += ' WHERE e.sector_id = ?'; params.push(sectorId); }
  query += ' ORDER BY e.name';
  const rows = db.prepare(query).all(...params);
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const db = getDb();
  const { sector_id, name, acronym, tier, notes } = await req.json();
  const result = db.prepare('INSERT INTO entities (sector_id, name, acronym, tier, notes) VALUES (?, ?, ?, ?, ?)').run(sector_id, name, acronym ?? null, tier ?? null, notes ?? null);
  const row = db.prepare('SELECT e.*, s.name AS sector_name FROM entities e JOIN sectors s ON e.sector_id = s.id WHERE e.id = ?').get(result.lastInsertRowid);
  return NextResponse.json(row, { status: 201 });
}
