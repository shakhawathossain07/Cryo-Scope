export const REGION_COORDINATES = {
  siberia: {
    name: 'Siberian Tundra',
    lat: 70.0,
    lon: 110.0,
    bbox: [95, 65, 125, 75] as [number, number, number, number],
    cities: ['Norilsk', 'Tiksi', 'Verkhoyansk']
  },
  alaska: {
    name: 'Alaskan North Slope',
    lat: 70.2,
    lon: -148.5,
    bbox: [-166, 68, -141, 72] as [number, number, number, number],
    cities: ['Utqiagvik (Barrow)', 'Deadhorse', 'Nuiqsut']
  },
  canada: {
    name: 'Canadian Arctic Archipelago',
    lat: 74.0,
    lon: -95.0,
    bbox: [-120, 70, -70, 80] as [number, number, number, number],
    cities: ['Resolute', 'Cambridge Bay', 'Alert']
  },
  greenland: {
    name: 'Greenland Ice Sheet Margin',
    lat: 67.0,
    lon: -50.0,
    bbox: [-60, 60, -40, 70] as [number, number, number, number],
    cities: ['Kangerlussuaq', 'Ilulissat', 'Sisimiut']
  }
} as const;

export type RegionKey = keyof typeof REGION_COORDINATES;
