'use client';

import { useState } from 'react';
import Image from 'next/image';
import { MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { getPlaceholderImage } from '@/lib/placeholder-images';
import { regions } from '@/lib/data';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const mockDataPoints = {
  siberia: [
    { id: 1, top: '35%', left: '60%', risk: 'high', label: 'Yamal Crater 1' },
    { id: 2, top: '45%', left: '75%', risk: 'medium', label: 'Lena River Delta' },
    { id: 3, top: '25%', left: '50%', risk: 'low', label: 'Taimyr Peninsula' },
  ],
  alaska: [
    { id: 4, top: '40%', left: '20%', risk: 'medium', label: 'Prudhoe Bay' },
    { id: 5, top: '50%', left: '30%', risk: 'high', label: 'Teshekpuk Lake' },
  ],
  canada: [
    { id: 6, top: '20%', left: '40%', risk: 'low', label: 'Banks Island' },
  ],
  greenland: [
    { id: 7, top: '60%', left: '10%', risk: 'medium', label: 'Kangerlussuaq' },
  ]
};

export function InteractiveMap() {
  const [selectedRegion, setSelectedRegion] = useState(regions[0].id);
  const mapImage = getPlaceholderImage('map-base');

  const currentPoints = mockDataPoints[selectedRegion as keyof typeof mockDataPoints] || [];

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>Thaw & Methane Risk Map</CardTitle>
        <Select value={selectedRegion} onValueChange={setSelectedRegion}>
          <SelectTrigger className="w-[220px]">
            <SelectValue placeholder="Select a region" />
          </SelectTrigger>
          <SelectContent>
            {regions.map((region) => (
              <SelectItem key={region.id} value={region.id}>
                {region.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <TooltipProvider>
          <div className="relative aspect-[3/2] w-full overflow-hidden rounded-lg border">
            {mapImage && (
              <Image
                src={mapImage.imageUrl}
                alt={mapImage.description}
                fill
                className="object-cover"
                data-ai-hint={mapImage.imageHint}
              />
            )}
            {currentPoints.map((point) => (
              <Tooltip key={point.id}>
                <TooltipTrigger asChild>
                  <div
                    className="absolute -translate-x-1/2 -translate-y-1/2 transform-gpu"
                    style={{ top: point.top, left: point.left }}
                  >
                    <MapPin
                      className={cn(
                        'h-8 w-8 drop-shadow-lg transition-transform hover:scale-125',
                        point.risk === 'high' && 'text-accent fill-accent/30',
                        point.risk === 'medium' && 'text-yellow-400 fill-yellow-400/30',
                        point.risk === 'low' && 'text-primary fill-primary/30'
                      )}
                    />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p className='font-semibold'>{point.label}</p>
                  <p>Risk Level: <span className={cn(
                        point.risk === 'high' && 'text-accent',
                        point.risk === 'medium' && 'text-yellow-400',
                        point.risk === 'low' && 'text-primary'
                      )}>{point.risk}</span></p>
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
        </TooltipProvider>
      </CardContent>
    </Card>
  );
}
