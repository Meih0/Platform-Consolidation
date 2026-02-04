import { getDb } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const db = getDb();
  const status = req.nextUrl.searchParams.get('status');
  const sectorLeadId = req.nextUrl.searchParams.get('sector_lead_id');

  let query = `
    SELECT m.*, sl.name_en as sector_lead_name, o.name_en as org_name, s.name_en as sector_name
    FROM meetings m
    LEFT JOIN sector_leads sl ON m.sector_lead_id = sl.id
    LEFT JOIN organizations o ON m.org_id = o.id
    LEFT JOIN sectors s ON o.sector_id = s.id
  `;
  const conditions: string[] = [];
  const params: any[] = [];

  if (status) {
    conditions.push('m.status = ?');
    params.push(status);
  }
  if (sectorLeadId) {
    conditions.push('m.sector_lead_id = ?');
    params.push(sectorLeadId);
  }
  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }
  query += ' ORDER BY m.date DESC, m.time DESC';

  const meetings = db.prepare(query).all(...params);
  return NextResponse.json(meetings);
}

export async function POST(req: NextRequest) {
  const db = getDb();
  const body = await req.json();
  db.prepare(`INSERT INTO meetings (id, title, date, time, location, type, status, purpose, notes, outcomes, next_steps, updates_entered, sector_lead_id, org_id) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).run(
    body.id, body.title, body.date, body.time || null, body.location || null,
    body.type || 'In-Person', body.status || 'Scheduled', body.purpose || null,
    body.notes || null, body.outcomes || null, body.next_steps || null,
    body.updates_entered ? 1 : 0, body.sector_lead_id || null, body.org_id || null
  );
  const row = db.prepare('SELECT * FROM meetings WHERE id = ?').get(body.id);
  return NextResponse.json(row, { status: 201 });
}
