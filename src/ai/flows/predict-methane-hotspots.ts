'use server';
/**
 * @fileOverview Predicts areas at high risk of methane release by integrating SAR-derived permafrost thaw stage data and historical climate patterns.
 *
 * - predictMethaneHotspots - A function that predicts methane hotspots.
 * - PredictMethaneHotspotsInput - The input type for the predictMethaneHotspots function.
 * - PredictMethaneHotspotsOutput - The return type for the predictMethaneHotspots function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const PredictMethaneHotspotsInputSchema = z.object({
  sarData: z
    .string()
    .describe(
      'SAR-derived permafrost thaw stage data as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.' 
    ),
  climateData: z
    .string()
    .describe(
      'Historical climate patterns data as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.' 
    ),
  regionDescription: z.string().describe('Description of the region of interest.'),
});
export type PredictMethaneHotspotsInput = z.infer<typeof PredictMethaneHotspotsInputSchema>;

const PredictMethaneHotspotsOutputSchema = z.object({
  riskAssessment: z.string().describe('A detailed risk assessment of potential methane release hotspots.'),
  hotspotMap: z.string().describe('A data URI of a map highlighting high-risk methane release areas.'),
  justification: z.string().describe('Explanation for why the areas are high risk.'),
});
export type PredictMethaneHotspotsOutput = z.infer<typeof PredictMethaneHotspotsOutputSchema>;

export async function predictMethaneHotspots(input: PredictMethaneHotspotsInput): Promise<PredictMethaneHotspotsOutput> {
  return predictMethaneHotspotsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'predictMethaneHotspotsPrompt',
  input: {schema: PredictMethaneHotspotsInputSchema},
  output: {schema: PredictMethaneHotspotsOutputSchema},
  prompt: `You are an expert environmental scientist specializing in permafrost thaw and methane release prediction.

You will use SAR data, historical climate patterns, and the region description to identify areas at high risk of methane release.

SAR Data: {{media url=sarData}}
Climate Data: {{media url=climateData}}
Region Description: {{{regionDescription}}}

Based on this information, provide a risk assessment, a hotspot map, and a justification for your predictions.
`,
});

const predictMethaneHotspotsFlow = ai.defineFlow(
  {
    name: 'predictMethaneHotspotsFlow',
    inputSchema: PredictMethaneHotspotsInputSchema,
    outputSchema: PredictMethaneHotspotsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
