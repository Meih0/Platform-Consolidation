import { NextRequest, NextResponse } from 'next/server';
import { Entity, Sector, Contact, Platform, Meeting } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const entity = await Entity.findByPk(params.id, {
      include: [
        { model: Sector, as: 'sector' },
        { model: Contact, as: 'contacts' },
        { model: Platform, as: 'platforms' },
        {
          model: Meeting,
          as: 'meetings',
          include: [{ model: Contact, as: 'contact' }],
          order: [['scheduledAt', 'DESC']],
          limit: 10
        }
      ]
    });

    if (!entity) {
      return NextResponse.json({ error: 'Entity not found' }, { status: 404 });
    }

    return NextResponse.json(entity);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch entity' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const entity = await Entity.findByPk(params.id);

    if (!entity) {
      return NextResponse.json({ error: 'Entity not found' }, { status: 404 });
    }

    await entity.update(body);
    return NextResponse.json(entity);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update entity' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const entity = await Entity.findByPk(params.id);

    if (!entity) {
      return NextResponse.json({ error: 'Entity not found' }, { status: 404 });
    }

    await entity.destroy();
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete entity' }, { status: 500 });
  }
}
