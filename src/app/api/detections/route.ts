import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const cameraId = searchParams.get('cameraId');
    const limit = parseInt(searchParams.get('limit') || '20');

    const where = cameraId ? { cameraId } : {};

    const detections = await db.detection.findMany({
      where,
      orderBy: { timestamp: 'desc' },
      take: limit,
      include: {
        camera: true,
      },
    });

    return NextResponse.json(detections);
  } catch (error) {
    console.error('Error fetching detections:', error);
    return NextResponse.json({ error: 'Failed to fetch detections' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { cameraId, imagePath, metadata, confidence } = body;

    if (!cameraId) {
      return NextResponse.json({ error: 'Camera ID is required' }, { status: 400 });
    }

    const detection = await db.detection.create({
      data: {
        cameraId,
        imagePath,
        metadata: metadata ? JSON.stringify(metadata) : null,
        confidence,
      },
      include: {
        camera: true,
      },
    });

    return NextResponse.json(detection, { status: 201 });
  } catch (error) {
    console.error('Error creating detection:', error);
    return NextResponse.json({ error: 'Failed to create detection' }, { status: 500 });
  }
}