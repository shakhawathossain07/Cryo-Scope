'use client';

import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity } from 'lucide-react';
import type { PrecisionZone } from '@/lib/nasa-data-service';

interface MethaneConcentrationChartProps {
  zones: PrecisionZone[];
  height?: number;
}

export function MethaneConcentrationChart({ 
  zones, 
  height = 300 
}: MethaneConcentrationChartProps) {
  const chartData = useMemo(() => {
    return zones.map((zone) => ({
      name: zone.regionName,
      regionId: zone.regionId,
      concentration: zone.methane.concentration,
      baseline: 1850, // Normal atmospheric methane in PPB
      excess: Math.max(0, zone.methane.concentration - 1850),
      dataSource: zone.methane.dataSource.type,
    }));
  }, [zones]);

  const avgConcentration = useMemo(() => {
    if (zones.length === 0) return 0;
    const sum = zones.reduce((acc, zone) => acc + zone.methane.concentration, 0);
    return sum / zones.length;
  }, [zones]);

  const getBarColor = (concentration: number) => {
    if (concentration >= 2000) return '#ef4444'; // red-500 - Critical
    if (concentration >= 1950) return '#f97316'; // orange-500 - High
    if (concentration >= 1900) return '#eab308'; // yellow-500 - Medium
    return '#22c55e'; // green-500 - Normal
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Methane Concentrations</span>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Activity className="h-4 w-4" />
            <span>Avg: {avgConcentration.toFixed(0)} PPB</span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis 
              dataKey="name" 
              className="text-xs"
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
            />
            <YAxis 
              className="text-xs"
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
              label={{ 
                value: 'Concentration (PPB)', 
                angle: -90, 
                position: 'insideLeft',
                style: { fill: 'hsl(var(--muted-foreground))' }
              }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(var(--background))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '6px'
              }}
              formatter={(value: number, name: string) => {
                if (name === 'Baseline') return [`${value} PPB`, 'Normal Level'];
                return [`${value} PPB`, 'Current Level'];
              }}
            />
            <Legend />
            <Bar 
              dataKey="baseline" 
              fill="#3b82f6" 
              name="Baseline"
              radius={[4, 4, 0, 0]}
            />
            <Bar 
              dataKey="concentration" 
              name="Current"
              radius={[4, 4, 0, 0]}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getBarColor(entry.concentration)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        
        {/* Legend for risk levels */}
        <div className="mt-4 flex flex-wrap gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded bg-green-500"></div>
            <span>Normal (&lt;1900 PPB)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded bg-yellow-500"></div>
            <span>Medium (1900-1950)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded bg-orange-500"></div>
            <span>High (1950-2000)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded bg-red-500"></div>
            <span>Critical (&gt;2000)</span>
          </div>
        </div>

        {/* Data source indicators */}
        <div className="mt-4 grid grid-cols-2 gap-2 text-xs md:grid-cols-4">
          {chartData.map((region) => (
            <div key={region.regionId} className="rounded border p-2">
              <div className="font-medium">{region.name}</div>
              <div className="mt-1 text-muted-foreground">
                {region.dataSource === 'REAL_NASA' ? '✓ NASA Data' : '~ Calculated'}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
