import { NextResponse } from 'next/server';
import { getAllHighRiskZones } from '@/lib/nasa-data-service';

export async function GET() {
  try {
    const data = await getAllHighRiskZones();
    return NextResponse.json(data, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    console.error('Failed to load high risk zones:', error);
    return NextResponse.json({ error: 'Failed to load high risk zones' }, { status: 500 });
  }
}
