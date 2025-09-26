'use server';

import { predictMethaneHotspots } from '@/ai/flows/predict-methane-hotspots';
import { getPlaceholderImage } from '@/lib/placeholder-images';
import { z } from 'zod';

const formSchema = z.object({
  regionDescription: z.string(),
  sarData: z.string(),
  climateData: z.string(),
});

// A base64 encoded 1x1 transparent PNG
const FAKE_DATA_URI = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

export async function predictMethaneHotspotsAction(input: z.infer<typeof formSchema>) {
  
  const result = await predictMethaneHotspots({
    regionDescription: input.regionDescription,
    sarData: input.sarData || FAKE_DATA_URI,
    climateData: input.climateData || FAKE_DATA_URI,
  });
  
  return result;
}
