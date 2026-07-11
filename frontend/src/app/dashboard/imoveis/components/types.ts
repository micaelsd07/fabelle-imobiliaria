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

  // Dados do locador (proprietário do imóvel)
  ownerName?: string | null;
  ownerCpf?: string | null;
  ownerRg?: string | null;
  ownerPhone?: string | null;
  ownerEmail?: string | null;
  ownerAddress?: string | null;
  ownerProfession?: string | null;
  ownerCivilStatus?: string | null;

  // Cônjuge (só usados quando ownerCivilStatus for "Casado(a)" ou "União Estável")
  spouseName?: string | null;
  spouseCpf?: string | null;
  spousePhone?: string | null;
}

export const CIVIL_STATUS_OPTIONS = [
  'Solteiro(a)',
  'Casado(a)',
  'Divorciado(a)',
  'Viúvo(a)',
  'União Estável',
] as const;

export const SPOUSE_REQUIRED_STATUSES = ['Casado(a)', 'União Estável'];
