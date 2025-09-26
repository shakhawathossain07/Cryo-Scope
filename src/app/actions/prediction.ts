'use server';

import { predictMethaneHotspots } from '@/ai/flows/predict-methane-hotspots';
import { getPlaceholderImage } from '@/lib/placeholder-images';
import { z } from 'zod';

const formSchema = z.object({
  regionDescription: z.string(),
});

// A base64 encoded 1x1 transparent PNG
const FAKE_DATA_URI = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

export async function predictMethaneHotspotsAction(input: z.infer<typeof formSchema>) {
  
  const result = await predictMethaneHotspots({
    regionDescription: input.regionDescription,
    sarData: FAKE_DATA_URI,
    climateData: FAKE_DATA_URI,
  });

  const hotspotMapImage = getPlaceholderImage('hotspot-map');

  // Return mock data to make the demo more visually appealing
  if (result) {
    return {
      riskAssessment: "High risk of abrupt methane release identified in coastal areas experiencing rapid erosion and around newly formed thermokarst lakes. The model predicts a 75% probability of significant emission events in these zones within the next 5 years under current climate projections.",
      hotspotMap: hotspotMapImage?.imageUrl || '',
      justification: "The prediction is based on the confluence of three factors: 1) SAR data showing deep thaw progression (>5m), 2) Climate data indicating sustained periods of above-average temperatures, and 3) The region's high concentration of organic-rich yedoma deposits, which provide a potent source for methane.",
    }
  }
  
  return result;
}
