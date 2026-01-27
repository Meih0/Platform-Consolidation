import { getDb } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  const db = getDb();
  const reminders = db.prepare(`SELECT r.*, m.title AS meeting_title, m.date AS meeting_date,
    e.name AS entity_name, c.name AS contact_name
    FROM reminders r JOIN meetings m ON r.meeting_id = m.id
    JOIN entities e ON m.entity_id = e.id JOIN contacts c ON m.contact_id = c.id
    WHERE r.is_dismissed = 0 ORDER BY r.due_date ASC`).all();
  return NextResponse.json(reminders);
}
