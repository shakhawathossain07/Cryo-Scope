'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { summarizeRiskAssessmentAction } from '@/app/actions/reporting';
import type { SummarizeRiskAssessmentOutput } from '@/ai/flows/summarize-risk-assessment';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { regions, sampleReportText } from '@/lib/data';

const formSchema = z.object({
  regionName: z.string().min(1, 'Region is required.'),
  reportText: z.string().min(50, 'Report text must be at least 50 characters.'),
});

export default function ReportingPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [summaryResult, setSummaryResult] = useState<SummarizeRiskAssessmentOutput | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      regionName: regions[0].name,
      reportText: sampleReportText,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setSummaryResult(null);
    try {
      const result = await summarizeRiskAssessmentAction(values);
      setSummaryResult(result);
    } catch (error) {
      console.error('Summarization failed:', error);
      toast({
        variant: 'destructive',
        title: 'Summarization Failed',
        description: 'The AI model could not generate a summary. Please try again.',
      });
    }
    setIsLoading(false);
  }

  return (
    <div className="flex h-full flex-col">
      <PageHeader
        title="Risk Reporting"
        description="Generate concise, AI-powered summaries of risk assessment reports."
      />
      <main className="flex-1 overflow-auto p-4 pt-0 md:p-6 md:pt-0">
        <div className="grid gap-6 lg:grid-cols-2">
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Report Summarizer</CardTitle>
                <CardDescription>Paste a risk assessment report to generate a summary.</CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="regionName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Region</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a region" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {regions.map((r) => (
                                <SelectItem key={r.id} value={r.name}>{r.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="reportText"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Report Text</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Paste the full text of the risk assessment report here."
                              {...field}
                              rows={15}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" disabled={isLoading} className="w-full">
                      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Generate Summary
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="h-full">
              <CardHeader>
                <CardTitle>AI-Generated Summary</CardTitle>
                <CardDescription>A concise summary of the report will appear here.</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading && (
                  <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center h-[60vh]">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                    <h3 className="mt-4 text-xl font-semibold">AI is summarizing...</h3>
                    <p className="text-sm text-muted-foreground">Reading and processing the report.</p>
                  </div>
                )}
                {!isLoading && !summaryResult && (
                  <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center h-[60vh]">
                    <h3 className="text-xl font-semibold">Ready for Summarization</h3>
                    <p className="text-sm text-muted-foreground">Provide a report to generate a summary.</p>
                  </div>
                )}
                {summaryResult && (
                  <div className="space-y-4">
                    <p className="leading-relaxed text-muted-foreground">{summaryResult.summary}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
