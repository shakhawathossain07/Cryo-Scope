'use client';

import { useEffect, useState } from 'react';
import { supabase, SupabaseService, PermafrostData, RiskAssessment, PredictionResult } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function TestSupabasePage() {
  const [connectionStatus, setConnectionStatus] = useState<'testing' | 'connected' | 'error'>('testing');
  const [permafrostData, setPermafrostData] = useState<PermafrostData[]>([]);
  const [riskAssessments, setRiskAssessments] = useState<RiskAssessment[]>([]);
  const [predictions, setPredictions] = useState<PredictionResult[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    testConnection();
  }, []);

  const testConnection = async () => {
    try {
      setConnectionStatus('testing');
      // Simple test to check if Supabase is reachable
      const { data, error } = await supabase.from('permafrost_data').select('count');
      
      if (error) {
        console.error('Connection test failed:', error);
        setConnectionStatus('error');
      } else {
        setConnectionStatus('connected');
        loadData();
      }
    } catch (error) {
      console.error('Connection error:', error);
      setConnectionStatus('error');
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [permafrost, risks, preds] = await Promise.all([
        SupabaseService.getPermafrostData(10),
        SupabaseService.getRiskAssessments(),
        SupabaseService.getPredictions()
      ]);
      
      setPermafrostData(permafrost);
      setRiskAssessments(risks);
      setPredictions(preds);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const addTestData = async () => {
    setLoading(true);
    try {
      // Add test permafrost data
      await SupabaseService.addPermafrostData({
        latitude: 70.0 + (Math.random() - 0.5) * 10,
        longitude: -150.0 + (Math.random() - 0.5) * 20,
        temperature: -5 + Math.random() * 10,
        depth: 0.5 + Math.random() * 2.5,
        methane_levels: Math.random() * 50,
        timestamp: new Date().toISOString()
      });

      // Add test prediction
      await SupabaseService.addPrediction({
        prediction_type: 'methane_hotspot',
        location: {
          latitude: 70.0 + (Math.random() - 0.5) * 10,
          longitude: -150.0 + (Math.random() - 0.5) * 20
        },
        predicted_value: Math.random() * 100,
        confidence_score: 75 + Math.random() * 25,
        prediction_date: new Date().toISOString(),
        model_version: 'v1.0.0'
      });

      // Reload data
      await loadData();
    } catch (error) {
      console.error('Error adding test data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'low': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      case 'high': return 'bg-orange-500';
      case 'critical': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-4">Supabase Integration Test</h1>
        <div className="flex items-center justify-center gap-4 mb-6">
          <Badge 
            variant={connectionStatus === 'connected' ? 'default' : connectionStatus === 'error' ? 'destructive' : 'secondary'}
          >
            {connectionStatus === 'testing' && 'Testing Connection...'}
            {connectionStatus === 'connected' && '✅ Connected to Supabase'}
            {connectionStatus === 'error' && '❌ Connection Failed'}
          </Badge>
          <Button onClick={testConnection} variant="outline" size="sm">
            Test Again
          </Button>
        </div>
      </div>

      {connectionStatus === 'connected' && (
        <>
          <div className="flex justify-center mb-6">
            <Button onClick={addTestData} disabled={loading}>
              {loading ? 'Adding Data...' : 'Add Test Data'}
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Permafrost Data */}
            <Card>
              <CardHeader>
                <CardTitle>Permafrost Data</CardTitle>
                <CardDescription>Recent measurements ({permafrostData.length} records)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {permafrostData.map((data, index) => (
                    <div key={data.id || index} className="p-2 bg-gray-50 rounded text-sm">
                      <div>📍 {data.latitude.toFixed(2)}°, {data.longitude.toFixed(2)}°</div>
                      <div>🌡️ {data.temperature}°C at {data.depth}m depth</div>
                      <div>💨 {data.methane_levels} ppm methane</div>
                      <div className="text-xs text-gray-500">
                        {new Date(data.timestamp).toLocaleString()}
                      </div>
                    </div>
                  ))}
                  {permafrostData.length === 0 && (
                    <div className="text-center text-gray-500 py-4">No data available</div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Risk Assessments */}
            <Card>
              <CardHeader>
                <CardTitle>Risk Assessments</CardTitle>
                <CardDescription>Regional risk levels ({riskAssessments.length} assessments)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {riskAssessments.map((assessment, index) => (
                    <div key={assessment.id || index} className="p-2 bg-gray-50 rounded text-sm">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{assessment.region}</span>
                        <Badge className={getRiskLevelColor(assessment.risk_level)}>
                          {assessment.risk_level}
                        </Badge>
                      </div>
                      <div className="text-xs text-gray-500">
                        {assessment.risk_factors.length} risk factors, {assessment.mitigation_strategies.length} strategies
                      </div>
                      <div className="text-xs text-gray-500">
                        Updated: {new Date(assessment.last_updated).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                  {riskAssessments.length === 0 && (
                    <div className="text-center text-gray-500 py-4">No assessments available</div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Predictions */}
            <Card>
              <CardHeader>
                <CardTitle>Predictions</CardTitle>
                <CardDescription>AI model predictions ({predictions.length} predictions)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {predictions.map((prediction, index) => (
                    <div key={prediction.id || index} className="p-2 bg-gray-50 rounded text-sm">
                      <div className="font-medium capitalize">
                        {prediction.prediction_type.replace('_', ' ')}
                      </div>
                      <div>📍 {(prediction.location as { latitude: number; longitude: number }).latitude}°, {(prediction.location as { latitude: number; longitude: number }).longitude}°</div>
                      <div>📊 Value: {prediction.predicted_value.toFixed(2)}</div>
                      <div>🎯 Confidence: {prediction.confidence_score.toFixed(1)}%</div>
                      <div className="text-xs text-gray-500">
                        {new Date(prediction.prediction_date).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                  {predictions.length === 0 && (
                    <div className="text-center text-gray-500 py-4">No predictions available</div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {connectionStatus === 'error' && (
        <Card>
          <CardHeader>
            <CardTitle>Connection Error</CardTitle>
            <CardDescription>Unable to connect to Supabase</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p>Please check:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Supabase project URL is correct</li>
                <li>API key is valid</li>
                <li>Database tables are created (run the SQL schema)</li>
                <li>Row Level Security policies allow access</li>
              </ul>
              <p className="text-sm text-gray-600">
                See DEPLOYMENT_SUPABASE.md for setup instructions.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}