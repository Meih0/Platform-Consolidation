import { getDb } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  const db = getDb();
  const sectors = db.prepare(`
    SELECT s.*, sl.name_en as lead_name, COUNT(o.id) as org_count
    FROM sectors s
    LEFT JOIN sector_leads sl ON s.sector_lead_id = sl.id
    LEFT JOIN organizations o ON o.sector_id = s.id
    GROUP BY s.id ORDER BY s.id
  `).all();
  return NextResponse.json(sectors);
}

export async function POST(req: NextRequest) {
  const db = getDb();
  const body = await req.json();
  db.prepare('INSERT INTO sectors (id, name_en, name_ar, sector_lead_id) VALUES (?,?,?,?)').run(
    body.id, body.name_en, body.name_ar || null, body.sector_lead_id || null
  );
  const row = db.prepare('SELECT * FROM sectors WHERE id = ?').get(body.id);
  return NextResponse.json(row, { status: 201 });
}
