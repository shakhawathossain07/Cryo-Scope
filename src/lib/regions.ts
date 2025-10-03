export const REGION_COORDINATES = {
  siberia: {
    name: 'Siberian Tundra',
    lat: 68.75,  // Corrected: More central point for West Siberian Plain & Central Siberian Plateau
    lon: 100.1,  // Corrected: Core continuous permafrost region
    bbox: [95, 65, 125, 75] as [number, number, number, number],
    cities: ['Norilsk', 'Tiksi', 'Verkhoyansk'],
    image: '/images/regions/siberia.jpg',
    areaCoverage: {
      squareKm: 8100000,  // 8.1 million km² (mid-range of 6.5-9.7 million estimate)
      squareMiles: 3100000, // 3.1 million sq mi (mid-range of 2.5-3.7 million estimate)
      description: 'Largest permafrost region in the world, covering West Siberian Plain and Central Siberian Plateau'
    }
  },
  alaska: {
    name: 'Alaskan North Slope',
    lat: 70.2,  // Accurate: Central point near Prudhoe Bay
    lon: -148.8,  // Corrected: More precise longitude for North Slope
    bbox: [-166, 68, -141, 72] as [number, number, number, number],
    cities: ['Utqiagvik (Barrow)', 'Deadhorse', 'Nuiqsut'],
    image: '/images/regions/alaska.webp',
    areaCoverage: {
      squareKm: 207000,  // 207,000 km²
      squareMiles: 80000, // 80,000 sq mi
      description: 'Continuous permafrost zone of the Alaskan North Slope tundra'
    }
  },
  canada: {
    name: 'Canadian Arctic Archipelago',
    lat: 75.0,  // Corrected: Representative location for the archipelago islands
    lon: -95.0, // Accurate: Central point for the island collection
    bbox: [-120, 70, -70, 80] as [number, number, number, number],
    cities: ['Resolute', 'Cambridge Bay', 'Alert'],
    image: '/images/regions/canada.jpg',
    areaCoverage: {
      squareKm: 1424500,  // 1,424,500 km²
      squareMiles: 550000, // 550,000 sq mi
      description: 'Total land area of the archipelago, nearly all underlain by permafrost'
    }
  },
  greenland: {
    name: 'Greenland Ice Sheet Margin',
    lat: 70.5,  // Valid: Eastern coast location (Scoresby Sound area)
    lon: -22.0,  // Corrected: Eastern coast permafrost margin
    bbox: [-60, 60, -40, 70] as [number, number, number, number],
    cities: ['Kangerlussuaq', 'Ilulissat', 'Sisimiut'],
    image: '/images/regions/greenland.avif',
    areaCoverage: {
      squareKm: 410000,  // 410,000 km²
      squareMiles: 158000, // 158,000 sq mi
      description: 'Ice-free coastal margin surrounding the central ice sheet where permafrost is found'
    }
  }
} as const;

export type RegionKey = keyof typeof REGION_COORDINATES;
