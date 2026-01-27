import { getDb } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const db = getDb();
  const platformId = req.nextUrl.searchParams.get('platform_id');

  let query = 'SELECT * FROM services';
  const params: any[] = [];

  if (platformId) {
    query += ' WHERE platform_id = ?';
    params.push(platformId);
  }
  query += ' ORDER BY id';

  const services = db.prepare(query).all(...params);
  return NextResponse.json(services);
}

export async function POST(req: NextRequest) {
  const db = getDb();
  const body = await req.json();
  db.prepare('INSERT INTO services (id, name_en, name_ar, platform_id, status, user_count, transaction_volume) VALUES (?,?,?,?,?,?,?)').run(
    body.id, body.name_en, body.name_ar || null, body.platform_id || null,
    body.status || 'Active', body.user_count || null, body.transaction_volume || null
  );
  const row = db.prepare('SELECT * FROM services WHERE id = ?').get(body.id);
  return NextResponse.json(row, { status: 201 });
}
