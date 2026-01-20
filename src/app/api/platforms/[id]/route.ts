import { NextRequest, NextResponse } from 'next/server';
import { Platform } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const platform = await Platform.findByPk(params.id);

    if (!platform) {
      return NextResponse.json({ error: 'Platform not found' }, { status: 404 });
    }

    return NextResponse.json(platform);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch platform' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const platform = await Platform.findByPk(params.id);

    if (!platform) {
      return NextResponse.json({ error: 'Platform not found' }, { status: 404 });
    }

    await platform.update(body);
    return NextResponse.json(platform);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update platform' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const platform = await Platform.findByPk(params.id);

    if (!platform) {
      return NextResponse.json({ error: 'Platform not found' }, { status: 404 });
    }

    await platform.destroy();
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete platform' }, { status: 500 });
  }
}
