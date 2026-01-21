import { NextRequest, NextResponse } from 'next/server';
import { Platform, Entity } from '@/lib/db';
import { Op } from 'sequelize';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const entityId = searchParams.get('entityId');
    const upcoming = searchParams.get('upcoming');

    let where: any = entityId ? { entityId } : {};

    // Filter for upcoming deadlines (next 4 months)
    if (upcoming === 'true') {
      const today = new Date();
      const fourMonthsLater = new Date();
      fourMonthsLater.setMonth(fourMonthsLater.getMonth() + 4);

      where.deadline = {
        [Op.between]: [today, fourMonthsLater]
      };
    }

    const platforms = await Platform.findAll({
      where,
      include: [{ model: Entity, as: 'entity' }],
      order: [['deadline', 'ASC']]
    });
    return NextResponse.json(platforms);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch platforms' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const platform = await Platform.create(body);
    return NextResponse.json(platform, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create platform' }, { status: 500 });
  }
}
