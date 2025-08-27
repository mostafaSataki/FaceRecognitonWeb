import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

export async function GET() {
  try {
    const persons = await db.person.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        faceEnrollments: {
          where: { isActive: true },
          orderBy: { createdAt: 'desc' },
        },
        attendanceLogs: {
          orderBy: { timestamp: 'desc' },
          take: 10,
        },
      },
    });

    return NextResponse.json(persons);
  } catch (error) {
    console.error('Error fetching persons:', error);
    return NextResponse.json({ error: 'Failed to fetch persons' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
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
      position 
    } = body;

    if (!firstName || !lastName) {
      return NextResponse.json({ error: 'First name and last name are required' }, { status: 400 });
    }

    // Check for duplicate national code or employee ID
    if (nationalCode) {
      const existingPerson = await db.person.findUnique({
        where: { nationalCode }
      });
      if (existingPerson) {
        return NextResponse.json({ error: 'National code already exists' }, { status: 400 });
      }
    }

    if (employeeId) {
      const existingPerson = await db.person.findUnique({
        where: { employeeId }
      });
      if (existingPerson) {
        return NextResponse.json({ error: 'Employee ID already exists' }, { status: 400 });
      }
    }

    const person = await db.person.create({
      data: {
        id: uuidv4(),
        firstName,
        lastName,
        nationalCode,
        employeeId,
        email,
        phone,
        department,
        position,
      },
    });

    return NextResponse.json(person, { status: 201 });
  } catch (error) {
    console.error('Error creating person:', error);
    return NextResponse.json({ error: 'Failed to create person' }, { status: 500 });
  }
}