import { getDb } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  const db = getDb();
  const sectors = db.prepare('SELECT * FROM sectors ORDER BY name').all();
  return NextResponse.json(sectors);
}

export async function POST(req: NextRequest) {
  const db = getDb();
  const { name, description } = await req.json();
  const result = db.prepare('INSERT INTO sectors (name, description) VALUES (?, ?)').run(name, description ?? null);
  const row = db.prepare('SELECT * FROM sectors WHERE id = ?').get(result.lastInsertRowid);
  return NextResponse.json(row, { status: 201 });
}
