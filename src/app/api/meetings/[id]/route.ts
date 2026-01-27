import { getDb } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const db = getDb();
  const { id } = params;
  const meeting = db.prepare(`SELECT m.*, e.name AS entity_name, e.acronym AS entity_acronym, e.tier AS entity_tier, e.notes AS entity_notes,
    s.name AS sector_name, c.name AS contact_name, c.role AS contact_role, c.email AS contact_email,
    c.phone AS contact_phone, c.personality_notes AS contact_personality_notes
    FROM meetings m JOIN entities e ON m.entity_id = e.id JOIN sectors s ON e.sector_id = s.id
    JOIN contacts c ON m.contact_id = c.id WHERE m.id = ?`).get(id);
  if (!meeting) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(meeting);
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const db = getDb();
  const { id } = params;
  const body = await req.json();
  const fields = ['entity_id', 'contact_id', 'title', 'date', 'time', 'location', 'status', 'purpose', 'notes', 'summary'];
  const sets: string[] = [];
  const vals: any[] = [];
  for (const f of fields) {
    if (body[f] !== undefined) { sets.push(`${f} = ?`); vals.push(body[f]); }
  }
  if (!sets.length) return NextResponse.json({ error: 'No fields' }, { status: 400 });
  vals.push(id);
  db.prepare(`UPDATE meetings SET ${sets.join(', ')} WHERE id = ?`).run(...vals);
  const updated = db.prepare(`SELECT m.*, e.name AS entity_name, c.name AS contact_name FROM meetings m JOIN entities e ON m.entity_id = e.id JOIN contacts c ON m.contact_id = c.id WHERE m.id = ?`).get(id);
  return NextResponse.json(updated);
}
