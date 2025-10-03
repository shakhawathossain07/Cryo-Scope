'use client';

import { useState } from 'react';

export default function TestWMSPage() {
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (msg: string) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  const testWMS = async () => {
    setLoading(true);
    setError('');
    setImageUrl('');
    setLogs([]);

    addLog('Starting WMS test...');

    // Test a single tile for Alaska region
    const bbox = '-156.0,68.0,-146.0,72.0'; // Alaska bbox
    const endDate = new Date();
    endDate.setDate(endDate.getDate() - 1); // Yesterday
    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - 7); // Last 7 days
    const timeRange = `${startDate.toISOString().split('T')[0]}/${endDate.toISOString().split('T')[0]}`;

    const params = new URLSearchParams({
      SERVICE: 'WMS',
      VERSION: '1.3.0',
      REQUEST: 'GetMap',
      LAYERS: 'CH4',
      BBOX: bbox,
      WIDTH: '512',
      HEIGHT: '512',
      FORMAT: 'image/png',
      CRS: 'EPSG:4326',
      TIME: timeRange,
      TRANSPARENT: 'true',
    });

    addLog(`Request URL: /api/sentinel-wms?${params.toString()}`);
    addLog(`Time range: ${timeRange}`);

    try {
      const response = await fetch(`/api/sentinel-wms?${params.toString()}`);
      
      addLog(`Response status: ${response.status} ${response.statusText}`);
      addLog(`Content-Type: ${response.headers.get('Content-Type')}`);

      if (!response.ok) {
        const errorText = await response.text();
        addLog(`Error response: ${errorText}`);
        setError(`HTTP ${response.status}: ${errorText}`);
        setLoading(false);
        return;
      }

      const blob = await response.blob();
      addLog(`Received blob: ${blob.size} bytes, type: ${blob.type}`);

      const url = URL.createObjectURL(blob);
      setImageUrl(url);
      addLog('✅ Image loaded successfully!');

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      addLog(`❌ Fetch error: ${errorMessage}`);
      setError(errorMessage);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen p-8 bg-gray-900 text-white">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Sentinel Hub WMS Test</h1>
        
        <div className="mb-6">
          <button
            onClick={testWMS}
            disabled={loading}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded-lg font-semibold transition-colors"
          >
            {loading ? 'Loading...' : 'Test WMS Endpoint'}
          </button>
        </div>

        {/* Logs */}
        <div className="mb-6 bg-gray-800 rounded-lg p-4">
          <h2 className="text-xl font-semibold mb-3">Console Logs</h2>
          <div className="font-mono text-sm space-y-1 max-h-64 overflow-y-auto">
            {logs.length === 0 ? (
              <p className="text-gray-400">No logs yet. Click the button to test.</p>
            ) : (
              logs.map((log, i) => (
                <div key={i} className="text-gray-300">{log}</div>
              ))
            )}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 bg-red-900/50 border border-red-500 rounded-lg p-4">
            <h2 className="text-xl font-semibold mb-2">Error</h2>
            <pre className="text-sm overflow-x-auto">{error}</pre>
          </div>
        )}

        {/* Image */}
        {imageUrl && (
          <div className="bg-gray-800 rounded-lg p-4">
            <h2 className="text-xl font-semibold mb-3">Retrieved Image</h2>
            <img 
              src={imageUrl} 
              alt="WMS Tile" 
              className="w-full border border-gray-600 rounded"
            />
            <p className="mt-2 text-sm text-gray-400">
              Alaska region CH4 data (last 7 days)
            </p>
          </div>
        )}

        {/* Instructions */}
        <div className="mt-8 bg-gray-800 rounded-lg p-4">
          <h2 className="text-xl font-semibold mb-3">What This Tests</h2>
          <ul className="list-disc list-inside space-y-2 text-gray-300">
            <li>OAuth authentication via /api/sentinel-wms proxy</li>
            <li>Copernicus Dataspace WMS endpoint</li>
            <li>CH4 layer availability for Alaska region</li>
            <li>Last 7 days of data (to handle spotty Arctic coverage)</li>
            <li>Image tile retrieval and display</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
