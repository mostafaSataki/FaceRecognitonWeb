import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const door = await db.door.findUnique({
      where: { id: params.id },
      include: {
        cameras: {
          orderBy: { createdAt: 'desc' },
          include: {
            detections: {
              orderBy: { timestamp: 'desc' },
              take: 10,
            },
          },
        },
      },
    });

    if (!door) {
      return NextResponse.json({ error: 'Door not found' }, { status: 404 });
    }

    return NextResponse.json(door);
  } catch (error) {
    console.error('Error fetching door:', error);
    return NextResponse.json({ error: 'Failed to fetch door' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // First, remove door association from cameras
    await db.camera.updateMany({
      where: { doorId: params.id },
      data: { doorId: null },
    });

    // Then delete the door
    await db.door.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Door deleted successfully' });
  } catch (error) {
    console.error('Error deleting door:', error);
    return NextResponse.json({ error: 'Failed to delete door' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { name, location, description, isActive } = body;

    const door = await db.door.update({
      where: { id: params.id },
      data: {
        ...(name && { name }),
        ...(location !== undefined && { location }),
        ...(description !== undefined && { description }),
        ...(isActive !== undefined && { isActive }),
      },
      include: {
        cameras: true,
      },
    });

    return NextResponse.json(door);
  } catch (error) {
    console.error('Error updating door:', error);
    return NextResponse.json({ error: 'Failed to update door' }, { status: 500 });
  }
}