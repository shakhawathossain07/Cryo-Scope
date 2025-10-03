'use server';

import { analyzePermafrostTrend } from '@/ai/flows/analyze-permafrost-trend';
import { z } from 'zod';
import { SupabaseService, PermafrostData } from '@/lib/supabase';

type FormSchema = z.infer<typeof formSchemaDefinition>;

const formSchemaDefinition = z.object({
  regionName: z.string(),
  historicalClimateData: z.string().optional(),
  sarDataUri: z.string(),
  opticalDataUri: z.string().optional(),
});

// A base64 encoded 1x1 transparent PNG
const FAKE_IMAGE_DATA_URI = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

export async function analyzePermafrostTrendAction(input: FormSchema) {
  try {
    const result = await analyzePermafrostTrend({
      regionName: input.regionName,
      sarDataUri: input.sarDataUri || FAKE_IMAGE_DATA_URI,
      opticalDataUri: input.opticalDataUri || FAKE_IMAGE_DATA_URI,
      historicalClimateData: input.historicalClimateData,
    });

    // Generate and save synthetic permafrost data
    if (result) {
      const syntheticData: Omit<PermafrostData, 'id' | 'created_at'> = {
        latitude: 70.0 + (Math.random() - 0.5) * 10,
        longitude: -150.0 + (Math.random() - 0.5) * 20,
        temperature: -5 + Math.random() * 10, // Temperature in Celsius
        depth: 0.5 + Math.random() * 2.5, // Depth in meters
        methane_levels: Math.random() * 50, // ppm
        timestamp: new Date().toISOString()
      };

      try {
        await SupabaseService.addPermafrostData(syntheticData);
      } catch (error) {
        console.warn('Failed to save permafrost data to Supabase:', error);
      }
    }

    return result;
  } catch (error) {
    console.error('Analysis error:', error);
    throw new Error('Failed to analyze permafrost trend');
  }
}

export async function getPermafrostDataAction(limit = 100) {
  try {
    return await SupabaseService.getPermafrostData(limit);
  } catch (error) {
    console.error('Error fetching permafrost data:', error);
    return [];
  }
}
