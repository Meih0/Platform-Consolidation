import { getDb } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function POST() {
  const db = getDb();

  db.exec('DELETE FROM reminders; DELETE FROM meetings; DELETE FROM platforms; DELETE FROM contacts; DELETE FROM entities; DELETE FROM sectors;');

  const insertSector = db.prepare('INSERT INTO sectors (name, description) VALUES (?, ?)');
  const insertEntity = db.prepare('INSERT INTO entities (sector_id, name, acronym, tier, notes) VALUES (?, ?, ?, ?, ?)');
  const insertContact = db.prepare('INSERT INTO contacts (entity_id, name, role, email, phone, personality_notes) VALUES (?, ?, ?, ?, ?, ?)');
  const insertPlatform = db.prepare('INSERT INTO platforms (entity_id, name, status, action, deadline, progress, notes) VALUES (?, ?, ?, ?, ?, ?, ?)');
  const insertMeeting = db.prepare('INSERT INTO meetings (entity_id, contact_id, title, date, time, location, status, purpose, notes, summary) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
  const insertReminder = db.prepare('INSERT INTO reminders (meeting_id, type, message, due_date) VALUES (?, ?, ?, ?)');

  const now = new Date();
  const monthsFromNow = (m: number) => { const d = new Date(now); d.setMonth(d.getMonth() + m); return d.toISOString().split('T')[0]; };
  const daysAgo = (n: number) => new Date(now.getTime() - n * 86400000).toISOString().split('T')[0];

  const s1 = insertSector.run('Health', 'Health and human services agencies').lastInsertRowid;
  const s2 = insertSector.run('Education', 'K-12 and higher education institutions').lastInsertRowid;
  const s3 = insertSector.run('Transportation', 'Transit, roads, and infrastructure agencies').lastInsertRowid;

  const e1 = insertEntity.run(s1, 'State Department of Health', 'SDOH', 'Tier 1', 'Primary health policy body').lastInsertRowid;
  const e2 = insertEntity.run(s1, 'Regional Medical Network', 'RMN', 'Tier 2', 'Coordinates regional hospitals').lastInsertRowid;
  const e3 = insertEntity.run(s2, 'Office of Public Instruction', 'OPI', 'Tier 1', 'State-level education oversight').lastInsertRowid;
  const e4 = insertEntity.run(s2, 'Community College Board', 'CCB', 'Tier 2', 'Governs community college system').lastInsertRowid;
  const e5 = insertEntity.run(s3, 'Department of Transportation', 'DOT', 'Tier 1', 'Manages state highways and transit').lastInsertRowid;
  const e6 = insertEntity.run(s3, 'Metro Transit Authority', 'MTA', 'Tier 2', 'Urban public transit operations').lastInsertRowid;

  const c1 = insertContact.run(e1, 'Dr. Karen Mills', 'CIO', 'kmills@sdoh.gov', '555-100-0001', 'Data-driven, prefers concise slide decks. Dislikes surprises—send agenda 48h in advance.').lastInsertRowid;
  insertContact.run(e1, 'Tom Hargrove', 'Deputy CIO', 'thargrove@sdoh.gov', '555-100-0002', 'Friendly, talkative. Loves whiteboard sessions. Will champion ideas internally if consulted early.');
  insertContact.run(e2, 'Lisa Chen', 'IT Director', 'lchen@rmn.org', '555-200-0001', 'Detail-oriented, asks tough questions. Responds well to ROI analysis and case studies.');
  insertContact.run(e2, 'James Okafor', 'Project Manager', 'jokafor@rmn.org', '555-200-0002', 'Process-focused. Wants clear timelines and RACI charts before committing to anything.');
  const c5 = insertContact.run(e3, 'Superintendent Maria Vega', 'Superintendent', 'mvega@opi.edu', '555-300-0001', 'Big-picture thinker. Cares deeply about equity. Frame proposals around student outcomes.').lastInsertRowid;
  insertContact.run(e3, 'Alan Price', 'Tech Coordinator', 'aprice@opi.edu', '555-300-0002', 'Hands-on technical. Wants to see demos, not slides. Skeptical of vendor promises.');
  insertContact.run(e4, 'Dr. Nina Patel', 'Chancellor', 'npatel@ccb.edu', '555-400-0001', 'Diplomatic, consensus-builder. Include all stakeholders or she will delay decisions.');
  insertContact.run(e4, 'Greg Stanton', 'Systems Admin Lead', 'gstanton@ccb.edu', '555-400-0002', 'Blunt, values honesty over polish. If something is broken, say so—he respects candor.');
  const c9 = insertContact.run(e5, 'Director Robert Ahn', 'Director', 'rahn@dot.gov', '555-500-0001', 'Formal, prefers written follow-ups. Political awareness is high—avoid controversial framing.').lastInsertRowid;
  insertContact.run(e5, 'Priya Sharma', 'Platform Manager', 'psharma@dot.gov', '555-500-0002', 'Energetic, early adopter. Loves innovation but needs help selling to leadership.');
  const c11 = insertContact.run(e6, 'Carlos Mendez', 'GM of Operations', 'cmendez@mta.transit', '555-600-0001', 'Pragmatic, budget-conscious. Lead with cost savings. Allergic to jargon.').lastInsertRowid;
  insertContact.run(e6, 'Aisha Johnson', 'Digital Services Lead', 'ajohnson@mta.transit', '555-600-0002', 'Creative, UX-focused. Loves user journey maps. Will push back on anything that hurts rider experience.');

  insertPlatform.run(e1, 'HealthTrack EHR', 'active', 'consolidate', monthsFromNow(2), 35, 'Merge into statewide EHR platform');
  insertPlatform.run(e1, 'WellnessPortal', 'active', 'delete', monthsFromNow(4), 10, 'Redundant; users migrating to HealthTrack');
  insertPlatform.run(e2, 'PatientLink', 'active', 'merge', monthsFromNow(3), 20, 'Merge with HealthTrack EHR after API alignment');
  insertPlatform.run(e2, 'CliniSchedule', 'active', 'consolidate', monthsFromNow(5), 5, 'Roll scheduling into PatientLink before merge');
  insertPlatform.run(e3, 'EduPlatform LMS', 'active', 'consolidate', monthsFromNow(1), 60, 'Consolidate with state LMS');
  insertPlatform.run(e3, 'GradeSync', 'active', 'delete', monthsFromNow(3), 15, 'Legacy grading tool—replace with LMS module');
  insertPlatform.run(e3, 'ParentConnect', 'active', 'merge', monthsFromNow(5), 0, 'Merge into unified communications portal');
  insertPlatform.run(e4, 'CampusHub', 'active', 'consolidate', monthsFromNow(2), 40, 'Align with state higher-ed portal');
  insertPlatform.run(e4, 'EnrollEasy', 'active', 'merge', monthsFromNow(4), 10, 'Merge enrollment flow into CampusHub');
  insertPlatform.run(e5, 'RoadWatch ATMS', 'active', 'consolidate', monthsFromNow(3), 25, 'Consolidate with federal ATMS standard');
  insertPlatform.run(e5, 'BridgeInspect', 'active', 'delete', monthsFromNow(1), 80, 'Deprecated; replaced by RoadWatch module');
  insertPlatform.run(e5, 'PermitFlow', 'active', 'merge', monthsFromNow(6), 5, 'Merge permitting into enterprise portal');
  insertPlatform.run(e6, 'RiderApp', 'active', 'consolidate', monthsFromNow(2), 30, 'Consolidate with regional transit app');
  insertPlatform.run(e6, 'FleetOps', 'active', 'merge', monthsFromNow(4), 15, 'Merge fleet management into DOT system');

  const m3 = insertMeeting.run(e3, c5, 'OPI LMS Consolidation Wrap-up', daysAgo(14), '09:00', 'OPI Office - Conference B', 'completed', 'Finalize LMS consolidation plan',
    'Superintendent Vega confirmed LMS migration for spring semester. ParentConnect merge deferred.',
    'Agreed on spring LMS migration. ParentConnect merge pushed to fall.').lastInsertRowid;
  const m4 = insertMeeting.run(e6, c11, 'MTA Digital Services Alignment', daysAgo(7), '11:00', 'MTA Downtown Office', 'completed', 'Align RiderApp consolidation',
    'Carlos wants cost-benefit analysis before committing to fleet merge. Prototype review in 3 weeks.',
    'Fleet merge pending CBA. RiderApp prototype review in 3 weeks.').lastInsertRowid;
  insertMeeting.run(e1, c1, 'SDOH Quarterly Platform Review', monthsFromNow(1), '10:00', 'SDOH HQ - Room 401', 'scheduled', 'Review consolidation timeline for HealthTrack and WellnessPortal', null, null);
  insertMeeting.run(e5, c9, 'DOT Infrastructure Systems Check-in', monthsFromNow(2), '14:00', 'Virtual - Teams', 'scheduled', 'Discuss BridgeInspect sunset and RoadWatch consolidation', null, null);

  insertReminder.run(m3, 'post_meeting_update', 'Enter post-meeting update for OPI LMS Consolidation Wrap-up', daysAgo(12));
  insertReminder.run(m4, 'post_meeting_update', 'Enter post-meeting update for MTA Digital Services Alignment', daysAgo(5));

  return NextResponse.json({ message: 'Seeded successfully', counts: { sectors: 3, entities: 6, contacts: 12, platforms: 14, meetings: 4, reminders: 2 } });
}
