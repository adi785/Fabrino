
import React from 'react';
import { Product } from './types';

export const PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'The Echo Vessel',
    tagline: 'Sonic Architecture',
    description: 'A 3D-sculpted vessel where the exterior topology is generated directly from the frequency data of a voice recording or song.',
    price: 145,
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=800',
    category: 'Anniversary',
    story: 'We transform sound waves into physical ridges. Every layer of this vessel represents a millisecond of your spoken word, creating a geometric poem that holds both light and memory.',
    customizableFields: ['Audio Upload', 'Resin Finish', 'Inner Gold Leafing']
  },
  {
    id: '2',
    name: 'Celestial Topography',
    tagline: 'A Map of the Moment',
    description: 'A precision-printed 3D landscape of the lunar surface or a specific mountain range exactly as it appeared on your chosen date.',
    price: 110,
    image: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&q=80&w=800',
    category: 'Birthday',
    story: 'Earth and Sky meet in this artifact. We use satellite elevation data and astronomical algorithms to print a tangible slice of the world that defined your most important day.',
    customizableFields: ['Coordinates', 'Historical Date', 'Material Texture']
  },
  {
    id: '3',
    name: 'The Lithos Pillar',
    tagline: 'Light-Revealed Memories',
    description: 'A 3D-printed translucent pillar that uses varying material thickness to project a high-resolution photograph when illuminated from within.',
    price: 125,
    image: 'https://images.unsplash.com/photo-1572913017567-ed532657e2a8?auto=format&fit=crop&q=80&w=800',
    category: 'Custom Gifts',
    story: 'Hidden within the mathematical precision of 3D layers lies a secret image. It is an artifact of shadow and light, appearing only when the warmth of a bulb brings it to life.',
    customizableFields: ['High-Res Image', 'Base Wood Type']
  },
  {
    id: '4',
    name: 'Temporal Knot',
    tagline: 'Generative Mathematical Art',
    description: 'A complex, non-repeating 3D knot structure where the interlocking curves are calculated based on the intersection of two people’s birth dates.',
    price: 160,
    image: 'https://images.unsplash.com/photo-1549490349-8643362247b5?auto=format&fit=crop&q=80&w=800',
    category: 'Surprise',
    story: 'Two lives, one path. This generative artifact uses the mathematics of topology to weave two timelines into a singular, unbreakable 3D form that cannot exist without both inputs.',
    customizableFields: ['Date A', 'Date B', 'Metal Infusion']
  }
];

export const INTENTS = ['Birthday', 'Anniversary', 'Surprise', 'Custom Gifts'] as const;
