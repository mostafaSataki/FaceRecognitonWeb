import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const person = await db.person.findUnique({
      where: { id: params.id },
      include: {
        faceEnrollments: {
          where: { isActive: true },
          orderBy: { createdAt: 'desc' },
        },
        attendanceLogs: {
          orderBy: { timestamp: 'desc' },
          take: 50,
        },
      },
    });

    if (!person) {
      return NextResponse.json({ error: 'Person not found' }, { status: 404 });
    }

    return NextResponse.json(person);
  } catch (error) {
    console.error('Error fetching person:', error);
    return NextResponse.json({ error: 'Failed to fetch person' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { 
      firstName, 
      lastName, 
      nationalCode, 
      employeeId, 
      email, 
      phone, 
      department, 
      position,
      isActive 
    } = body;

    const person = await db.person.update({
      where: { id: params.id },
      data: {
        ...(firstName !== undefined && { firstName }),
        ...(lastName !== undefined && { lastName }),
        ...(nationalCode !== undefined && { nationalCode }),
        ...(employeeId !== undefined && { employeeId }),
        ...(email !== undefined && { email }),
        ...(phone !== undefined && { phone }),
        ...(department !== undefined && { department }),
        ...(position !== undefined && { position }),
        ...(isActive !== undefined && { isActive }),
      },
      include: {
        faceEnrollments: {
          where: { isActive: true },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    return NextResponse.json(person);
  } catch (error) {
    console.error('Error updating person:', error);
    return NextResponse.json({ error: 'Failed to update person' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await db.person.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Person deleted successfully' });
  } catch (error) {
    console.error('Error deleting person:', error);
    return NextResponse.json({ error: 'Failed to delete person' }, { status: 500 });
  }
}