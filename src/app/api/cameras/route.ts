import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

export async function GET() {
  try {
    const cameras = await db.camera.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        detections: {
          orderBy: { timestamp: 'desc' },
          take: 5,
        },
        door: true,
      },
    });

    return NextResponse.json(cameras);
  } catch (error) {
    console.error('Error fetching cameras:', error);
    return NextResponse.json({ error: 'Failed to fetch cameras' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, rtspUrl, type, doorId, location } = body;

    if (!name || !rtspUrl) {
      return NextResponse.json({ error: 'Name and RTSP URL are required' }, { status: 400 });
    }

    const camera = await db.camera.create({
      data: {
        id: uuidv4(),
        name,
        rtspUrl,
        type: type || 'ENTRY',
        doorId,
        location,
      },
      include: {
        door: true,
      },
    });

    return NextResponse.json(camera, { status: 201 });
  } catch (error) {
    console.error('Error creating camera:', error);
    return NextResponse.json({ error: 'Failed to create camera' }, { status: 500 });
  }
}