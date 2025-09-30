'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { analyzePermafrostTrendAction } from '@/app/actions/analysis';
import type { AnalyzePermafrostTrendOutput } from '@/ai/flows/analyze-permafrost-trend';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { regions } from '@/lib/data';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, ShieldAlert } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const fileSchema = z.any().refine(file => file?.length == 1, 'File is required.');

const formSchema = z.object({
  regionName: z.string().min(1, 'Region is required.'),
  sarData: fileSchema,
  opticalData: z.any().optional(),
  historicalClimateData: z.string().optional(),
});

const fileToDataUri = (file: File) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => {
            resolve(event.target?.result);
        };
        reader.onerror = (error) => {
            reject(error);
        };
        reader.readAsDataURL(file);
    });
}


export default function AnalysisPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalyzePermafrostTrendOutput | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      regionName: '',
      historicalClimateData: 'Recent warming trend observed with an increase in summer melt days.',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setAnalysisResult(null);

    try {
        const sarDataUri = await fileToDataUri(values.sarData[0]) as string;
        let opticalDataUri;
        if (values.opticalData && values.opticalData[0]) {
            opticalDataUri = await fileToDataUri(values.opticalData[0]) as string;
        }

      const result = await analyzePermafrostTrendAction({
          regionName: values.regionName,
          historicalClimateData: values.historicalClimateData,
          sarDataUri,
          opticalDataUri
      });
      setAnalysisResult(result);
    } catch (error) {
      console.error('Analysis failed:', error);
      toast({
        variant: 'destructive',
        title: 'Analysis Failed',
        description: 'The AI model could not complete the analysis. Please try again.',
      });
    }
    setIsLoading(false);
  }

  const sarDataRef = form.register('sarData');
  const opticalDataRef = form.register('opticalData');

  return (
    <div className="flex h-full flex-col">
      <PageHeader
        title="Trend Analysis"
        description="Analyze permafrost data to identify thaw events and methane risks."
      />
      <main className="flex-1 overflow-auto p-4 pt-0 md:p-6 md:pt-0">
        <div className="grid gap-6 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Analysis Input</CardTitle>
                <CardDescription>Provide data for the AI to analyze.</CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="regionName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Geographic Region</FormLabel>
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
                      name="sarData"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>SAR Data</FormLabel>
                          <FormControl>
                            <Input type="file" {...sarDataRef} />
                          </FormControl>
                           <FormMessage />
                        </FormItem>
                      )}
                    />
                     <FormField
                      control={form.control}
                      name="opticalData"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Optical Data (Optional)</FormLabel>
                          <FormControl>
                            <Input type="file" {...opticalDataRef} />
                          </FormControl>
                           <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="historicalClimateData"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Historical Climate Data</FormLabel>
                          <FormControl>
                            <Textarea placeholder="e.g., Average temperature increase, changes in precipitation..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" disabled={isLoading} className="w-full">
                      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Analyze Trends
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-3">
             <Card className='h-full'>
                <CardHeader>
                    <CardTitle>Analysis Results</CardTitle>
                    <CardDescription>AI-generated insights will appear here.</CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading && (
                        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center h-[60vh]">
                            <Loader2 className="h-12 w-12 animate-spin text-primary" />
                            <h3 className="mt-4 text-xl font-semibold">AI is analyzing...</h3>
                            <p className="text-sm text-muted-foreground">This may take a moment.</p>
                        </div>
                    )}
                    {!isLoading && !analysisResult && (
                        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center h-[60vh]">
                            <h3 className="text-xl font-semibold">Ready for Analysis</h3>
                            <p className="text-sm text-muted-foreground">Fill out the form to start the trend analysis.</p>
                        </div>
                    )}
                    {analysisResult && (
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <h4 className='font-semibold text-lg'>Summary</h4>
                                <p className='text-muted-foreground'>{analysisResult.summary}</p>
                            </div>
                            <div className="space-y-2">
                                <h4 className='font-semibold text-lg'>Recommendations</h4>
                                <p className='text-muted-foreground'>{analysisResult.recommendations}</p>
                            </div>
                            <div className="space-y-2">
                                <h4 className='font-semibold text-lg'>Significant Events</h4>
                                <div className="rounded-md border">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Date</TableHead>
                                                <TableHead>Description</TableHead>
                                                <TableHead>Risk</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {analysisResult.significantEvents.map((event, i) => (
                                                <TableRow key={i}>
                                                    <TableCell>{event.date}</TableCell>
                                                    <TableCell>{event.description}</TableCell>
                                                    <TableCell>
                                                      <div className='flex items-center gap-2'>
                                                        <ShieldAlert className={cn('h-4 w-4',
                                                          event.riskLevel === 'high' && 'text-accent',
                                                          event.riskLevel === 'medium' && 'text-yellow-400',
                                                          event.riskLevel === 'low' && 'text-primary'
                                                        )} />
                                                        <span className='capitalize'>{event.riskLevel}</span>
                                                      </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            </div>
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
