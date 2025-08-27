import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

export async function GET() {
  try {
    const faceEnrollments = await db.faceEnrollment.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        person: true,
      },
    });

    return NextResponse.json(faceEnrollments);
  } catch (error) {
    console.error('Error fetching face enrollments:', error);
    return NextResponse.json({ error: 'Failed to fetch face enrollments' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { personId, faceData, imagePath, confidence } = body;

    if (!personId || !faceData || !imagePath) {
      return NextResponse.json({ 
        error: 'Person ID, face data, and image path are required' 
      }, { status: 400 });
    }

    // Check if person exists
    const person = await db.person.findUnique({
      where: { id: personId }
    });

    if (!person) {
      return NextResponse.json({ error: 'Person not found' }, { status: 404 });
    }

    // Deactivate existing enrollments for this person
    await db.faceEnrollment.updateMany({
      where: { personId },
      data: { isActive: false }
    });

    const faceEnrollment = await db.faceEnrollment.create({
      data: {
        id: uuidv4(),
        personId,
        faceData,
        imagePath,
        confidence: confidence || 0.0,
      },
      include: {
        person: true,
      },
    });

    return NextResponse.json(faceEnrollment, { status: 201 });
  } catch (error) {
    console.error('Error creating face enrollment:', error);
    return NextResponse.json({ error: 'Failed to create face enrollment' }, { status: 500 });
  }
}