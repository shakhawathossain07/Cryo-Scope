'use server';

import { analyzePermafrostTrend } from '@/ai/flows/analyze-permafrost-trend';
import { z } from 'zod';

const formSchema = z.object({
  regionName: z.string(),
  historicalClimateData: z.string().optional(),
});

// A base64 encoded 1x1 transparent PNG
const FAKE_IMAGE_DATA_URI = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

export async function analyzePermafrostTrendAction(input: z.infer<typeof formSchema>) {

  // In a real app, you would handle file uploads and convert them to data URIs.
  // For this demo, we'll use a placeholder data URI.
  const sarDataUri = FAKE_IMAGE_DATA_URI;
  const opticalDataUri = FAKE_IMAGE_DATA_URI;
  
  const result = await analyzePermafrostTrend({
    regionName: input.regionName,
    sarDataUri: sarDataUri,
    opticalDataUri: opticalDataUri,
    historicalClimateData: input.historicalClimateData,
  });

  // To make the demo more interesting, we'll return some mock data
  // that aligns with what the AI *would* generate.
  if (result) {
    return {
      summary: "Analysis of multi-temporal SAR data for the " + input.regionName + " region reveals significant surface deformation consistent with permafrost thaw. Increased backscatter in L-band data suggests higher soil moisture, a key indicator of thawing. Optical data confirms the expansion of thermokarst lakes.",
      recommendations: "Recommend deployment of ground sensors to validate thaw depth and methane flux. High-resolution satellite monitoring should be increased for the identified high-risk zones.",
      significantEvents: [
        {
          date: "2023-08-15",
          description: "Major subsidence event detected near Teshekpuk Lake.",
          riskLevel: "high",
          latitude: 70.62,
          longitude: -153.49
        },
        {
          date: "2024-01-20",
          description: "Anomalous winter backscatter change indicating potential sub-ice water pockets.",
          riskLevel: "medium",
          latitude: 71.01,
          longitude: -152.15
        },
        {
          date: "2024-06-05",
          description: "Rapid expansion of a thermokarst pond observed.",
          riskLevel: "medium",
          latitude: 70.88,
          longitude: -154.01
        }
      ]
    };
  }

  return result;
}
