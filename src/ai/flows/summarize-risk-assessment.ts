'use server';

/**
 * @fileOverview Summarizes risk assessment reports for permafrost regions.
 *
 * - summarizeRiskAssessment - A function that summarizes risk assessment reports.
 * - SummarizeRiskAssessmentInput - The input type for the summarizeRiskAssessment function.
 * - SummarizeRiskAssessmentOutput - The return type for the summarizeRiskAssessment function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeRiskAssessmentInputSchema = z.object({
  reportText: z
    .string()
    .describe('The text content of the risk assessment report.'),
  regionName: z.string().describe('The name of the permafrost region.'),
});
export type SummarizeRiskAssessmentInput = z.infer<
  typeof SummarizeRiskAssessmentInputSchema
>;

const SummarizeRiskAssessmentOutputSchema = z.object({
  summary: z
    .string()
    .describe(
      'A concise summary of the risk assessment report, including potential impacts on Arctic communities.'
    ),
});
export type SummarizeRiskAssessmentOutput = z.infer<
  typeof SummarizeRiskAssessmentOutputSchema
>;

export async function summarizeRiskAssessment(
  input: SummarizeRiskAssessmentInput
): Promise<SummarizeRiskAssessmentOutput> {
  return summarizeRiskAssessmentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeRiskAssessmentPrompt',
  input: {schema: SummarizeRiskAssessmentInputSchema},
  output: {schema: SummarizeRiskAssessmentOutputSchema},
  prompt: `You are an AI assistant helping policy makers understand risk assessment reports for permafrost regions.

  Summarize the following risk assessment report for the {{regionName}} region, focusing on the potential impact of thawing and methane release on Arctic communities. Be concise and highlight key findings to enable informed decision-making:

  Report: {{{reportText}}} `,
});

const summarizeRiskAssessmentFlow = ai.defineFlow(
  {
    name: 'summarizeRiskAssessmentFlow',
    inputSchema: SummarizeRiskAssessmentInputSchema,
    outputSchema: SummarizeRiskAssessmentOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
