import { getDb } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  const db = getDb();
  const reminders = db.prepare(`
    SELECT r.*, m.title as meeting_title, m.date as meeting_date, m.time as meeting_time,
      o.name_en as org_name, sl.name_en as sector_lead_name
    FROM reminders r
    LEFT JOIN meetings m ON r.meeting_id = m.id
    LEFT JOIN organizations o ON m.org_id = o.id
    LEFT JOIN sector_leads sl ON m.sector_lead_id = sl.id
    WHERE r.dismissed = 0
    ORDER BY r.remind_at ASC
  `).all();
  return NextResponse.json(reminders);
}

export async function POST(req: NextRequest) {
  const db = getDb();
  const body = await req.json();
  db.prepare('INSERT INTO reminders (id, meeting_id, remind_at, message, dismissed) VALUES (?,?,?,?,0)').run(
    body.id, body.meeting_id, body.remind_at, body.message || null
  );
  const row = db.prepare('SELECT * FROM reminders WHERE id = ?').get(body.id);
  return NextResponse.json(row, { status: 201 });
}
