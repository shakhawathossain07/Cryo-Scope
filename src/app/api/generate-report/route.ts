/**
 * NASA-Grade Scientific Report Generation API
 * 
 * Generates comprehensive research-grade reports using real-time
 * dashboard data and Google Gemini AI
 */

import { NextRequest, NextResponse } from 'next/server';
import { generateScientificReport, generateRegionSummary, type DashboardData } from '@/lib/scientific-report-service';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/generate-report
 * 
 * Query Parameters:
 * - region (optional): Filter report to specific region (siberia, alaska, canada, greenland)
 * - format (optional): 'full' (default) or 'summary'
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const region = searchParams.get('region');
    const format = searchParams.get('format') || 'full';

    // Fetch real-time dashboard data
    const dashboardUrl = new URL('/api/transparent-dashboard', request.url);
    const dashboardResponse = await fetch(dashboardUrl.toString());
    
    if (!dashboardResponse.ok) {
      throw new Error(`Failed to fetch dashboard data: ${dashboardResponse.statusText}`);
    }

    const rawDashboardData = await dashboardResponse.json();

    // Transform the raw dashboard data to match the expected DashboardData interface
    const dashboardData: DashboardData = {
      regionTemperatureData: (rawDashboardData.realTemperatureData || []).map((region: any) => ({
        regionId: region.regionId,
        regionName: region.regionName,
        temperature: {
          current: region.temperature?.current || 0,
          anomaly: region.temperature?.anomaly || 0,
          max: region.temperature?.max || 0,
          min: region.temperature?.min || 0,
          dataSource: region.temperature?.dataSource || {
            type: 'NASA POWER API',
            source: 'NASA',
            confidence: region.confidence || 0,
          },
        },
        confidence: region.confidence || 0,
      })),
      regionMethaneSummary: (rawDashboardData.regionMethaneSummary || []).map((region: any) => ({
        regionId: region.regionId,
        regionName: region.regionName,
        methane: {
          concentration: region.methane?.concentration || 0,
          unit: region.methane?.unit || 'PPB',
          dataSource: region.methane?.dataSource || {
            type: 'Sentinel-5P TROPOMI',
            source: 'Sentinel Hub',
            confidence: region.hotspot?.confidence || 85,
          },
        },
      })),
      riskZones: (rawDashboardData.algorithmicRiskAssessment?.zones || []).map((zone: any) => ({
        regionId: zone.regionId,
        regionName: zone.regionName,
        riskLevel: zone.riskLevel,
        riskScore: zone.riskScore,
        factors: zone.factors || {
          temperatureAnomaly: 0,
          estimatedMethane: 0,
          geographicRisk: false,
        },
        dataSource: zone.dataSource || {
          confidence: 80,
        },
      })),
    };

    // Validate dashboard data structure
    if (!dashboardData || 
        !dashboardData.regionTemperatureData || 
        !dashboardData.regionMethaneSummary || 
        !dashboardData.riskZones) {
      console.error('[API /generate-report] Invalid dashboard data structure:', dashboardData);
      throw new Error('Invalid dashboard data structure received');
    }

    // Generate report or summary based on format
    if (format === 'summary' && region) {
      const summary = await generateRegionSummary(dashboardData, region);
      return NextResponse.json({
        success: true,
        format: 'summary',
        region,
        summary,
        generatedAt: new Date().toISOString(),
      });
    }

    // Generate full scientific report
    const report = await generateScientificReport(dashboardData, region || undefined);

    return NextResponse.json({
      success: true,
      format: 'full',
      region: region || 'all',
      report,
      dataSnapshot: {
        totalRegions: dashboardData.regionTemperatureData?.length || 0,
        avgTemperatureAnomaly: dashboardData.regionTemperatureData?.length > 0 ? (
          dashboardData.regionTemperatureData.reduce((sum, r) => sum + r.temperature.anomaly, 0) /
          dashboardData.regionTemperatureData.length
        ).toFixed(2) : '0.00',
        avgMethaneConcentration: dashboardData.regionMethaneSummary?.length > 0 ? (
          dashboardData.regionMethaneSummary.reduce((sum, r) => sum + r.methane.concentration, 0) /
          dashboardData.regionMethaneSummary.length
        ).toFixed(0) : '0',
        highRiskRegions: dashboardData.riskZones?.filter(r => 
          r.riskLevel === 'HIGH' || r.riskLevel === 'CRITICAL'
        ).length || 0,
      },
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[API /generate-report] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json(
      { success: false, error: 'Internal Server Error', details: errorMessage },
      { status: 500 }
    );
  }
}

/**
 * POST /api/generate-report
 * 
 * Body:
 * {
 *   region?: string,
 *   format?: 'full' | 'summary',
 *   customPrompt?: string,
 *   dashboardData?: DashboardData  // Optional: provide your own data
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { region, format = 'full', dashboardData: providedData } = body;

    // Use provided data or fetch from dashboard
    let dashboardData: DashboardData;
    if (providedData) {
      dashboardData = providedData;
    } else {
      const dashboardUrl = new URL('/api/transparent-dashboard', request.url);
      const dashboardResponse = await fetch(dashboardUrl.toString());
      
      if (!dashboardResponse.ok) {
        throw new Error('Failed to fetch dashboard data');
      }

      dashboardData = await dashboardResponse.json();
    }

    // Generate report
    if (format === 'summary' && region) {
      const summary = await generateRegionSummary(dashboardData, region);
      return NextResponse.json({
        success: true,
        format: 'summary',
        region,
        summary,
        generatedAt: new Date().toISOString(),
      });
    }

    const report = await generateScientificReport(dashboardData, region);

    return NextResponse.json({
      success: true,
      format: 'full',
      region: region || 'all',
      report,
      dataSnapshot: {
        totalRegions: dashboardData.regionTemperatureData.length,
        avgTemperatureAnomaly: (
          dashboardData.regionTemperatureData.reduce((sum, r) => sum + r.temperature.anomaly, 0) /
          dashboardData.regionTemperatureData.length
        ).toFixed(2),
        avgMethaneConcentration: (
          dashboardData.regionMethaneSummary.reduce((sum, r) => sum + r.methane.concentration, 0) /
          dashboardData.regionMethaneSummary.length
        ).toFixed(0),
        highRiskRegions: dashboardData.riskZones.filter(r => 
          r.riskLevel === 'HIGH' || r.riskLevel === 'CRITICAL'
        ).length,
      },
    });

  } catch (error) {
    console.error('Report generation error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to generate scientific report',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
