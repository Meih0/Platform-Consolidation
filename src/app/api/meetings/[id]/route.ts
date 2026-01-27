import { getDb } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const db = getDb();
  const { id } = params;
  const meeting = db.prepare(`
    SELECT m.*, sl.name_en as sector_lead_name, o.name_en as org_name, s.name_en as sector_name
    FROM meetings m
    LEFT JOIN sector_leads sl ON m.sector_lead_id = sl.id
    LEFT JOIN organizations o ON m.org_id = o.id
    LEFT JOIN sectors s ON o.sector_id = s.id
    WHERE m.id = ?
  `).get(id);
  if (!meeting) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(meeting);
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const db = getDb();
  const { id } = params;
  const body = await req.json();

  const fields: string[] = [];
  const values: any[] = [];
  const allowedKeys = ['title', 'date', 'time', 'location', 'type', 'status', 'purpose', 'notes', 'outcomes', 'next_steps', 'updates_entered'];
  for (const key of allowedKeys) {
    if (body[key] !== undefined) {
      fields.push(key + ' = ?');
      values.push(key === 'updates_entered' ? (body[key] ? 1 : 0) : body[key]);
    }
  }
  if (fields.length > 0) {
    values.push(id);
    db.prepare('UPDATE meetings SET ' + fields.join(', ') + ' WHERE id = ?').run(...values);
  }

  const row = db.prepare(`
    SELECT m.*, sl.name_en as sector_lead_name, o.name_en as org_name, s.name_en as sector_name
    FROM meetings m
    LEFT JOIN sector_leads sl ON m.sector_lead_id = sl.id
    LEFT JOIN organizations o ON m.org_id = o.id
    LEFT JOIN sectors s ON o.sector_id = s.id
    WHERE m.id = ?
  `).get(id);
  return NextResponse.json(row);
}
