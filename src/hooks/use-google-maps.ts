import { useEffect, useMemo, useRef, useState } from 'react';

type GoogleMapsStatus = 'idle' | 'loading' | 'ready' | 'error';

interface UseGoogleMapsResult {
  isReady: boolean;
  status: GoogleMapsStatus;
  error: string | null;
}

const GOOGLE_MAPS_SCRIPT_ID = 'google-maps-script';

export function useGoogleMaps(libraries: string[] = []): UseGoogleMapsResult {
  const [status, setStatus] = useState<GoogleMapsStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const librariesParam = useMemo(() => libraries.filter(Boolean).join(','), [libraries]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    // Check if Google Maps is already loaded
    if ((window as any).google?.maps) {
      setStatus('ready');
      setError(null);
      return;
    }

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

    // Validate API key
    if (!apiKey || apiKey.includes('PLACEHOLDER') || apiKey === 'your-api-key-here') {
      setError('Invalid or missing Google Maps API key. Please check your environment configuration.');
      setStatus('error');
      return;
    }

    // Check for existing script
    const existingScript = document.getElementById(GOOGLE_MAPS_SCRIPT_ID) as HTMLScriptElement | null;

    if (existingScript) {
      // If script exists but Google Maps isn't loaded, wait for it
      if (existingScript.dataset.loaded === 'true') {
        setStatus('ready');
        setError(null);
      } else {
        setStatus('loading');
        
        const handleLoad = () => {
          if ((window as any).google?.maps) {
            existingScript.dataset.loaded = 'true';
            setStatus('ready');
            setError(null);
          } else {
            setError('Google Maps API loaded but google.maps is not available');
            setStatus('error');
          }
        };

        const handleError = (event: ErrorEvent) => {
          console.error('Google Maps script error:', event);
          setError('Failed to load Google Maps JavaScript API. Check your API key and network connection.');
          setStatus('error');
        };

        existingScript.addEventListener('load', handleLoad, { once: true });
        existingScript.addEventListener('error', handleError, { once: true });

        return () => {
          existingScript.removeEventListener('load', handleLoad);
          existingScript.removeEventListener('error', handleError);
        };
      }
      return;
    }

    // Create new script
    setStatus('loading');
    setError(null);

    const script = document.createElement('script');
    script.id = GOOGLE_MAPS_SCRIPT_ID;
    script.type = 'text/javascript';
    
    // Build URL with proper parameters
    const params = new URLSearchParams();
    params.set('key', apiKey);
    if (librariesParam) {
      params.set('libraries', librariesParam);
    }
    params.set('callback', 'initGoogleMaps');
    
    script.src = `https://maps.googleapis.com/maps/api/js?${params.toString()}`;
    script.async = true;
    script.defer = true;

    // Create global callback
    (window as any).initGoogleMaps = () => {
      if ((window as any).google?.maps) {
        script.dataset.loaded = 'true';
        setStatus('ready');
        setError(null);
        console.log('✅ Google Maps API loaded successfully');
      } else {
        setError('Google Maps callback fired but google.maps is not available');
        setStatus('error');
      }
      // Clean up callback
      delete (window as any).initGoogleMaps;
    };

    const handleError = (event: Event) => {
      console.error('Google Maps script loading error:', event);
      setError('Failed to load Google Maps API. Please check your API key, billing account, and that Maps JavaScript API is enabled.');
      setStatus('error');
      // Clean up callback
      delete (window as any).initGoogleMaps;
    };

    script.addEventListener('error', handleError, { once: true });

    // Add timeout fallback
    const timeout = setTimeout(() => {
      if (status === 'loading') {
        setError('Google Maps API loading timeout. Please check your internet connection and API key.');
        setStatus('error');
      }
    }, 10000); // 10 second timeout

    document.head.appendChild(script);

    return () => {
      clearTimeout(timeout);
      script.removeEventListener('error', handleError);
      if ((window as any).initGoogleMaps) {
        delete (window as any).initGoogleMaps;
      }
    };
  }, [librariesParam, status]);

  return {
    isReady: status === 'ready',
    status,
    error,
  };
}
