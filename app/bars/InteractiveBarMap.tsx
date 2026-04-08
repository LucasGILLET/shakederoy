'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { LocateFixed, MapPinned } from 'lucide-react';

type MapBar = {
    id: string;
    name: string;
    address?: string | null;
    city?: string | null;
    country?: string | null;
    latitude?: number | null;
    longitude?: number | null;
};

type InteractiveBarMapProps = {
    bars: MapBar[];
    selectedBarId: string;
    onSelectBar: (barId: string) => void;
};

declare global {
    interface Window {
        L?: {
            map: (element: HTMLElement, options?: Record<string, unknown>) => any;
            tileLayer: (url: string, options?: Record<string, unknown>) => any;
            marker: (latlng: [number, number], options?: Record<string, unknown>) => any;
            icon: (options?: Record<string, unknown>) => any;
            latLngBounds: (coords: [number, number][]) => any;
        };
    }
}

function formatLocation(bar: Pick<MapBar, 'address' | 'city' | 'country'>) {
    return [bar.address, bar.city, bar.country].filter(Boolean).join(', ') || 'Adresse non renseignee';
}

function getBarsWithCoordinates(bars: MapBar[]) {
    return bars.filter((bar) => typeof bar.latitude === 'number' && typeof bar.longitude === 'number');
}

async function ensureLeaflet() {
    if (window.L) {
        return window.L;
    }

    const existingStyle = document.getElementById('leaflet-css');
    if (!existingStyle) {
        const link = document.createElement('link');
        link.id = 'leaflet-css';
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
    }

    const existingScript = document.getElementById('leaflet-js') as HTMLScriptElement | null;
    if (existingScript) {
        await new Promise<void>((resolve, reject) => {
            if (window.L) {
                resolve();
                return;
            }
            existingScript.addEventListener('load', () => resolve(), { once: true });
            existingScript.addEventListener('error', () => reject(new Error('Leaflet failed to load.')), { once: true });
        });
        return window.L;
    }

    await new Promise<void>((resolve, reject) => {
        const script = document.createElement('script');
        script.id = 'leaflet-js';
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        script.async = true;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('Leaflet failed to load.'));
        document.body.appendChild(script);
    });

    return window.L;
}

