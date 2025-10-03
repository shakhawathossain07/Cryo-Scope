import { NextRequest, NextResponse } from 'next/server';
import { getMethaneHotspots, getTemperatureData } from '@/lib/nasa-data-service';
import { REGION_COORDINATES, type RegionKey } from '@/lib/regions';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ regionId: string }> }
) {
  const { regionId: regionIdRaw } = await params;
  const regionId = regionIdRaw as RegionKey;
  const regionConfig = REGION_COORDINATES[regionId];

  if (!regionConfig) {
    return NextResponse.json(
      { error: `Unknown region '${regionIdRaw}'` },
      { status: 400 }
    );
  }

  try {
    const [hotspots, temperature] = await Promise.all([
      getMethaneHotspots(regionId),
      getTemperatureData(regionId)
    ]);

    return NextResponse.json({
      regionId,
      regionName: regionConfig.name,
      hotspots,
      temperature
    });
  } catch (error) {
    console.error(`Failed to load metrics for region ${regionId}:`, error);
    return NextResponse.json(
      { error: 'Failed to load region metrics', regionId },
      { status: 500 }
    );
  }
}
