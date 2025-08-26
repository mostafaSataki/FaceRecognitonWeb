import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

export async function GET() {
  try {
    const doors = await db.door.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        cameras: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    return NextResponse.json(doors);
  } catch (error) {
    console.error('Error fetching doors:', error);
    return NextResponse.json({ error: 'Failed to fetch doors' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, location, description } = body;

    if (!name) {
      return NextResponse.json({ error: 'Door name is required' }, { status: 400 });
    }

    const door = await db.door.create({
      data: {
        id: uuidv4(),
        name,
        location,
        description,
      },
      include: {
        cameras: true,
      },
    });

    return NextResponse.json(door, { status: 201 });
  } catch (error) {
    console.error('Error creating door:', error);
    return NextResponse.json({ error: 'Failed to create door' }, { status: 500 });
  }
}