'use client';

import { useMemo } from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown } from 'lucide-react';
import type { RegionTemperatureData } from '@/lib/nasa-data-service';

interface TemperatureTrendChartProps {
  data: RegionTemperatureData[];
  showTrend?: boolean;
  height?: number;
}

export function TemperatureTrendChart({ 
  data, 
  showTrend = true,
  height = 300 
}: TemperatureTrendChartProps) {
  const chartData = useMemo(() => {
    return data.map((region) => ({
      name: region.regionName,
      regionId: region.regionId,
      current: region.temperature.current,
      anomaly: region.temperature.anomaly,
      max: region.temperature.max,
      min: region.temperature.min,
      baseline: region.temperature.current - region.temperature.anomaly,
    }));
  }, [data]);

  const avgAnomaly = useMemo(() => {
    if (data.length === 0) return 0;
    const sum = data.reduce((acc, region) => acc + region.temperature.anomaly, 0);
    return sum / data.length;
  }, [data]);

  const trend = avgAnomaly >= 0 ? 'warming' : 'cooling';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Temperature Anomalies by Region</span>
          {showTrend && (
            <div className={`flex items-center gap-1 text-sm ${avgAnomaly >= 0 ? 'text-orange-500' : 'text-blue-500'}`}>
              {avgAnomaly >= 0 ? (
                <TrendingUp className="h-4 w-4" />
              ) : (
                <TrendingDown className="h-4 w-4" />
              )}
              <span>{avgAnomaly >= 0 ? '+' : ''}{avgAnomaly.toFixed(1)}°C {trend}</span>
            </div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorAnomaly" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f97316" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#f97316" stopOpacity={0.1}/>
              </linearGradient>
              <linearGradient id="colorBaseline" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
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
                value: 'Temperature (°C)', 
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
              formatter={(value: number) => [`${value.toFixed(1)}°C`, undefined]}
            />
            <Legend />
            <Area 
              type="monotone" 
              dataKey="current" 
              stroke="#f97316" 
              fill="url(#colorAnomaly)" 
              name="Current Temp"
              strokeWidth={2}
            />
            <Area 
              type="monotone" 
              dataKey="baseline" 
              stroke="#3b82f6" 
              fill="url(#colorBaseline)" 
              name="Baseline"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
        <div className="mt-4 grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
          {chartData.map((region) => (
            <div key={region.regionId} className="space-y-1">
              <div className="font-medium">{region.name}</div>
              <div className={`text-xs ${region.anomaly >= 0 ? 'text-orange-500' : 'text-blue-500'}`}>
                {region.anomaly >= 0 ? '+' : ''}{region.anomaly.toFixed(1)}°C
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
