import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { InteractiveMap } from '@/components/dashboard/interactive-map';
import { ShieldAlert, Layers, Thermometer } from 'lucide-react';

export default function DashboardPage() {
  return (
    <div className="flex h-full flex-col">
      <PageHeader
        title="Dashboard"
        description="Interactive overview of permafrost thaw and methane risk."
      />
      <main className="flex-1 overflow-auto p-4 pt-0 md:p-6 md:pt-0">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                High-Risk Zones
              </CardTitle>
              <ShieldAlert className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3</div>
              <p className="text-xs text-muted-foreground">
                Active high-risk methane hotspots detected
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Data Layers Active
              </CardTitle>
              <Layers className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">4</div>
              <p className="text-xs text-muted-foreground">
                (SAR, Optical, Climate, Thaw Stage)
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Avg. Temp Anomaly
              </CardTitle>
              <Thermometer className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+1.5°C</div>
              <p className="text-xs text-muted-foreground">
                In monitored Siberian regions
              </p>
            </CardContent>
          </Card>
        </div>
        <div className="mt-6">
            <InteractiveMap />
        </div>
      </main>
    </div>
  );
}
