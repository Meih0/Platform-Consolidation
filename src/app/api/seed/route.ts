import { getDb } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function POST() {
  const db = getDb();

  db.exec(`
    DELETE FROM reminders; DELETE FROM updates_log; DELETE FROM meetings;
    DELETE FROM services; DELETE FROM platforms; DELETE FROM sector_lead_assignments;
    DELETE FROM organizations; DELETE FROM sectors; DELETE FROM sector_leads;
  `);

  const ins = {
    sl: db.prepare('INSERT INTO sector_leads (id, name_en, name_ar, email, phone, status, personality_notes) VALUES (?,?,?,?,?,?,?)'),
    sec: db.prepare('INSERT INTO sectors (id, name_en, name_ar, torch_bearer_en, torch_bearer_ar, status, sector_lead_id) VALUES (?,?,?,?,?,?,?)'),
    sla: db.prepare('INSERT INTO sector_lead_assignments (sector_lead_id, sector_id) VALUES (?,?)'),
    org: db.prepare('INSERT INTO organizations (id, sector_id, name_en, name_ar, org_type, contact_email, status) VALUES (?,?,?,?,?,?,?)'),
    plt: db.prepare('INSERT INTO platforms (id, org_id, government_entity, target_platform_name, current_domain, domain_status, main_platform, new_domain, expected_completion, implementation_status, current_challenges, dga_support_required, sector_lead_id, last_update_date, progress) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)'),
    svc: db.prepare('INSERT INTO services (id, platform_id, name, description, user_type, status) VALUES (?,?,?,?,?,?)'),
    mtg: db.prepare('INSERT INTO meetings (sector_lead_id, org_id, sector_id, title, date, time, location, type, status, purpose, notes, outcomes, next_steps, updates_entered) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)'),
    rem: db.prepare('INSERT INTO reminders (meeting_id, type, message, due_date) VALUES (?,?,?,?)'),
  };

  const now = new Date();
  const mfn = (m: number) => { const d = new Date(now); d.setMonth(d.getMonth() + m); return d.toISOString().split('T')[0]; };
  const dago = (n: number) => new Date(now.getTime() - n * 86400000).toISOString().split('T')[0];

  // === SECTOR LEADS ===
  ins.sl.run('SL-001', 'Ahmed Al-Rashid', 'أحمد الراشد', 'a.rashid@dga.gov.sa', '+966-50-111-0001', 'Active',
    'Data-driven, prefers concise slide decks with metrics. Dislikes surprises—send agenda 48h in advance. Very formal in meetings, prefers written follow-ups. Strong political awareness.');
  ins.sl.run('SL-002', 'Sara Al-Qahtani', 'سارة القحطاني', 's.qahtani@dga.gov.sa', '+966-50-111-0002', 'Active',
    'Big-picture thinker, cares deeply about citizen impact. Consensus-builder—include all stakeholders or she delays decisions. Prefers workshops over presentations.');
  ins.sl.run('SL-003', 'Mohammed Al-Dosari', 'محمد الدوسري', 'm.dosari@dga.gov.sa', '+966-50-111-0003', 'Active',
    'Hands-on technical background. Wants to see live demos, not slides. Skeptical of vendor promises. Blunt, values honesty over polish. Respects candor.');
  ins.sl.run('SL-004', 'Fatima Al-Harbi', 'فاطمة الحربي', 'f.harbi@dga.gov.sa', '+966-50-111-0004', 'Active',
    'Budget-conscious, lead with cost savings and ROI. Pragmatic, hates jargon. Early morning person—schedule before 10am. Responds fast to WhatsApp.');
  ins.sl.run('SL-005', 'Khalid Al-Otaibi', 'خالد العتيبي', 'k.otaibi@dga.gov.sa', '+966-50-111-0005', 'Active',
    'Energetic early adopter, loves innovation. Needs help selling to leadership—prepare exec summaries for him. Friendly, builds rapport quickly. Prefers in-person meetings.');

  // === SECTORS (10 representative) ===
  const sectors = [
    ['SEC-001', 'Energy', 'الطاقة', 'Ministry of Energy', 'وزارة الطاقة', 'SL-001'],
    ['SEC-002', 'Health', 'الصحة', 'Ministry of Health', 'وزارة الصحة', 'SL-001'],
    ['SEC-003', 'Education', 'التعليم', 'Ministry of Education', 'وزارة التعليم', 'SL-001'],
    ['SEC-004', 'Finance', 'المالية', 'Ministry of Finance', 'وزارة المالية', 'SL-002'],
    ['SEC-005', 'Commerce', 'التجارة', 'Ministry of Commerce', 'وزارة التجارة', 'SL-002'],
    ['SEC-006', 'Transportation', 'النقل', 'Ministry of Transport', 'وزارة النقل', 'SL-003'],
    ['SEC-007', 'Justice', 'العدل', 'Ministry of Justice', 'وزارة العدل', 'SL-003'],
    ['SEC-008', 'Interior', 'الداخلية', 'Ministry of Interior', 'وزارة الداخلية', 'SL-004'],
    ['SEC-009', 'Municipal', 'البلدية', 'Ministry of Municipal Affairs', 'وزارة الشؤون البلدية', 'SL-004'],
    ['SEC-010', 'Tourism', 'السياحة', 'Ministry of Tourism', 'وزارة السياحة', 'SL-005'],
  ];
  for (const s of sectors) {
    ins.sec.run(s[0], s[1], s[2], s[3], s[4], 'Active', s[5]);
    ins.sla.run(s[5], s[0]);
  }

  // === ORGANIZATIONS ===
  const orgs = [
    ['ORG-001', 'SEC-001', 'Ministry of Energy', 'وزارة الطاقة', 'Torch Bearer + Org', 'info@energy.gov.sa'],
    ['ORG-002', 'SEC-001', 'King Abdullah City for Atomic & Renewable Energy', 'مدينة الملك عبدالله للطاقة', 'Regulatory', 'info@kacare.gov.sa'],
    ['ORG-003', 'SEC-001', 'Saudi Electricity Company', 'الشركة السعودية للكهرباء', 'Service Provider', 'info@se.com.sa'],
    ['ORG-004', 'SEC-002', 'Ministry of Health', 'وزارة الصحة', 'Torch Bearer + Org', 'info@moh.gov.sa'],
    ['ORG-005', 'SEC-002', 'Saudi Food & Drug Authority', 'الهيئة العامة للغذاء والدواء', 'Regulatory', 'info@sfda.gov.sa'],
    ['ORG-006', 'SEC-002', 'Saudi Red Crescent Authority', 'هيئة الهلال الأحمر', 'Service Provider', 'info@srca.org.sa'],
    ['ORG-007', 'SEC-003', 'Ministry of Education', 'وزارة التعليم', 'Torch Bearer + Org', 'info@moe.gov.sa'],
    ['ORG-008', 'SEC-003', 'Education & Training Evaluation Commission', 'هيئة تقويم التعليم', 'Regulatory', 'info@etec.gov.sa'],
    ['ORG-009', 'SEC-004', 'Ministry of Finance', 'وزارة المالية', 'Torch Bearer + Org', 'info@mof.gov.sa'],
    ['ORG-010', 'SEC-004', 'General Authority of Zakat & Tax', 'هيئة الزكاة والضريبة', 'Regulatory', 'info@zatca.gov.sa'],
    ['ORG-011', 'SEC-005', 'Ministry of Commerce', 'وزارة التجارة', 'Torch Bearer + Org', 'info@mc.gov.sa'],
    ['ORG-012', 'SEC-005', 'Saudi Standards Organization', 'الهيئة السعودية للمواصفات', 'Regulatory', 'info@saso.gov.sa'],
    ['ORG-013', 'SEC-006', 'Ministry of Transport', 'وزارة النقل', 'Torch Bearer + Org', 'info@mot.gov.sa'],
    ['ORG-014', 'SEC-006', 'Saudi Railways Organization', 'المؤسسة العامة للخطوط الحديدية', 'Service Provider', 'info@sar.com.sa'],
    ['ORG-015', 'SEC-007', 'Ministry of Justice', 'وزارة العدل', 'Torch Bearer + Org', 'info@moj.gov.sa'],
    ['ORG-016', 'SEC-008', 'Ministry of Interior', 'وزارة الداخلية', 'Torch Bearer + Org', 'info@moi.gov.sa'],
    ['ORG-017', 'SEC-008', 'Saudi Passport Authority', 'المديرية العامة للجوازات', 'Service Provider', 'info@gdp.gov.sa'],
    ['ORG-018', 'SEC-009', 'Ministry of Municipal Affairs', 'وزارة الشؤون البلدية', 'Torch Bearer + Org', 'info@momra.gov.sa'],
    ['ORG-019', 'SEC-010', 'Ministry of Tourism', 'وزارة السياحة', 'Torch Bearer + Org', 'info@mt.gov.sa'],
    ['ORG-020', 'SEC-010', 'Saudi Tourism Authority', 'الهيئة السعودية للسياحة', 'Service Provider', 'info@sta.gov.sa'],
  ];
  for (const o of orgs) {
    ins.org.run(o[0], o[1], o[2], o[3], o[4], o[5], 'Active');
  }

  // === PLATFORMS ===
  const plts = [
    ['PLT-001','ORG-001','Ministry of Energy','Energy Portal V1','energy-v1.gov.sa','Active','National Energy Center','energy.gov.sa',mfn(2),'In Progress','Legacy API dependencies','API support','SL-001',dago(5),35],
    ['PLT-002','ORG-001','Ministry of Energy','Grid Monitoring System','grid.energy.gov.sa','Active','National Energy Center','energy.gov.sa',mfn(4),'Planning','Data migration complexity','Infrastructure','SL-001',dago(10),10],
    ['PLT-003','ORG-002','KACARE','Nuclear Safety Portal','nrsc.gov.sa','Active','KACARE Portal','kacare.gov.sa',mfn(3),'In Progress','Security clearance requirements','Security review','SL-001',dago(3),45],
    ['PLT-004','ORG-003','Saudi Electricity','Billing Portal V1','billing.se.com.sa','Active','SE Unified Portal','se.com.sa',mfn(1),'UAT','Payment gateway migration','Payment integration','SL-001',dago(2),80],
    ['PLT-005','ORG-004','Ministry of Health','Patient Records System','records.moh.gov.sa','Active','National Health Platform','moh.gov.sa',mfn(3),'In Progress','Data privacy compliance','Legal review','SL-001',dago(7),30],
    ['PLT-006','ORG-004','Ministry of Health','Appointment Portal','appointments.moh.gov.sa','Active','National Health Platform','moh.gov.sa',mfn(2),'In Progress','Integration with hospitals','API support','SL-001',dago(4),55],
    ['PLT-007','ORG-005','SFDA','Drug Registration System','drug.sfda.gov.sa','Active','SFDA Unified Portal','sfda.gov.sa',mfn(5),'Planning','Regulatory framework updates','Training','SL-001',dago(15),5],
    ['PLT-008','ORG-007','Ministry of Education','Student Portal V1','students.moe.gov.sa','Active','Unified Education Portal','moe.gov.sa',mfn(1),'Ready for Production','Final testing','None','SL-001',dago(1),95],
    ['PLT-009','ORG-007','Ministry of Education','Teacher Certification','teachers.moe.gov.sa','Active','Unified Education Portal','moe.gov.sa',mfn(3),'In Progress','Teacher data migration','Data migration','SL-001',dago(6),40],
    ['PLT-010','ORG-009','Ministry of Finance','Budget Portal V1','budget.mof.gov.sa','Active','National Finance Platform','mof.gov.sa',mfn(4),'Planning','Cross-ministry dependencies','Architecture','SL-002',dago(20),15],
    ['PLT-011','ORG-010','ZATCA','Tax Filing System','tax.zatca.gov.sa','Active','ZATCA Unified Portal','zatca.gov.sa',mfn(2),'In Progress','Peak season timing','Load testing','SL-002',dago(3),60],
    ['PLT-012','ORG-011','Ministry of Commerce','Business Registration','register.mc.gov.sa','Active','MC Unified Portal','mc.gov.sa',mfn(3),'In Progress','Multi-entity registration','API support','SL-002',dago(5),50],
    ['PLT-013','ORG-013','Ministry of Transport','Vehicle Registration','vehicles.mot.gov.sa','Active','National Transport Portal','mot.gov.sa',mfn(2),'UAT','Traffic system integration','Integration support','SL-003',dago(2),75],
    ['PLT-014','ORG-015','Ministry of Justice','Court Filing System','courts.moj.gov.sa','Active','Justice Portal','moj.gov.sa',mfn(5),'Planning','Case data sensitivity','Security review','SL-003',dago(30),8],
    ['PLT-015','ORG-016','Ministry of Interior','National ID Portal','id.moi.gov.sa','Active','MOI Unified Portal','moi.gov.sa',mfn(6),'Planning','Biometric integration','Infrastructure','SL-004',dago(10),5],
    ['PLT-016','ORG-017','Passport Authority','Passport Services','passport.gdp.gov.sa','Active','MOI Unified Portal','moi.gov.sa',mfn(3),'In Progress','International standards compliance','Security review','SL-004',dago(4),35],
    ['PLT-017','ORG-018','Municipal Affairs','Building Permits','permits.momra.gov.sa','Active','Municipal Portal','momra.gov.sa',mfn(2),'In Progress','GIS integration','Infrastructure','SL-004',dago(6),45],
    ['PLT-018','ORG-019','Ministry of Tourism','Tourism License Portal','license.mt.gov.sa','Active','Tourism Portal','mt.gov.sa',mfn(1),'UAT','Seasonal capacity planning','Load testing','SL-005',dago(2),85],
    ['PLT-019','ORG-020','Saudi Tourism Authority','Visit Saudi Platform','old.visitsaudi.com','Active','Visit Saudi','visitsaudi.com',mfn(2),'In Progress','Content migration','Content support','SL-005',dago(8),50],
    ['PLT-020','ORG-006','Red Crescent','Emergency Dispatch V1','dispatch.srca.org.sa','Active','SRCA Portal','srca.org.sa',mfn(4),'Planning','Real-time system requirements','Architecture','SL-001',dago(12),10],
  ];
  for (const p of plts) {
    ins.plt.run(...p);
  }

  // === SERVICES (sample) ===
  const svcs = [
    ['SRV-001','PLT-001','Energy License Application','Apply for energy sector licenses','Citizens','Active'],
    ['SRV-002','PLT-001','Energy Permit Issuance','Issue permits for energy projects','Businesses','Active'],
    ['SRV-003','PLT-004','Electricity Bill Payment','Pay electricity bills online','Citizens','Active'],
    ['SRV-004','PLT-005','Patient Registration','Register new patients','Citizens','Active'],
    ['SRV-005','PLT-006','Appointment Booking','Book medical appointments','Citizens','Active'],
    ['SRV-006','PLT-008','Student Enrollment','Enroll students in schools','Citizens','Active'],
    ['SRV-007','PLT-008','Grade Access','View student grades','Citizens','Active'],
    ['SRV-008','PLT-011','Tax Filing','File annual tax returns','Businesses','Active'],
    ['SRV-009','PLT-012','Business Registration','Register new businesses','Businesses','Active'],
    ['SRV-010','PLT-013','Vehicle Registration','Register vehicles','Citizens','Active'],
    ['SRV-011','PLT-016','Passport Renewal','Renew passports','Citizens','Active'],
    ['SRV-012','PLT-017','Building Permit Application','Apply for building permits','Citizens','Active'],
    ['SRV-013','PLT-018','Tourism License Application','Apply for tourism business licenses','Businesses','Active'],
    ['SRV-014','PLT-019','Attraction Booking','Book visits to tourist attractions','Citizens','Active'],
  ];
  for (const s of svcs) {
    ins.svc.run(s[0], s[1], s[2], s[3], s[4], s[5]);
  }

  // === MEETINGS ===
  // Completed meetings
  const m1 = ins.mtg.run('SL-001', 'ORG-001', 'SEC-001', 'Energy Sector Q4 Platform Review', dago(14), '10:00', 'DGA HQ - Room 401', 'review', 'completed',
    'Review consolidation timeline for Energy Portal and Grid Monitoring System',
    'Ahmed confirmed Energy Portal V1 migration on track for Q1. Grid Monitoring data migration plan needs revision—current approach too slow. Billing Portal UAT results positive, target go-live next month.',
    'Energy Portal on track. Grid Monitoring plan revised. Billing Portal approved for production.',
    'Send revised Grid Monitoring migration plan by Friday. Schedule Billing Portal go-live meeting.',
    1).lastInsertRowid;
  const m2 = ins.mtg.run('SL-002', 'ORG-010', 'SEC-004', 'ZATCA Tax Filing System Check-in', dago(7), '14:00', 'Virtual - Teams', 'check-in', 'completed',
    'Discuss Tax Filing System migration progress and peak season readiness',
    'Sara highlighted concern about peak tax season overlap with migration. Load testing shows 70% capacity—need optimization. Team requested 2-week extension for stress testing.',
    'Load testing needs improvement. 2-week extension approved for stress testing. Peak season contingency plan drafted.',
    'ZATCA team to complete stress testing by end of month. Sara to review contingency plan.',
    1).lastInsertRowid;
  const m3 = ins.mtg.run('SL-003', 'ORG-013', 'SEC-006', 'Transport Platform UAT Review', dago(5), '09:00', 'MOT Office - Conference B', 'review', 'completed',
    'Review Vehicle Registration platform UAT results',
    'Mohammed ran live demo—UAT passed with minor UI issues. Traffic system integration 90% complete. Mohammed wants final integration test before sign-off.',
    'UAT mostly passed. Minor UI fixes needed. Final integration test scheduled.',
    'Fix 3 UI issues by next week. Schedule final integration test in 2 weeks.',
    0).lastInsertRowid;

  // Upcoming meetings
  ins.mtg.run('SL-001', 'ORG-004', 'SEC-002', 'Health Sector Consolidation Sprint Review', mfn(0).replace(/\d{2}$/, '15'), '10:00', 'MOH Building - Room 302', 'review', 'scheduled',
    'Review Patient Records and Appointment Portal consolidation progress', null, null, null, 0);
  ins.mtg.run('SL-001', 'ORG-007', 'SEC-003', 'Education Portal Go-Live Prep', mfn(0).replace(/\d{2}$/, '20'), '11:00', 'DGA HQ - Room 201', 'planning', 'scheduled',
    'Prepare for Student Portal go-live and Teacher Certification migration', null, null, null, 0);
  ins.mtg.run('SL-002', 'ORG-011', 'SEC-005', 'Commerce Platform Progress Update', mfn(1), '09:00', 'MC HQ - Meeting Room A', 'check-in', 'scheduled',
    'Status update on Business Registration platform consolidation', null, null, null, 0);
  ins.mtg.run('SL-004', 'ORG-016', 'SEC-008', 'MOI Security Architecture Review', mfn(1), '14:00', 'MOI Campus - Secure Room', 'escalation', 'scheduled',
    'Review security requirements for National ID and Passport platform consolidation', null, null, null, 0);
  ins.mtg.run('SL-005', 'ORG-019', 'SEC-010', 'Tourism Portal Pre-Launch Review', mfn(0).replace(/\d{2}$/, '18'), '10:00', 'MT Office - Board Room', 'review', 'scheduled',
    'Final review before Tourism License Portal go-live', null, null, null, 0);

  // Reminders for completed meeting without updates
  ins.rem.run(m3, 'post_meeting_update', 'Enter post-meeting outcomes for Transport Platform UAT Review', dago(3));

  return NextResponse.json({
    message: 'Seeded successfully',
    counts: { sector_leads: 5, sectors: 10, organizations: 20, platforms: 20, services: 14, meetings: 8, reminders: 1 }
  });
}
