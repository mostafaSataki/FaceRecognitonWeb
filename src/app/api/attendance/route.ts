import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const personId = searchParams.get('personId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const type = searchParams.get('type'); // ENTRY or EXIT

    const whereClause: any = {};
    
    if (personId) {
      whereClause.personId = personId;
    }
    
    if (type) {
      whereClause.type = type;
    }
    
    if (startDate && endDate) {
      whereClause.timestamp = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    const attendanceLogs = await db.attendanceLog.findMany({
      where: whereClause,
      orderBy: { timestamp: 'desc' },
      include: {
        person: true,
        camera: true,
        door: true,
      },
    });

    return NextResponse.json(attendanceLogs);
  } catch (error) {
    console.error('Error fetching attendance logs:', error);
    return NextResponse.json({ error: 'Failed to fetch attendance logs' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      personId, 
      cameraId, 
      doorId, 
      type, 
      confidence, 
      imagePath, 
      metadata 
    } = body;

    if (!personId || !cameraId || !type) {
      return NextResponse.json({ 
        error: 'Person ID, camera ID, and type are required' 
      }, { status: 400 });
    }

    // Verify person exists
    const person = await db.person.findUnique({
      where: { id: personId }
    });

    if (!person) {
      return NextResponse.json({ error: 'Person not found' }, { status: 404 });
    }

    // Verify camera exists
    const camera = await db.camera.findUnique({
      where: { id: cameraId }
    });

    if (!camera) {
      return NextResponse.json({ error: 'Camera not found' }, { status: 404 });
    }

    // If doorId is provided, verify it exists
    if (doorId) {
      const door = await db.door.findUnique({
        where: { id: doorId }
      });

      if (!door) {
        return NextResponse.json({ error: 'Door not found' }, { status: 404 });
      }
    }

    const attendanceLog = await db.attendanceLog.create({
      data: {
        id: uuidv4(),
        personId,
        cameraId,
        doorId,
        type,
        confidence,
        imagePath,
        metadata,
      },
      include: {
        person: true,
        camera: true,
        door: true,
      },
    });

    return NextResponse.json(attendanceLog, { status: 201 });
  } catch (error) {
    console.error('Error creating attendance log:', error);
    return NextResponse.json({ error: 'Failed to create attendance log' }, { status: 500 });
  }
}