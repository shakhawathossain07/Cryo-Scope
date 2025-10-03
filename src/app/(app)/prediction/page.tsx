'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { predictMethaneHotspotsAction } from '@/app/actions/prediction';
import type { PredictMethaneHotspotsOutput } from '@/ai/flows/predict-methane-hotspots';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';

const fileSchema = z.any().refine(file => file?.length == 1, 'File is required.');

const formSchema = z.object({
  regionDescription: z.string().min(10, 'Please provide a more detailed description.'),
  sarData: fileSchema,
  climateData: fileSchema,
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

export default function PredictionPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [predictionResult, setPredictionResult] = useState<PredictMethaneHotspotsOutput | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      regionDescription: 'Analysis of the Alaskan North Slope, focusing on coastal erosion areas and inland lakes known for high organic content in soil.',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setPredictionResult(null);
    try {
      const sarData = await fileToDataUri(values.sarData[0]) as string;
      const climateData = await fileToDataUri(values.climateData[0]) as string;
      const result = await predictMethaneHotspotsAction({
          regionDescription: values.regionDescription,
          sarData,
          climateData
      });
      setPredictionResult(result);
    } catch (error) {
      console.error('Prediction failed:', error);
      toast({
        variant: 'destructive',
        title: 'Prediction Failed',
        description: 'The AI model could not generate predictions. Please try again.',
      });
    }
    setIsLoading(false);
  }

  const sarDataRef = form.register('sarData');
  const climateDataRef = form.register('climateData');

  return (
    <div className="flex h-full flex-col">
      <PageHeader
        title="Hotspot Prediction"
        description="Predict high-risk methane release areas using AI."
      />
      <main className="flex-1 overflow-auto p-4 pt-0 md:p-6 md:pt-0">
        <div className="grid gap-6 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Prediction Input</CardTitle>
                <CardDescription>Provide data for the AI to generate a hotspot map.</CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="regionDescription"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Region Description</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Describe the region of interest, including geological features, known thaw areas, etc."
                              {...field}
                              rows={5}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="sarData"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>SAR Thaw Stage Data</FormLabel>
                          <FormControl>
                            <Input type="file" {...sarDataRef} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="climateData"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Historical Climate Patterns</FormLabel>
                          <FormControl>
                            <Input type="file" {...climateDataRef} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" disabled={isLoading} className="w-full">
                      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Predict Hotspots
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-3">
            <Card className="h-full">
              <CardHeader>
                <CardTitle>Prediction Results</CardTitle>
                <CardDescription>AI-generated hotspot map and assessment.</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading && (
                  <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center h-[60vh]">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                    <h3 className="mt-4 text-xl font-semibold">AI is predicting...</h3>
                    <p className="text-sm text-muted-foreground">Generating risk assessment and hotspot map.</p>
                  </div>
                )}
                {!isLoading && !predictionResult && (
                  <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center h-[60vh]">
                    <h3 className="text-xl font-semibold">Ready for Prediction</h3>
                    <p className="text-sm text-muted-foreground">Fill out the form to generate a hotspot map.</p>
                  </div>
                )}
                {predictionResult && (
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-lg mb-2">Hotspot Map</h4>
                      <div className="relative aspect-video w-full overflow-hidden rounded-lg border">
                        <Image
                          src={predictionResult.hotspotMap}
                          alt="AI-generated methane hotspot map"
                          fill
                          className="object-cover"
                          data-ai-hint="risk map"
                        />
                      </div>
                    </div>
                     <div className="space-y-2">
                        <h4 className='font-semibold text-lg'>Risk Assessment</h4>
                        <p className='text-muted-foreground'>{predictionResult.riskAssessment}</p>
                    </div>
                     <div className="space-y-2">
                        <h4 className='font-semibold text-lg'>Justification</h4>
                        <p className='text-muted-foreground'>{predictionResult.justification}</p>
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
