import { getDb } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const db = getDb();
  const orgId = req.nextUrl.searchParams.get('org_id');
  const sectorLeadId = req.nextUrl.searchParams.get('sector_lead_id');

  let query = `
    SELECT p.*, o.name_en as org_name, s.name_en as sector_name
    FROM platforms p
    LEFT JOIN organizations o ON p.org_id = o.id
    LEFT JOIN sectors s ON o.sector_id = s.id
  `;
  const conditions: string[] = [];
  const params: any[] = [];

  if (orgId) {
    conditions.push('p.org_id = ?');
    params.push(orgId);
  }
  if (sectorLeadId) {
    conditions.push('s.sector_lead_id = ?');
    params.push(sectorLeadId);
  }
  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }
  query += ' ORDER BY p.id';

  const platforms = db.prepare(query).all(...params);
  return NextResponse.json(platforms);
}

export async function POST(req: NextRequest) {
  const db = getDb();
  const body = await req.json();
  db.prepare('INSERT INTO platforms (id, name_en, name_ar, org_id, url, status, consolidation_deadline, platform_type, tech_stack) VALUES (?,?,?,?,?,?,?,?,?)').run(
    body.id, body.name_en, body.name_ar || null, body.org_id || null,
    body.url || null, body.status || 'Active', body.consolidation_deadline || null,
    body.platform_type || null, body.tech_stack || null
  );
  const row = db.prepare('SELECT * FROM platforms WHERE id = ?').get(body.id);
  return NextResponse.json(row, { status: 201 });
}
