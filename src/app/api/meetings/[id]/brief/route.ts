import { NextRequest, NextResponse } from 'next/server';
import { Meeting, Entity, Contact, Sector, Platform } from '@/lib/db';
import { generateMeetingBrief } from '@/utils/pdfGenerator';
import { Op } from 'sequelize';

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

    // Get platforms with upcoming deadlines (next 4 months)
    const fourMonthsLater = new Date();
    fourMonthsLater.setMonth(fourMonthsLater.getMonth() + 4);

    const platforms = await Platform.findAll({
      where: {
        entityId: meeting.entityId,
        deadline: {
          [Op.between]: [new Date(), fourMonthsLater]
        }
      },
      order: [['deadline', 'ASC']]
    });

    // Get last completed meeting
    const lastMeeting = await Meeting.findOne({
      where: {
        entityId: meeting.entityId,
        status: 'completed',
        scheduledAt: {
          [Op.lt]: meeting.scheduledAt
        }
      },
      order: [['scheduledAt', 'DESC']]
    });

    // Generate PDF
    const pdfBuffer = await generateMeetingBrief({
      meeting: meeting.toJSON(),
      entity: meeting.entity.toJSON(),
      sector: meeting.entity.sector.toJSON(),
      contact: meeting.contact.toJSON(),
      platforms: platforms.map(p => p.toJSON()),
      lastMeeting: lastMeeting ? lastMeeting.toJSON() : null
    });

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="meeting-brief-${meeting.id}.pdf"`
      }
    });
  } catch (error) {
    console.error('Error generating meeting brief:', error);
    return NextResponse.json({ error: 'Failed to generate meeting brief' }, { status: 500 });
  }
}
