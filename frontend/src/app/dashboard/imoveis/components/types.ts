export interface Property {
  id: string;
  code: string;
  title: string;
  description: string;
  price: number;
  type: string;
  category: string;
  status: string;
  bedrooms: number;
  suites: number;
  bathrooms: number;
  garageSlots: number;
  areaTotal: number;
  areaConstruida: number;
  condoFee?: number;
  iptu?: number;
  address: string;
  zipCode: string;
  city: string;
  state: string;
  neighborhood: string;
  photos: string;
  photoItems?: Array<{ url: string; alt?: string | null }>;
  features: string;
  featured: boolean;
  brokerId?: string;
}
