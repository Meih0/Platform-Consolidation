import { NextRequest, NextResponse } from 'next/server';
import { Sector, Entity } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const sector = await Sector.findByPk(params.id, {
      include: [{ model: Entity, as: 'entities' }]
    });

    if (!sector) {
      return NextResponse.json({ error: 'Sector not found' }, { status: 404 });
    }

    return NextResponse.json(sector);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch sector' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const sector = await Sector.findByPk(params.id);

    if (!sector) {
      return NextResponse.json({ error: 'Sector not found' }, { status: 404 });
    }

    await sector.update(body);
    return NextResponse.json(sector);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update sector' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const sector = await Sector.findByPk(params.id);

    if (!sector) {
      return NextResponse.json({ error: 'Sector not found' }, { status: 404 });
    }

    await sector.destroy();
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete sector' }, { status: 500 });
  }
}