export function InteractiveBarMap({ bars, selectedBarId, onSelectBar }: InteractiveBarMapProps) {
    const mapContainerRef = useRef<HTMLDivElement | null>(null);
    const mapRef = useRef<any>(null);
    const markersRef = useRef<any[]>([]);
    const userMarkerRef = useRef<any>(null);
    const [mapReady, setMapReady] = useState(false);
    const [mapError, setMapError] = useState('');
    const [locating, setLocating] = useState(false);
    const [userPosition, setUserPosition] = useState<[number, number] | null>(null);

    const geolocatedBars = useMemo(() => getBarsWithCoordinates(bars), [bars]);
    const selectedBar = geolocatedBars.find((bar) => bar.id === selectedBarId) || null;

    useEffect(() => {
        let cancelled = false;

        const initMap = async () => {
            if (!mapContainerRef.current || mapRef.current) {
                return;
            }

            try {
                const L = await ensureLeaflet();
                if (cancelled || !mapContainerRef.current || !L) {
                    return;
                }

                const defaultCenter: [number, number] = selectedBar && typeof selectedBar.latitude === 'number' && typeof selectedBar.longitude === 'number'
                    ? [selectedBar.latitude, selectedBar.longitude]
                    : [46.603354, 1.888334];

                const map = L.map(mapContainerRef.current, {
                    center: defaultCenter,
                    zoom: selectedBar ? 13 : 6,
                    scrollWheelZoom: true,
                });

                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: '&copy; OpenStreetMap contributors',
                }).addTo(map);

                mapRef.current = map;
                setMapReady(true);
            } catch (error) {
                setMapError(error instanceof Error ? error.message : 'Impossible de charger la carte.');
            }
        };

        void initMap();

        return () => {
            cancelled = true;
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
            }
        };
    }, [selectedBar]);

    useEffect(() => {
        if (!mapReady || !mapRef.current || !window.L) {
            return;
        }

        markersRef.current.forEach((marker) => marker.remove());
        markersRef.current = [];

        const L = window.L;
        const defaultIcon = L.icon({
            iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
            shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
        });

        const selectedIcon = L.icon({
            iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
            shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
        });

        geolocatedBars.forEach((bar) => {
            const marker = L.marker([bar.latitude as number, bar.longitude as number], {
                icon: bar.id === selectedBarId ? selectedIcon : defaultIcon,
            }).addTo(mapRef.current);

            marker.bindPopup(`
                <div style="min-width:180px">
                    <strong>${bar.name}</strong><br/>
                    <span>${formatLocation(bar)}</span>
                </div>
            `);
            marker.on('click', () => onSelectBar(bar.id));
            markersRef.current.push(marker);
        });

        if (selectedBar && typeof selectedBar.latitude === 'number' && typeof selectedBar.longitude === 'number') {
            mapRef.current.setView([selectedBar.latitude, selectedBar.longitude], 14, { animate: true });
        } else if (geolocatedBars.length > 1) {
            const bounds = L.latLngBounds(geolocatedBars.map((bar) => [bar.latitude as number, bar.longitude as number]));
            mapRef.current.fitBounds(bounds, { padding: [30, 30] });
        }
    }, [geolocatedBars, mapReady, onSelectBar, selectedBar, selectedBarId]);

    useEffect(() => {
        if (!mapReady || !mapRef.current || !window.L || !userPosition) {
            return;
        }

        const L = window.L;
        if (userMarkerRef.current) {
            userMarkerRef.current.remove();
        }

        userMarkerRef.current = L.marker(userPosition, {
            icon: L.icon({
                iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
                shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
                iconSize: [25, 41],
                iconAnchor: [12, 41],
            }),
        }).addTo(mapRef.current);

        userMarkerRef.current.bindPopup('Vous etes ici');
        mapRef.current.setView(userPosition, 14, { animate: true });
    }, [mapReady, userPosition]);

    const locateUser = () => {
        if (!navigator.geolocation) {
            setMapError('Geolocalisation indisponible sur ce navigateur.');
            return;
        }

        setLocating(true);
        setMapError('');

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setUserPosition([position.coords.latitude, position.coords.longitude]);
                setLocating(false);
            },
            () => {
                setMapError('Impossible d obtenir votre position.');
                setLocating(false);
            },
            { enableHighAccuracy: true, timeout: 10000 }
        );
    };

    return (
        <div className="border-4 border-brand-dark bg-white p-5 shadow-hard">
            <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                    <h3 className="text-2xl font-display">Carte des bars</h3>
                    <p className="text-sm text-gray-600">
                        {geolocatedBars.length} bar{geolocatedBars.length > 1 ? 's' : ''} geolocalise{geolocatedBars.length > 1 ? 's' : ''} visible{geolocatedBars.length > 1 ? 's' : ''}
                    </p>
                </div>
                <button
                    type="button"
                    onClick={locateUser}
                    disabled={locating}
                    className="inline-flex items-center gap-2 border-4 border-brand-dark bg-white px-4 py-3 font-bold"
                >
                    <LocateFixed className="w-4 h-4" />
                    {locating ? 'Localisation...' : 'Me geolocaliser'}
                </button>
            </div>

            {mapError ? (
                <div className="mb-4 border-l-4 border-red-500 bg-red-100 p-4 text-red-700">{mapError}</div>
            ) : null}

            {geolocatedBars.length > 0 ? (
                <div ref={mapContainerRef} className="h-[420px] w-full overflow-hidden border-4 border-brand-dark bg-sky-50" />
            ) : (
                <div className="flex h-[220px] items-center justify-center border-4 border-dashed border-gray-300 bg-slate-50 text-center text-gray-600">
                    <div>
                        <MapPinned className="mx-auto mb-3 h-10 w-10" />
                        <p>Aucun bar geolocalise dans le resultat actuel.</p>
                    </div>
                </div>
            )}
        </div>
    );
}
