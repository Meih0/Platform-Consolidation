import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    // Dynamically import to avoid build-time execution
    const { sequelize, Sector, Entity, Contact, Platform, Meeting, Reminder } = await import('@/lib/db');

    // Test connection
    await sequelize.authenticate();

    // Sync all models (create tables)
    await sequelize.sync({ alter: true });

    return NextResponse.json({
      success: true,
      message: 'Database initialized successfully! All tables created.'
    });
  } catch (error: any) {
    console.error('Database initialization error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to initialize database'
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Send a POST request to this endpoint to initialize the database tables.',
    note: 'This will create all necessary tables in your Neon database.'
  });
}
