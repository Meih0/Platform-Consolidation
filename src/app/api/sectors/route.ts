import { NextRequest, NextResponse } from 'next/server';
import { Sector } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const sectors = await Sector.findAll({
      order: [['name', 'ASC']]
    });
    return NextResponse.json(sectors);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch sectors' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const sector = await Sector.create(body);
    return NextResponse.json(sector, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create sector' }, { status: 500 });
  }
}
