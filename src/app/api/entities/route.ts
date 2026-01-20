import { NextRequest, NextResponse } from 'next/server';
import { Entity, Sector, Contact, Platform } from '@/lib/db';

export async function GET() {
  try {
    const entities = await Entity.findAll({
      include: [
        { model: Sector, as: 'sector' },
        { model: Contact, as: 'contacts' },
        { model: Platform, as: 'platforms' }
      ],
      order: [['name', 'ASC']]
    });
    return NextResponse.json(entities);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch entities' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const entity = await Entity.create(body);
    return NextResponse.json(entity, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create entity' }, { status: 500 });
  }
}
