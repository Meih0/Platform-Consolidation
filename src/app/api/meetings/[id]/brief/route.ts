import { getDb } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const db = getDb();
  const { id } = params;

  const meeting: any = db.prepare(`SELECT m.*, e.name AS entity_name, e.acronym AS entity_acronym, e.tier AS entity_tier, e.notes AS entity_notes,
    s.name AS sector_name, c.name AS contact_name, c.role AS contact_role, c.email AS contact_email,
    c.personality_notes AS contact_personality_notes
    FROM meetings m JOIN entities e ON m.entity_id = e.id JOIN sectors s ON e.sector_id = s.id
    JOIN contacts c ON m.contact_id = c.id WHERE m.id = ?`).get(id);

  if (!meeting) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const now = new Date();
  const fourMonths = new Date(now);
  fourMonths.setMonth(fourMonths.getMonth() + 4);

  const platforms = db.prepare(`SELECT * FROM platforms WHERE entity_id = ? AND deadline >= ? AND deadline <= ? ORDER BY deadline ASC`)
    .all(meeting.entity_id, now.toISOString().split('T')[0], fourMonths.toISOString().split('T')[0]);

  const lastMeeting = db.prepare(`SELECT * FROM meetings WHERE entity_id = ? AND status = 'completed' AND id != ? ORDER BY date DESC LIMIT 1`)
    .get(meeting.entity_id, id);

  const entityContacts = db.prepare('SELECT name, role, personality_notes FROM contacts WHERE entity_id = ?').all(meeting.entity_id);

  const talkingPoints: string[] = [];
  for (const p of platforms as any[]) {
    talkingPoints.push(`Discuss ${p.action} timeline for ${p.name} (deadline: ${p.deadline})`);
  }
  if ((lastMeeting as any)?.summary) {
    talkingPoints.push(`Follow up on previous meeting: ${(lastMeeting as any).summary}`);
  }
  const pn = meeting.contact_personality_notes?.toLowerCase() || '';
  if (pn.includes('data-driven')) talkingPoints.push('Prepare data and metrics to support discussion points');
  if (pn.includes('budget') || pn.includes('cost')) talkingPoints.push('Lead with cost savings and budget impact analysis');
  if (pn.includes('demo')) talkingPoints.push('Prepare a live demo rather than slide deck');
  if (pn.includes('equity') || pn.includes('student')) talkingPoints.push('Frame proposals around equity and student outcomes');
  talkingPoints.push('Confirm next steps and assign action items before closing');

  return NextResponse.json({
    entity: { name: meeting.entity_name, acronym: meeting.entity_acronym, tier: meeting.entity_tier, sector: meeting.sector_name, notes: meeting.entity_notes },
    contact: { name: meeting.contact_name, role: meeting.contact_role, email: meeting.contact_email, personality: meeting.contact_personality_notes },
    platforms,
    lastMeeting: lastMeeting ? { date: (lastMeeting as any).date, summary: (lastMeeting as any).summary, notes: (lastMeeting as any).notes } : null,
    allContacts: entityContacts,
    talkingPoints,
  });
}
