import { getDb } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  const db = getDb();
  const leads = db.prepare(`
    SELECT sl.*, COUNT(sla.sector_id) as sector_count
    FROM sector_leads sl
    LEFT JOIN sector_lead_assignments sla ON sl.id = sla.sector_lead_id
    GROUP BY sl.id ORDER BY sl.id
  `).all();
  return NextResponse.json(leads);
}

export async function POST(req: NextRequest) {
  const db = getDb();
  const body = await req.json();
  db.prepare('INSERT INTO sector_leads (id, name_en, name_ar, email, phone, status, personality_notes) VALUES (?,?,?,?,?,?,?)').run(
    body.id, body.name_en, body.name_ar || null, body.email || null, body.phone || null, body.status || 'Active', body.personality_notes || null
  );
  const row = db.prepare('SELECT * FROM sector_leads WHERE id = ?').get(body.id);
  return NextResponse.json(row, { status: 201 });
}
