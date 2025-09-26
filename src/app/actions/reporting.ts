'use server';

import { summarizeRiskAssessment } from '@/ai/flows/summarize-risk-assessment';
import { z } from 'zod';

const formSchema = z.object({
  regionName: z.string(),
  reportText: z.string(),
});

export async function summarizeRiskAssessmentAction(input: z.infer<typeof formSchema>) {
  
  const result = await summarizeRiskAssessment({
    regionName: input.regionName,
    reportText: input.reportText,
  });
  
  return result;
}
