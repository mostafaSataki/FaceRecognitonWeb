import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const camera = await db.camera.findUnique({
      where: { id: params.id },
      include: {
        detections: {
          orderBy: { timestamp: 'desc' },
          take: 50,
        },
        door: true,
      },
    });

    if (!camera) {
      return NextResponse.json({ error: 'Camera not found' }, { status: 404 });
    }

    return NextResponse.json(camera);
  } catch (error) {
    console.error('Error fetching camera:', error);
    return NextResponse.json({ error: 'Failed to fetch camera' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await db.camera.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Camera deleted successfully' });
  } catch (error) {
    console.error('Error deleting camera:', error);
    return NextResponse.json({ error: 'Failed to delete camera' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { isActive, type, doorId, location } = body;

    const camera = await db.camera.update({
      where: { id: params.id },
      data: {
        ...(isActive !== undefined && { isActive }),
        ...(type && { type }),
        ...(doorId !== undefined && { doorId }),
        ...(location !== undefined && { location }),
      },
      include: {
        door: true,
      },
    });

    return NextResponse.json(camera);
  } catch (error) {
    console.error('Error updating camera:', error);
    return NextResponse.json({ error: 'Failed to update camera' }, { status: 500 });
  }
}