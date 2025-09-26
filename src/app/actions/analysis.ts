'use server';

import { analyzePermafrostTrend } from '@/ai/flows/analyze-permafrost-trend';
import { z } from 'zod';
import { getPlaceholderImage } from '@/lib/placeholder-images';


const formSchema = z.object({
  regionName: z.string(),
  historicalClimateData: z.string().optional(),
  sarDataUri: z.string(),
  opticalDataUri: z.string().optional(),
});

// A base64 encoded 1x1 transparent PNG
const FAKE_IMAGE_DATA_URI = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

export async function analyzePermafrostTrendAction(input: z.infer<typeof formSchema>) {
  const result = await analyzePermafrostTrend({
    regionName: input.regionName,
    sarDataUri: input.sarDataUri || FAKE_IMAGE_DATA_URI,
    opticalDataUri: input.opticalDataUri || FAKE_IMAGE_DATA_URI,
    historicalClimateData: input.historicalClimateData,
  });

  return result;
}
