import { NextRequest, NextResponse } from 'next/server';
import { Meeting, Entity, Contact, Sector } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const meeting = await Meeting.findByPk(params.id, {
      include: [
        {
          model: Entity,
          as: 'entity',
          include: [{ model: Sector, as: 'sector' }]
        },
        { model: Contact, as: 'contact' }
      ]
    });

    if (!meeting) {
      return NextResponse.json({ error: 'Meeting not found' }, { status: 404 });
    }

    return NextResponse.json(meeting);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch meeting' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const meeting = await Meeting.findByPk(params.id);

    if (!meeting) {
      return NextResponse.json({ error: 'Meeting not found' }, { status: 404 });
    }

    await meeting.update(body);
    return NextResponse.json(meeting);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update meeting' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const meeting = await Meeting.findByPk(params.id);

    if (!meeting) {
      return NextResponse.json({ error: 'Meeting not found' }, { status: 404 });
    }

    await meeting.destroy();
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete meeting' }, { status: 500 });
  }
}
