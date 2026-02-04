import { getDb } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const db = getDb();
  const sectorId = req.nextUrl.searchParams.get('sector_id');

  let query = `
    SELECT o.*, s.name_en as sector_name_en
    FROM organizations o
    LEFT JOIN sectors s ON o.sector_id = s.id
  `;
  const params: any[] = [];

  if (sectorId) {
    query += ' WHERE o.sector_id = ?';
    params.push(sectorId);
  }

  query += ' ORDER BY o.id';
  const orgs = db.prepare(query).all(...params);
  return NextResponse.json(orgs);
}

export async function POST(req: NextRequest) {
  const db = getDb();
  const body = await req.json();
  db.prepare('INSERT INTO organizations (id, name_en, name_ar, sector_id, type, status, consolidation_priority) VALUES (?,?,?,?,?,?,?)').run(
    body.id, body.name_en, body.name_ar || null, body.sector_id || null,
    body.type || null, body.status || 'Active', body.consolidation_priority || 'Medium'
  );
  const row = db.prepare('SELECT * FROM organizations WHERE id = ?').get(body.id);
  return NextResponse.json(row, { status: 201 });
}
