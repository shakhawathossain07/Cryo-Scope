'use client';

import { useMemo } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldAlert, Shield, AlertTriangle, Info } from 'lucide-react';
import type { RiskZone } from '@/lib/nasa-data-service';

interface RiskDistributionChartProps {
  zones: RiskZone[];
  height?: number;
}

const RISK_COLORS = {
  CRITICAL: '#ef4444', // red-500
  HIGH: '#f97316',     // orange-500
  MEDIUM: '#eab308',   // yellow-500
  LOW: '#22c55e',      // green-500
};

const RISK_ICONS = {
  CRITICAL: ShieldAlert,
  HIGH: AlertTriangle,
  MEDIUM: Shield,
  LOW: Info,
};

export function RiskDistributionChart({ 
  zones, 
  height = 300 
}: RiskDistributionChartProps) {
  const { chartData, summary } = useMemo(() => {
    const summary = {
      CRITICAL: zones.filter(z => z.riskLevel === 'CRITICAL').length,
      HIGH: zones.filter(z => z.riskLevel === 'HIGH').length,
      MEDIUM: zones.filter(z => z.riskLevel === 'MEDIUM').length,
      LOW: zones.filter(z => z.riskLevel === 'LOW').length,
    };

    const chartData = [
      { name: 'Critical', value: summary.CRITICAL, color: RISK_COLORS.CRITICAL },
      { name: 'High', value: summary.HIGH, color: RISK_COLORS.HIGH },
      { name: 'Medium', value: summary.MEDIUM, color: RISK_COLORS.MEDIUM },
      { name: 'Low', value: summary.LOW, color: RISK_COLORS.LOW },
    ].filter(item => item.value > 0);

    return { chartData, summary };
  }, [zones]);

  const totalZones = zones.length;
  const highRiskCount = summary.CRITICAL + summary.HIGH;
  const highRiskPercentage = totalZones > 0 ? (highRiskCount / totalZones) * 100 : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Risk Assessment Distribution</span>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <ShieldAlert className="h-4 w-4" />
            <span>{totalZones} Zones</span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 md:grid-cols-2">
          {/* Pie Chart */}
          <div>
            <ResponsiveContainer width="100%" height={height}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '6px'
                  }}
                  formatter={(value: number) => [`${value} zones`, undefined]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Summary Cards */}
          <div className="space-y-3">
            {Object.entries(summary).map(([level, count]) => {
              const Icon = RISK_ICONS[level as keyof typeof RISK_ICONS];
              const color = RISK_COLORS[level as keyof typeof RISK_COLORS];
              const percentage = totalZones > 0 ? (count / totalZones) * 100 : 0;

              return (
                <div 
                  key={level}
                  className="flex items-center justify-between rounded-lg border p-3"
                  style={{ borderLeftWidth: '4px', borderLeftColor: color }}
                >
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4" style={{ color }} />
                    <span className="font-medium">{level}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold">{count}</div>
                    <div className="text-xs text-muted-foreground">
                      {percentage.toFixed(0)}%
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Alert Summary */}
        <div className="mt-6 rounded-lg border-2 p-4" style={{ 
          borderColor: highRiskPercentage >= 50 ? RISK_COLORS.CRITICAL : 
                       highRiskPercentage >= 30 ? RISK_COLORS.HIGH : 
                       RISK_COLORS.MEDIUM 
        }}>
          <div className="flex items-center justify-between">
            <div>
              <div className="font-semibold">High Risk Zones</div>
              <div className="text-sm text-muted-foreground">
                Critical and High priority areas requiring immediate attention
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">{highRiskCount}</div>
              <div className="text-sm text-muted-foreground">
                {highRiskPercentage.toFixed(0)}% of total
              </div>
            </div>
          </div>
        </div>

        {/* Zone Details */}
        <div className="mt-4 space-y-2">
          <div className="text-sm font-medium">Active Monitoring Zones:</div>
          <div className="grid gap-2 text-xs md:grid-cols-2">
            {zones.map((zone) => {
              const Icon = RISK_ICONS[zone.riskLevel];
              const color = RISK_COLORS[zone.riskLevel];
              
              return (
                <div key={zone.regionId} className="flex items-center gap-2 rounded border p-2">
                  <Icon className="h-3 w-3 flex-shrink-0" style={{ color }} />
                  <div className="flex-1 truncate">
                    <div className="font-medium">{zone.regionName}</div>
                    <div className="text-muted-foreground">
                      Score: {zone.riskScore}/100
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
