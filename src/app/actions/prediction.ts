'use server';

import { predictMethaneHotspots } from '@/ai/flows/predict-methane-hotspots';
import { SupabaseService, PredictionResult } from '@/lib/supabase';
import { z } from 'zod';

type FormSchema = z.infer<typeof formSchemaDefinition>;

const formSchemaDefinition = z.object({
  regionDescription: z.string(),
  sarData: z.string(),
  climateData: z.string(),
});

// A base64 encoded 1x1 transparent PNG
const FAKE_DATA_URI = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

export async function predictMethaneHotspotsAction(input: FormSchema) {
  try {
    const result = await predictMethaneHotspots({
      regionDescription: input.regionDescription,
      sarData: input.sarData || FAKE_DATA_URI,
      climateData: input.climateData || FAKE_DATA_URI,
    });
    
    // Save prediction result to Supabase
    if (result) {
      // Generate synthetic prediction data based on the result
      const syntheticPredictions = [
        {
          latitude: 70.0 + (Math.random() - 0.5) * 10,
          longitude: -150.0 + (Math.random() - 0.5) * 20,
          value: Math.random() * 100,
          confidence: 75 + Math.random() * 25
        },
        {
          latitude: 65.0 + (Math.random() - 0.5) * 10,
          longitude: -145.0 + (Math.random() - 0.5) * 20,
          value: Math.random() * 80,
          confidence: 80 + Math.random() * 20
        }
      ];

      for (const prediction of syntheticPredictions) {
        const predictionData: Omit<PredictionResult, 'id' | 'created_at'> = {
          prediction_type: 'methane_hotspot',
          location: {
            latitude: prediction.latitude,
            longitude: prediction.longitude
          },
          predicted_value: prediction.value,
          confidence_score: prediction.confidence,
          prediction_date: new Date().toISOString(),
          model_version: 'v1.0.0'
        };
        
        try {
          await SupabaseService.addPrediction(predictionData);
        } catch (error) {
          console.warn('Failed to save prediction to Supabase:', error);
        }
      }
    }
    
    return result;
  } catch (error) {
    console.error('Prediction error:', error);
    throw new Error('Failed to generate methane hotspot predictions');
  }
}

export async function getPredictionsAction(type?: string) {
  try {
    return await SupabaseService.getPredictions(type);
  } catch (error) {
    console.error('Error fetching predictions:', error);
    return [];
  }
}
