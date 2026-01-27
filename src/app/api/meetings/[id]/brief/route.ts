import { getDb } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const db = getDb();
  const { id } = params;

  const meeting = db.prepare(`
    SELECT m.*, sl.name_en as sector_lead_name, sl.personality_notes,
      o.name_en as org_name, o.name_ar as org_name_ar, o.org_type, o.status as org_status,
      s.name_en as sector_name, s.name_ar as sector_name_ar
    FROM meetings m
    LEFT JOIN sector_leads sl ON m.sector_lead_id = sl.id
    LEFT JOIN organizations o ON m.org_id = o.id
    LEFT JOIN sectors s ON o.sector_id = s.id
    WHERE m.id = ?
  `).get(id) as any;

  if (!meeting) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const lead = meeting.sector_lead_id
    ? db.prepare('SELECT * FROM sector_leads WHERE id = ?').get(meeting.sector_lead_id)
    : null;

  const org = meeting.org_id
    ? db.prepare('SELECT * FROM organizations WHERE id = ?').get(meeting.org_id)
    : null;

  const sector = meeting.org_id
    ? db.prepare('SELECT s.* FROM sectors s JOIN organizations o ON o.sector_id = s.id WHERE o.id = ?').get(meeting.org_id)
    : null;

  // Platforms belonging to this org with deadlines in the next 4 months
  const fourMonthsFromNow = new Date();
  fourMonthsFromNow.setMonth(fourMonthsFromNow.getMonth() + 4);
  const cutoff = fourMonthsFromNow.toISOString().split('T')[0];
  const today = new Date().toISOString().split('T')[0];

  const platforms = meeting.org_id
    ? db.prepare(`
        SELECT * FROM platforms
        WHERE org_id = ? AND expected_completion IS NOT NULL
          AND expected_completion >= ? AND expected_completion <= ?
        ORDER BY expected_completion ASC
      `).all(meeting.org_id, today, cutoff)
    : [];

  // Last completed meeting for this org
  const lastMeeting = meeting.org_id
    ? db.prepare(`
        SELECT * FROM meetings
        WHERE org_id = ? AND status = 'completed' AND id != ?
        ORDER BY date DESC LIMIT 1
      `).get(meeting.org_id, id)
    : null;

  // Auto-generate talking points
  const talkingPoints: string[] = [];
  const platformList = platforms as any[];

  if (platformList.length > 0) {
    for (const p of platformList) {
      talkingPoints.push('Upcoming deadline: ' + (p as any).target_platform_name + ' consolidation by ' + (p as any).expected_completion);
    }
  }

  if (meeting.personality_notes) {
    talkingPoints.push('Note: ' + meeting.personality_notes);
  }

  if (lastMeeting) {
    const lm = lastMeeting as any;
    if (lm.next_steps) {
      talkingPoints.push('Follow up from last meeting: ' + lm.next_steps);
    }
    if (lm.outcomes) {
      talkingPoints.push('Previous outcomes: ' + lm.outcomes);
    }
  }

  if (talkingPoints.length === 0) {
    talkingPoints.push('General consolidation progress review');
  }

  return NextResponse.json({
    meeting,
    lead,
    org,
    sector,
    platforms,
    lastMeeting,
    talkingPoints,
  });
}
