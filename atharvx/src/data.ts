import { HospitalData, Treatment, Pharmacy } from './types';

export const TREATMENTS: Treatment[] = [
  { id: 't1', name: 'Appendectomy', baseCost: 50000 },
  { id: 't2', name: 'Cataract Surgery', baseCost: 25000 },
  { id: 't3', name: 'Knee Replacement', baseCost: 150000 },
  { id: 't4', name: 'Angioplasty', baseCost: 200000 },
  { id: 't5', name: 'Hernia Repair', baseCost: 40000 },
  { id: 't6', name: 'Gallbladder Removal', baseCost: 60000 },
  { id: 't7', name: 'Hip Replacement', baseCost: 180000 },
  { id: 't8', name: 'Dialysis', baseCost: 3000 },
  { id: 't9', name: 'MRI Scan', baseCost: 8000 },
  { id: 't10', name: 'CT Scan', baseCost: 5000 },
  { id: 't11', name: 'Chemotherapy Session', baseCost: 15000 },
  { id: 't12', name: 'Normal Delivery', baseCost: 35000 },
  { id: 't13', name: 'C-Section', baseCost: 70000 },
  { id: 't14', name: 'Root Canal', baseCost: 5000 },
  { id: 't15', name: 'Dental Implant', baseCost: 30000 },
  { id: 't16', name: 'LASIK Eye Surgery', baseCost: 45000 },
  { id: 't17', name: 'Tonsillectomy', baseCost: 30000 },
  { id: 't18', name: 'Kidney Stone Removal', baseCost: 55000 },
  { id: 't19', name: 'Spinal Surgery', baseCost: 250000 },
  { id: 't20', name: 'Pacemaker Implantation', baseCost: 300000 },
];

const generateCost = (base: number) => Math.floor(base * (0.8 + Math.random() * 0.4));

export const HOSPITALS: HospitalData[] = [
  // Mumbai
  {
    id: 'h1',
    name: 'City Care Hospital',
    district: 'Mumbai',
    address: 'Andheri West, Mumbai',
    rating: 4.5,
    mapsUrl: 'https://www.google.com/maps/search/City+Care+Hospital+Mumbai',
    treatments: TREATMENTS.map(t => ({ treatmentId: t.id, cost: generateCost(t.baseCost) }))
  },
  {
    id: 'h2',
    name: 'Metro Medical Center',
    district: 'Mumbai',
    address: 'Dadar East, Mumbai',
    rating: 4.2,
    mapsUrl: 'https://www.google.com/maps/search/Metro+Medical+Center+Mumbai',
    treatments: TREATMENTS.map(t => ({ treatmentId: t.id, cost: generateCost(t.baseCost) }))
  },
  {
    id: 'h3',
    name: 'Sunrise Multispeciality',
    district: 'Mumbai',
    address: 'Borivali, Mumbai',
    rating: 4.7,
    mapsUrl: 'https://www.google.com/maps/search/Sunrise+Multispeciality+Mumbai',
    treatments: TREATMENTS.map(t => ({ treatmentId: t.id, cost: generateCost(t.baseCost) }))
  },
  // Pune
  {
    id: 'h4',
    name: 'Pune General Hospital',
    district: 'Pune',
    address: 'Shivajinagar, Pune',
    rating: 4.0,
    mapsUrl: 'https://www.google.com/maps/search/Pune+General+Hospital',
    treatments: TREATMENTS.map(t => ({ treatmentId: t.id, cost: generateCost(t.baseCost) }))
  },
  {
    id: 'h5',
    name: 'Sahyadri Health',
    district: 'Pune',
    address: 'Kothrud, Pune',
    rating: 4.6,
    mapsUrl: 'https://www.google.com/maps/search/Sahyadri+Health+Pune',
    treatments: TREATMENTS.map(t => ({ treatmentId: t.id, cost: generateCost(t.baseCost) }))
  },
  {
    id: 'h6',
    name: 'Noble Care',
    district: 'Pune',
    address: 'Hadapsar, Pune',
    rating: 4.3,
    mapsUrl: 'https://www.google.com/maps/search/Noble+Care+Pune',
    treatments: TREATMENTS.map(t => ({ treatmentId: t.id, cost: generateCost(t.baseCost) }))
  },
  // Kolhapur
  {
    id: 'h7',
    name: 'Kolhapur City Hospital',
    district: 'Kolhapur',
    address: 'Tarabai Park, Kolhapur',
    rating: 4.1,
    mapsUrl: 'https://www.google.com/maps/search/Kolhapur+City+Hospital',
    treatments: TREATMENTS.map(t => ({ treatmentId: t.id, cost: generateCost(t.baseCost) }))
  },
  {
    id: 'h8',
    name: 'Chhatrapati Shahu Medical',
    district: 'Kolhapur',
    address: 'Dasara Chowk, Kolhapur',
    rating: 4.4,
    mapsUrl: 'https://www.google.com/maps/search/Chhatrapati+Shahu+Medical+Kolhapur',
    treatments: TREATMENTS.map(t => ({ treatmentId: t.id, cost: generateCost(t.baseCost) }))
  },
  {
    id: 'h9',
    name: 'Rajaram Health Center',
    district: 'Kolhapur',
    address: 'Laxmipuri, Kolhapur',
    rating: 3.9,
    mapsUrl: 'https://www.google.com/maps/search/Rajaram+Health+Center+Kolhapur',
    treatments: TREATMENTS.map(t => ({ treatmentId: t.id, cost: generateCost(t.baseCost) }))
  }
];

export const PHARMACIES: Pharmacy[] = [
  {
    id: 'p1',
    name: 'Wellness Forever',
    district: 'Mumbai',
    address: 'Andheri East, Mumbai',
    rating: 4.8,
    discount: 10,
    hasHomeDelivery: true,
    mapsUrl: 'https://www.google.com/maps/search/Wellness+Forever+Mumbai'
  },
  {
    id: 'p2',
    name: 'Apollo Pharmacy',
    district: 'Mumbai',
    address: 'Bandra West, Mumbai',
    rating: 4.5,
    discount: 10,
    hasHomeDelivery: true,
    mapsUrl: 'https://www.google.com/maps/search/Apollo+Pharmacy+Mumbai'
  },
  {
    id: 'p3',
    name: 'Noble Plus',
    district: 'Pune',
    address: 'Koregaon Park, Pune',
    rating: 4.6,
    discount: 10,
    hasHomeDelivery: true,
    mapsUrl: 'https://www.google.com/maps/search/Noble+Plus+Pune'
  },
  {
    id: 'p4',
    name: 'MedPlus',
    district: 'Pune',
    address: 'Viman Nagar, Pune',
    rating: 4.4,
    discount: 10,
    hasHomeDelivery: true,
    mapsUrl: 'https://www.google.com/maps/search/MedPlus+Pune'
  },
  {
    id: 'p5',
    name: 'City Medical',
    district: 'Kolhapur',
    address: 'Shahupuri, Kolhapur',
    rating: 4.2,
    discount: 10,
    hasHomeDelivery: true,
    mapsUrl: 'https://www.google.com/maps/search/City+Medical+Kolhapur'
  }
];
