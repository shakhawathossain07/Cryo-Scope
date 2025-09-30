import { NextResponse } from 'next/server';
import { getTransparentDashboardData } from '@/lib/nasa-data-service';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const data = await getTransparentDashboardData();
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'no-store'
      }
    });
  } catch (error) {
    console.error('Failed to load transparent dashboard data:', error);
    return NextResponse.json(
      {
        error: 'Failed to load NASA dashboard data',
        usingFallback: true
      },
      { status: 500 }
    );
  }
}
