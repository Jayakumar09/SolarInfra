
import React from 'react';
import { Product } from './types';

export const SOLAR_PRODUCTS: Product[] = [
  {
    id: 'solar-1kw',
    name: '1kW Rooftop Solar System',
    capacity: '1kW',
    price: 65000,
    emi: 2200,
    savings: 1500,
    image: 'https://picsum.photos/seed/solar1/800/600',
    description: 'Perfect for small homes with basic electrical needs like lights, fans, and TV.',
    features: ['Monocrystalline Panels', 'Smart Inverter', '25-year Warranty'],
    // Added required quantity property to fix Type error
    quantity: 10,
    // Added required stockStatus property
    stockStatus: 'in_stock'
  },
  {
    id: 'solar-3kw',
    name: '3kW Rooftop Solar System',
    capacity: '3kW',
    price: 185000,
    emi: 6200,
    savings: 4500,
    image: 'https://picsum.photos/seed/solar3/800/600',
    description: 'Ideal for medium families with 1-2 Air Conditioners and typical home appliances.',
    features: ['High Efficiency Panels', 'WiFi Monitoring', 'Grid-Tie System'],
    // Added required quantity property to fix Type error
    quantity: 5,
    // Added required stockStatus property
    stockStatus: 'in_stock'
  },
  {
    id: 'solar-5kw',
    name: '5kW Rooftop Solar System',
    capacity: '5kW',
    price: 295000,
    emi: 9800,
    savings: 7500,
    image: 'https://picsum.photos/seed/solar5/800/600',
    description: 'Standard for large residential rooftops or small shops with significant daytime load.',
    features: ['Tier 1 Solar Panels', 'MPPT Inverter', 'Structure included'],
    // Added required quantity property to fix Type error
    quantity: 3,
    // Added required stockStatus property
    stockStatus: 'in_stock'
  },
  {
    id: 'solar-10kw',
    name: '10kW Rooftop Solar System',
    capacity: '10kW',
    price: 540000,
    emi: 18000,
    savings: 15000,
    image: 'https://picsum.photos/seed/solar10/800/600',
    description: 'Commercial grade system for offices, hospitals, or luxury villas with high electricity usage.',
    features: ['Bi-facial Panels', 'Premium Support', 'Turnkey Installation'],
    // Added required quantity property to fix Type error
    quantity: 2,
    // Added required stockStatus property
    stockStatus: 'in_stock'
  }
];

export const ADMIN_EMAIL = 'jayakumarv2025@gmail.com';
