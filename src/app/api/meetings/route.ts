import { NextRequest, NextResponse } from 'next/server';
import { Meeting, Entity, Contact, Sector, Reminder } from '@/lib/db';
import { Op } from 'sequelize';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const entityId = searchParams.get('entityId');
    const status = searchParams.get('status');
    const upcoming = searchParams.get('upcoming');

    let where: any = {};

    if (entityId) {
      where.entityId = entityId;
    }

    if (status) {
      where.status = status;
    }

    if (upcoming === 'true') {
      where.scheduledAt = {
        [Op.gte]: new Date()
      };
      where.status = 'scheduled';
    }

    const meetings = await Meeting.findAll({
      where,
      include: [
        {
          model: Entity,
          as: 'entity',
          include: [{ model: Sector, as: 'sector' }]
        },
        { model: Contact, as: 'contact' }
      ],
      order: [['scheduledAt', upcoming === 'true' ? 'ASC' : 'DESC']]
    });
    return NextResponse.json(meetings);
  } catch (error) {
    console.error('Error fetching meetings:', error);
    return NextResponse.json({ error: 'Failed to fetch meetings' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const meeting = await Meeting.create(body);

    // Create automatic reminder for post-meeting updates
    const reminderTime = new Date(meeting.scheduledAt);
    reminderTime.setMinutes(reminderTime.getMinutes() + meeting.duration + 15);

    await Reminder.create({
      meetingId: meeting.id,
      type: 'post_meeting',
      scheduledFor: reminderTime,
      message: `Don't forget to enter updates for your meeting with ${body.entityName || 'the entity'}!`
    });

    return NextResponse.json(meeting, { status: 201 });
  } catch (error) {
    console.error('Error creating meeting:', error);
    return NextResponse.json({ error: 'Failed to create meeting' }, { status: 500 });
  }
}
