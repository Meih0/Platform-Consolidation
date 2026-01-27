import { getDb } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const db = getDb();
  const { id } = params;
  const lead = db.prepare('SELECT * FROM sector_leads WHERE id = ?').get(id);
  if (!lead) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const sectors = db.prepare(`
    SELECT s.* FROM sectors s
    JOIN sector_lead_assignments sla ON s.id = sla.sector_id
    WHERE sla.sector_lead_id = ?
    ORDER BY s.id
  `).all(id);

  return NextResponse.json({ ...(lead as any), sectors });
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const db = getDb();
  const { id } = params;
  const body = await req.json();

  const fields: string[] = [];
  const values: any[] = [];
  const allowedKeys = ['name_en', 'name_ar', 'email', 'phone', 'status', 'personality_notes'];
  for (const key of allowedKeys) {
    if (body[key] !== undefined) {
      fields.push(key + ' = ?');
      values.push(body[key]);
    }
  }
  if (fields.length > 0) {
    values.push(id);
    db.prepare('UPDATE sector_leads SET ' + fields.join(', ') + ' WHERE id = ?').run(...values);
  }

  const row = db.prepare('SELECT * FROM sector_leads WHERE id = ?').get(id);
  return NextResponse.json(row);
}
