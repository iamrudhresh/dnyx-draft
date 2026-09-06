'use client';

import type React from 'react';
import { useEffect, useRef, useState } from 'react';

interface GeoMapViewerProps {
  data: string;
  type: 'geojson' | 'topojson';
}

export const GeoMapViewer: React.FC<GeoMapViewerProps> = ({ data, type }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<unknown>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const render = async () => {
      try {
        const parsed = JSON.parse(data);

        let geojson = parsed;
        if (type === 'topojson') {
          const topoModule = await import('topojson-client');
          const topo = parsed as {
            objects: Record<string, unknown>;
            type: string;
          };
          const firstKey = Object.keys(topo.objects)[0];
          if (!firstKey) throw new Error('No topojson objects found');
          geojson = topoModule.feature(
            topo as Parameters<typeof topoModule.feature>[0],
            topo.objects[firstKey] as Parameters<typeof topoModule.feature>[1],
          );
        }

        if (!mapRef.current || cancelled) return;

        // Destroy previous map instance
        if (mapInstanceRef.current) {
          (mapInstanceRef.current as { remove: () => void }).remove();
          mapInstanceRef.current = null;
        }

        const L = (await import('leaflet')).default;

        // Leaflet CSS injection
        if (!document.getElementById('leaflet-css')) {
          const link = document.createElement('link');
          link.id = 'leaflet-css';
          link.rel = 'stylesheet';
          link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
          document.head.appendChild(link);
        }

        mapRef.current.innerHTML = '';

        const map = L.map(mapRef.current, { attributionControl: false });
        mapInstanceRef.current = map;

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors',
        }).addTo(map);

        const geoLayer = L.geoJSON(geojson as Parameters<typeof L.geoJSON>[0]).addTo(map);
        map.fitBounds(geoLayer.getBounds());

        if (!cancelled) setLoading(false);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Map render failed');
          setLoading(false);
        }
      }
    };

    if (data) render();

    return () => {
      cancelled = true;
      if (mapInstanceRef.current) {
        (mapInstanceRef.current as { remove: () => void }).remove();
        mapInstanceRef.current = null;
      }
    };
  }, [data, type]);

  if (error) {
    return (
      <div className="p-3 my-2 text-xs text-red-400 bg-red-950/40 border border-red-900/60 rounded-md font-mono">
        {type} render failed: {error}
      </div>
    );
  }

  return (
    <div className="my-4 rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden">
      <div className="px-2 py-1 bg-slate-100/80 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 text-[10px] font-mono text-slate-500 uppercase tracking-wider">
        {type}
      </div>
      {loading && (
        <div className="flex items-center justify-center p-6 text-xs text-slate-400 gap-2">
          <div className="h-3 w-3 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
          Rendering map…
        </div>
      )}
      <div ref={mapRef} style={{ height: '400px', display: loading ? 'none' : 'block' }} />
    </div>
  );
};
