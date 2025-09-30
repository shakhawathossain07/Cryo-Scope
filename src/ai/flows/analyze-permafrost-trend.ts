'use server';

/**
 * @fileOverview Analyzes permafrost SAR data trends to identify significant thawing events and potential methane release risks.
 *
 * - analyzePermafrostTrend - A function that analyzes permafrost trends.
 * - AnalyzePermafrostTrendInput - The input type for the analyzePermafrostTrend function.
 * - AnalyzePermafrostTrendOutput - The return type for the analyzePermafrostTrend function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzePermafrostTrendInputSchema = z.object({
  regionName: z.string().describe('The name of the geographic region being analyzed.'),
  sarDataUri: z
    .string()
    .describe(
      'A data URI containing the SAR data for the permafrost region over time. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.' + 
      'This should include multi-temporal SAR data (e.g., multiple images over time) for the specified region.'
    ),
  opticalDataUri: z
    .string()
    .optional()
    .describe(
      'Optional: A data URI containing optical data (e.g., Landsat imagery) for the same permafrost region. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.' + 
      'This can provide contextual imagery to aid in the analysis.'
    ),
  historicalClimateData: z.string().optional().describe('Historical climate data for the region, provided as a string.'),
});

export type AnalyzePermafrostTrendInput = z.infer<typeof AnalyzePermafrostTrendInputSchema>;

const AnalyzePermafrostTrendOutputSchema = z.object({
  summary: z.string().describe('A summary of the analysis, highlighting significant thawing events and potential methane release risks.'),
  significantEvents: z.array(
    z.object({
      date: z.string().describe('The date of the event.'),
      description: z.string().describe('A description of the event.'),
      riskLevel: z.enum(['low', 'medium', 'high']).describe('The risk level associated with the event.'),
      latitude: z.number().describe('The latitude of the event.'),
      longitude: z.number().describe('The longitude of the event.'),
    })
  ).describe('A list of significant thawing events and potential methane release risks.'),
  recommendations: z.string().describe('Recommendations for further investigation or action.'),
});

export type AnalyzePermafrostTrendOutput = z.infer<typeof AnalyzePermafrostTrendOutputSchema>;

export async function analyzePermafrostTrend(input: AnalyzePermafrostTrendInput): Promise<AnalyzePermafrostTrendOutput> {
  return analyzePermafrostTrendFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzePermafrostTrendPrompt',
  input: {schema: AnalyzePermafrostTrendInputSchema},
  output: {schema: AnalyzePermafrostTrendOutputSchema},
  prompt: `You are an expert in analyzing permafrost SAR data to identify thawing events and methane release risks.

  Analyze the provided SAR data, optical data (if available), and historical climate data to identify significant thawing events and potential methane release risks in the specified region.
  Pay close attention to changes in SAR backscatter and polarization signatures over time, as well as any contextual information provided by the optical data.

  Region Name: {{{regionName}}}
  SAR Data: {{media url=sarDataUri}}
  {{#if opticalDataUri}}Optical Data: {{media url=opticalDataUri}}{{/if}}
  {{#if historicalClimateData}}Historical Climate Data: {{{historicalClimateData}}}{{/if}}

  Based on your analysis, provide a summary of the findings, a list of significant events with dates, descriptions, risk levels, and coordinates, and recommendations for further investigation or action.
  `,
});

const analyzePermafrostTrendFlow = ai.defineFlow(
  {
    name: 'analyzePermafrostTrendFlow',
    inputSchema: AnalyzePermafrostTrendInputSchema,
    outputSchema: AnalyzePermafrostTrendOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
