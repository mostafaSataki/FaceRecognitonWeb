import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const department = searchParams.get('department');
    const reportType = searchParams.get('type') || 'summary'; // summary, detailed, daily

    if (!startDate || !endDate) {
      return NextResponse.json({ 
        error: 'Start date and end date are required' 
      }, { status: 400 });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    // Base where clause for attendance logs
    const whereClause: any = {
      timestamp: {
        gte: start,
        lte: end,
      },
    };

    if (department) {
      whereClause.person = {
        department: department,
      };
    }

    if (reportType === 'summary') {
      // Generate summary report
      const attendanceLogs = await db.attendanceLog.findMany({
        where: whereClause,
        include: {
          person: true,
        },
      });

      // Group by person and calculate statistics
      const personStats = new Map();
      
      attendanceLogs.forEach(log => {
        const personId = log.personId;
        if (!personStats.has(personId)) {
          personStats.set(personId, {
            person: log.person,
            entryCount: 0,
            exitCount: 0,
            firstEntry: null,
            lastExit: null,
          });
        }
        
        const stats = personStats.get(personId);
        if (log.type === 'ENTRY') {
          stats.entryCount++;
          if (!stats.firstEntry || log.timestamp < stats.firstEntry) {
            stats.firstEntry = log.timestamp;
          }
        } else if (log.type === 'EXIT') {
          stats.exitCount++;
          if (!stats.lastExit || log.timestamp > stats.lastExit) {
            stats.lastExit = log.timestamp;
          }
        }
      });

      const summary = Array.from(personStats.values()).map(stats => ({
        person: stats.person,
        totalEntries: stats.entryCount,
        totalExits: stats.exitCount,
        firstEntry: stats.firstEntry,
        lastExit: stats.lastExit,
      }));

      return NextResponse.json({
        reportType: 'summary',
        period: { start, end },
        totalRecords: attendanceLogs.length,
        summary,
      });

    } else if (reportType === 'detailed') {
      // Generate detailed report
      const attendanceLogs = await db.attendanceLog.findMany({
        where: whereClause,
        orderBy: { timestamp: 'desc' },
        include: {
          person: true,
          camera: true,
          door: true,
        },
      });

      return NextResponse.json({
        reportType: 'detailed',
        period: { start, end },
        totalRecords: attendanceLogs.length,
        records: attendanceLogs,
      });

    } else if (reportType === 'daily') {
      // Generate daily summary report
      const attendanceLogs = await db.attendanceLog.findMany({
        where: whereClause,
        include: {
          person: true,
        },
      });

      // Group by date and person
      const dailyStats = new Map();
      
      attendanceLogs.forEach(log => {
        const date = log.timestamp.toISOString().split('T')[0];
        const personId = log.personId;
        
        const dateKey = `${date}_${personId}`;
        if (!dailyStats.has(dateKey)) {
          dailyStats.set(dateKey, {
            date,
            person: log.person,
            entries: [],
            exits: [],
          });
        }
        
        const stats = dailyStats.get(dateKey);
        if (log.type === 'ENTRY') {
          stats.entries.push(log.timestamp);
        } else if (log.type === 'EXIT') {
          stats.exits.push(log.timestamp);
        }
      });

      const dailySummary = Array.from(dailyStats.values()).map(stats => ({
        date: stats.date,
        person: stats.person,
        entryCount: stats.entries.length,
        exitCount: stats.exits.length,
        firstEntry: stats.entries.length > 0 ? Math.min(...stats.entries.map(e => new Date(e).getTime())) : null,
        lastExit: stats.exits.length > 0 ? Math.max(...stats.exits.map(e => new Date(e).getTime())) : null,
      }));

      return NextResponse.json({
        reportType: 'daily',
        period: { start, end },
        totalRecords: attendanceLogs.length,
        dailySummary,
      });
    }

    return NextResponse.json({ error: 'Invalid report type' }, { status: 400 });
  } catch (error) {
    console.error('Error generating attendance report:', error);
    return NextResponse.json({ error: 'Failed to generate attendance report' }, { status: 500 });
  }
}