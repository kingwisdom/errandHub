import { useEffect, useRef, useState } from 'react';

declare global {
  interface Window {
    google?: {
      maps?: {
        Map: new (el: HTMLElement, opts: Record<string, unknown>) => Record<string, unknown>;
        InfoWindow: new (opts?: Record<string, unknown>) => Record<string, unknown>;
        marker?: {
          PinElement: new (opts: Record<string, string>) => { element: HTMLElement };
          AdvancedMarkerElement: new (opts: Record<string, unknown>) => Record<string, unknown>;
        };
      };
    };
    initGoogleMaps?: () => void;
  }
}

interface GoogleMapProps {
  center: { lat: number; lng: number };
  zoom?: number;
  markers: MapMarker[];
  onMarkerClick?: (marker: MapMarker) => void;
  className?: string;
}

export interface MapMarker {
  id: string;
  lat: number;
  lng: number;
  title: string;
  type: 'internal' | 'external';
  info?: {
    rating?: number;
    address?: string;
    photo_url?: string;
    place_id?: string;
    distance_km?: number;
  };
}

let scriptsLoaded = false;
let scriptsLoading = false;

function loadGoogleMapsScript(apiKey: string): Promise<void> {
  if (scriptsLoaded) return Promise.resolve();
  if (scriptsLoading) {
    return new Promise((resolve) => {
      const check = setInterval(() => {
        if (scriptsLoaded) { clearInterval(check); resolve(); }
      }, 100);
    });
  }

  scriptsLoading = true;

  return new Promise((resolve, reject) => {
    window.initGoogleMaps = () => {
      scriptsLoaded = true;
      resolve();
    };

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=initGoogleMaps&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onerror = () => {
      scriptsLoading = false;
      reject(new Error('Failed to load Google Maps'));
    };
    document.head.appendChild(script);
  });
}

export default function GoogleMap({ center, zoom = 13, markers, onMarkerClick, className = '' }: GoogleMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapInstance = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const markerInstances = useRef<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const infoWindowRef = useRef<any>(null);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

  useEffect(() => {
    if (!apiKey) {
      setError(true);
      return;
    }

    loadGoogleMapsScript(apiKey)
      .then(() => setLoaded(true))
      .catch(() => setError(true));
  }, [apiKey]);

  useEffect(() => {
    if (!loaded || !mapRef.current || !window.google?.maps) return;

    const maps = window.google.maps;

    if (!mapInstance.current) {
      mapInstance.current = new maps.Map(mapRef.current, {
        center,
        zoom,
        disableDefaultUI: false,
        zoomControl: true,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: true,
        styles: [
          { featureType: 'poi', stylers: [{ visibility: 'simplified' }] },
        ],
      });
      infoWindowRef.current = new maps.InfoWindow();
    } else {
      mapInstance.current.panTo(center);
      mapInstance.current.setZoom(zoom);
    }
  }, [loaded, center, zoom]);

  useEffect(() => {
    if (!loaded || !mapInstance.current || !window.google?.maps) return;

    const maps = window.google.maps;

    markerInstances.current.forEach((m: Record<string, unknown>) => {
      (m as { setMap: (m: null) => void }).setMap(null);
    });
    markerInstances.current = [];

    markers.forEach((marker) => {
      const pinGlyph = new maps.marker!.PinElement({
        background: marker.type === 'internal' ? '#FF6B00' : '#1A73E8',
        borderColor: marker.type === 'internal' ? '#CC5500' : '#1558B0',
        glyphColor: '#FFFFFF',
      });

      const advancedMarker = new maps.marker!.AdvancedMarkerElement({
        position: { lat: marker.lat, lng: marker.lng },
        map: mapInstance.current,
        title: marker.title,
        content: pinGlyph.element,
      }) as Record<string, unknown> & { addListener: (event: string, cb: () => void) => void };

      advancedMarker.addListener('click', () => {
        if (infoWindowRef.current && mapInstance.current) {
          const infoContent = `
            <div style="max-width:220px;font-family:system-ui;font-size:13px">
              <div style="font-weight:600;margin-bottom:4px">${marker.title}</div>
              ${marker.info?.rating ? `<div style="color:#F59E0B;margin-bottom:2px">★ ${marker.info.rating}</div>` : ''}
              ${marker.info?.address ? `<div style="color:#666;font-size:12px">${marker.info.address}</div>` : ''}
              ${marker.info?.distance_km ? `<div style="color:#999;font-size:11px;margin-top:2px">${marker.info.distance_km} km away</div>` : ''}
            </div>
          `;
          infoWindowRef.current.setContent(infoContent);
          infoWindowRef.current.open(mapInstance.current, advancedMarker);
        }
        onMarkerClick?.(marker);
      });

      markerInstances.current.push(advancedMarker);
    });
  }, [markers, loaded, onMarkerClick]);

  if (error) {
    return (
      <div className={`bg-gray-100 rounded-2xl flex items-center justify-center text-text-secondary text-sm ${className}`}>
        Map unavailable — Google Maps API key not configured
      </div>
    );
  }

  return (
    <div ref={mapRef} className={`rounded-2xl overflow-hidden ${className}`} />
  );
}
