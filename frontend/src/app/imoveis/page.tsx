'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PropertyImageCarousel from '@/components/PropertyImageCarousel';
import { Search, Bed, Bath, Car, Maximize, MapPin, SlidersHorizontal, Map, Building2, Flame } from 'lucide-react';

interface Property {
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
  neighborhood: string;
  city: string;
  state: string;
  photos: string;
  photoItems?: Array<{ url: string; alt?: string | null }>;
  features: string;
  featured: boolean;
  latitude?: number;
  longitude?: number;
}

const SEED_PROPERTIES: Property[] = [
  {
    id: '1',
    code: 'FAB-001',
    title: 'Cobertura Duplex de Alto Padrão nos Jardins',
    description: 'Lindo duplex totalmente reformado com acabamentos premium em mármore, automação residencial completa, terraço privativo com piscina aquecida e vista panorâmica incrível de 360 graus para a cidade.',
    price: 4200000,
    type: 'VENDA',
    category: 'COBERTURA',
    status: 'DISPONIVEL',
    bedrooms: 4,
    suites: 3,
    bathrooms: 5,
    garageSlots: 3,
    areaTotal: 320,
    areaConstruida: 280,
    condoFee: 2800,
    iptu: 850,
    address: 'Alameda Lorena, 1500',
    zipCode: '01424-002',
    neighborhood: 'Jardins',
    city: 'São Paulo',
    state: 'SP',
    photos: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&q=80&w=600,https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=600',
    features: 'Mobiliado, Ar Condicionado, Elevador Privativo, Portaria 24h, Piscina, Churrasqueira',
    featured: true,
    latitude: -23.5639,
    longitude: -46.6627
  },
  {
    id: '2',
    code: 'FAB-002',
    title: 'Casa Contemporânea de Luxo em Alphaville',
    description: 'Projeto arquitetônico assinado com linhas modernas, pé-direito duplo, integração completa de ambientes, 4 suítes master com closet, área de lazer privativa de tirar o fôlego com sauna, churrasqueira e piscina de borda infinita.',
    price: 3800000,
    type: 'VENDA',
    category: 'CASA',
    status: 'DISPONIVEL',
    bedrooms: 5,
    suites: 4,
    bathrooms: 6,
    garageSlots: 4,
    areaTotal: 650,
    areaConstruida: 480,
    condoFee: 1200,
    iptu: 450,
    address: 'Avenida Alphaville, 3200',
    zipCode: '06472-010',
    neighborhood: 'Alphaville',
    city: 'Barueri',
    state: 'SP',
    photos: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&q=80&w=600,https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&q=80&w=600',
    features: 'Piscina de Borda Infinita, Sauna, Espaço Gourmet, Automação, Energia Solar',
    featured: true,
    latitude: -23.4975,
    longitude: -46.8522
  },
  {
    id: '3',
    code: 'FAB-003',
    title: 'Apartamento Minimalista no Itaim Bibi',
    description: 'Decorado por arquiteto renomado em estilo minimalista contemporâneo, mobiliário de design nacional incluso (porteira fechada), ar condicionado em todos os cômodos e sacada integrada com cortina de vidro.',
    price: 2100000,
    type: 'VENDA',
    category: 'APARTAMENTO',
    status: 'DISPONIVEL',
    bedrooms: 2,
    suites: 2,
    bathrooms: 3,
    garageSlots: 2,
    areaTotal: 110,
    areaConstruida: 110,
    condoFee: 1400,
    iptu: 380,
    address: 'Rua Clodomiro Amazonas, 850',
    zipCode: '04537-001',
    neighborhood: 'Itaim Bibi',
    city: 'São Paulo',
    state: 'SP',
    photos: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&q=80&w=600,https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&q=80&w=600',
    features: 'Porteira Fechada, Mobiliado, Varanda Gourmet, Academia, Salão de Festas',
    featured: true,
    latitude: -23.5855,
    longitude: -46.6772
  },
  {
    id: '4',
    code: 'FAB-004',
    title: 'Apartamento aconchegante em Pinheiros',
    description: 'Apartamento moderno e reformado em localização espetacular a poucos metros do metrô Fradique Coutinho. Totalmente equipado com marcenaria planejada, iluminação em LED e eletrodomésticos de última geração.',
    price: 4500,
    type: 'ALUGUEL',
    category: 'APARTAMENTO',
    status: 'DISPONIVEL',
    bedrooms: 2,
    suites: 1,
    bathrooms: 2,
    garageSlots: 1,
    areaTotal: 85,
    areaConstruida: 85,
    condoFee: 950,
    iptu: 220,
    address: 'Rua dos Pinheiros, 450',
    zipCode: '05422-000',
    neighborhood: 'Pinheiros',
    city: 'São Paulo',
    state: 'SP',
    photos: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=600,https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&q=80&w=600',
    features: 'Armários Planejados, Aquecimento a Gás, Portaria Remota, Pet Friendly',
    featured: false,
    latitude: -23.5678,
    longitude: -46.6853
  },
  {
    id: '5',
    code: 'FAB-005',
    title: 'Sala Comercial no Edifício Paulista Corporate',
    description: 'Conjunto comercial de alto padrão pronto para uso com divisórias em vidro duplo acústico, piso elevado em ardósia, ar condicionado central VRF, copa completa e 2 banheiros privativos. Localização icônica.',
    price: 950000,
    type: 'VENDA',
    category: 'SALA_COMERCIAL',
    status: 'DISPONIVEL',
    bedrooms: 0,
    suites: 0,
    bathrooms: 2,
    garageSlots: 2,
    areaTotal: 92,
    areaConstruida: 92,
    condoFee: 1800,
    iptu: 580,
    address: 'Avenida Paulista, 1000',
    zipCode: '01310-100',
    neighborhood: 'Bela Vista',
    city: 'São Paulo',
    state: 'SP',
    photos: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=600,https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&q=80&w=600',
    features: 'Piso Elevado, Heliponto, Auditório, Controle de Acesso, Ar Condicionado Central',
    featured: false,
    latitude: -23.5615,
    longitude: -46.6562
  },
  {
    id: '6',
    code: 'FAB-006',
    title: 'Terreno Plano para Construção Comercial',
    description: 'Excelente terreno comercial totalmente plano em via de altíssimo fluxo no coração do polo comercial. Pronto para construir redes varejistas, concessionárias, supermercados ou mall comercial.',
    price: 1800000,
    type: 'VENDA',
    category: 'TERRENO',
    status: 'DISPONIVEL',
    bedrooms: 0,
    suites: 0,
    bathrooms: 0,
    garageSlots: 0,
    areaTotal: 1200,
    areaConstruida: 0,
    condoFee: 0,
    iptu: 1100,
    address: 'Avenida Cassiano Ricardo, 1500',
    zipCode: '12246-870',
    neighborhood: 'Jardim Aquarius',
    city: 'São José dos Campos',
    state: 'SP',
    photos: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=600',
    features: 'Topografia Plana, Esquina Comercial, Zoneamento ZUC-1',
    featured: false,
    latitude: -23.2185,
    longitude: -45.9082
  }
];

function PropertiesCatalogContent() {
  const searchParams = useSearchParams();
  const [properties, setProperties] = useState<Property[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);

  // Search States
  const [searchText, setSearchText] = useState(searchParams?.get('search') || '');
  const [type, setType] = useState(searchParams?.get('type') || '');
  const [category, setCategory] = useState(searchParams?.get('category') || '');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [bedrooms, setBedrooms] = useState('');
  const [garageSlots, setGarageSlots] = useState('');

  // Map settings
  const [mapOpen, setMapOpen] = useState(false);

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = () => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/properties`)
      .then((res) => {
        if (!res.ok) throw new Error('API offline');
        return res.json();
      })
      .then((data) => {
        setProperties(data);
        applyFilters(data);
      })
      .catch((err) => {
        console.warn('API error, using seed fallbacks:', err);
        setProperties(SEED_PROPERTIES);
        applyFilters(SEED_PROPERTIES);
      });
  };

  const applyFilters = (data: Property[]) => {
    let result = [...data];

    // Filter out archived
    result = result.filter((p) => p.status !== 'ARQUIVADO');

    if (searchText) {
      const term = searchText.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(term) ||
          p.neighborhood.toLowerCase().includes(term) ||
          p.code.toLowerCase().includes(term),
      );
    }

    if (type) {
      result = result.filter((p) => p.type === type);
    }

    if (category) {
      result = result.filter((p) => p.category === category);
    }

    if (minPrice) {
      result = result.filter((p) => p.price >= parseFloat(minPrice));
    }

    if (maxPrice) {
      result = result.filter((p) => p.price <= parseFloat(maxPrice));
    }

    if (bedrooms) {
      result = result.filter((p) => p.bedrooms >= parseInt(bedrooms));
    }

    if (garageSlots) {
      result = result.filter((p) => p.garageSlots >= parseInt(garageSlots));
    }

    setFilteredProperties(result);
  };

  useEffect(() => {
    applyFilters(properties);
  }, [searchText, type, category, minPrice, maxPrice, bedrooms, garageSlots, properties]);

  const resetFilters = () => {
    setSearchText('');
    setType('');
    setCategory('');
    setMinPrice('');
    setMaxPrice('');
    setBedrooms('');
    setGarageSlots('');
  };

  const formatPrice = (val: number, type: string) => {
    const formatted = val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    return type === 'ALUGUEL' ? `${formatted}/mês` : formatted;
  };

  // Build Map URL using OpenStreetMap iframe embed for first property coordinates or SP Center
  const getMapIframeSrc = () => {
    if (filteredProperties.length > 0) {
      const p = filteredProperties[0];
      const lat = p.latitude || -23.5505;
      const lon = p.longitude || -46.6333;
      return `https://www.openstreetmap.org/export/embed.html?bbox=${lon - 0.01}%2C${lat - 0.01}%2C${lon + 0.01}%2C${lat + 0.01}&layer=mapnik&marker=${lat}%2C${lon}`;
    }
    return `https://www.openstreetmap.org/export/embed.html?bbox=-46.6433%2C-23.5605%2C-46.6233%2C-23.5405&layer=mapnik`;
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16 flex flex-col gap-8">
        {/* Title and Top Actions */}
        <div className="flex justify-between items-center">
          <div className="space-y-1">
            <h1 className="text-3xl font-extrabold text-foreground">Catálogo de Imóveis</h1>
            <p className="text-sm text-muted-foreground font-medium">
              Encontramos {filteredProperties.length} imóveis disponíveis para você.
            </p>
          </div>

          <button
            onClick={() => setMapOpen(!mapOpen)}
            className="flex items-center gap-2 border hover:border-primary hover:text-primary px-4 py-2.5 rounded-xl text-sm font-bold shadow-sm transition-colors cursor-pointer"
          >
            {mapOpen ? (
              <>
                <SlidersHorizontal className="h-4 w-4" /> Ver Filtros
              </>
            ) : (
              <>
                <Map className="h-4 w-4" /> Ver no Mapa
              </>
            )}
          </button>
        </div>

        {/* Content split */}
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Main Filter Sidebar (Hidden when map is open and replaces catalog layout) */}
          {!mapOpen && (
            <aside className="w-full lg:w-80 bg-card border rounded-2xl p-6 shadow-sm flex flex-col gap-6 sticky top-24">
              <h3 className="font-extrabold text-lg text-foreground border-b pb-3 flex items-center gap-2">
                <SlidersHorizontal className="h-5 w-5 text-primary" /> Filtros Avançados
              </h3>

              {/* Text Search */}
              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-foreground uppercase tracking-wider">Busca livre</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <input
                    type="text"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    placeholder="Bairro, título, código..."
                    className="w-full bg-secondary/50 border pl-9 pr-3 py-2.5 rounded-lg outline-none focus:ring-2 focus:ring-primary/40 text-foreground text-sm"
                  />
                </div>
              </div>

              {/* Type Select */}
              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-foreground uppercase tracking-wider">Modalidade</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full bg-secondary/50 border px-3 py-2.5 rounded-lg outline-none focus:ring-2 focus:ring-primary/40 text-foreground text-sm appearance-none cursor-pointer"
                >
                  <option value="">Comprar ou Alugar</option>
                  <option value="VENDA">Compra (Venda)</option>
                  <option value="ALUGUEL">Locação (Aluguel)</option>
                </select>
              </div>

              {/* Category Select */}
              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-foreground uppercase tracking-wider">Tipo de Imóvel</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-secondary/50 border px-3 py-2.5 rounded-lg outline-none focus:ring-2 focus:ring-primary/40 text-foreground text-sm appearance-none cursor-pointer"
                >
                  <option value="">Todos</option>
                  <option value="CASA">Casa</option>
                  <option value="APARTAMENTO">Apartamento</option>
                  <option value="COBERTURA">Cobertura</option>
                  <option value="SALA_COMERCIAL">Sala Comercial</option>
                  <option value="TERRENO">Terreno</option>
                </select>
              </div>

              {/* Price Limits */}
              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-foreground uppercase tracking-wider">Faixa de Preço (BRL)</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    placeholder="Mínimo"
                    className="w-full bg-secondary/50 border px-3 py-2.5 rounded-lg outline-none focus:ring-2 focus:ring-primary/40 text-foreground text-sm"
                  />
                  <input
                    type="number"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    placeholder="Máximo"
                    className="w-full bg-secondary/50 border px-3 py-2.5 rounded-lg outline-none focus:ring-2 focus:ring-primary/40 text-foreground text-sm"
                  />
                </div>
              </div>

              {/* Bedrooms Count */}
              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-foreground uppercase tracking-wider">Quartos Mínimo</label>
                <div className="flex gap-2">
                  {['1', '2', '3', '4+'].map((num) => {
                    const val = num.replace('+', '');
                    const isSelected = bedrooms === val;
                    return (
                      <button
                        type="button"
                        key={num}
                        onClick={() => setBedrooms(isSelected ? '' : val)}
                        className={`flex-grow py-2 rounded-lg border text-sm font-semibold transition-all ${
                          isSelected ? 'bg-primary border-primary text-white shadow-md' : 'bg-secondary/40 text-foreground hover:bg-secondary/70'
                        }`}
                      >
                        {num}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Garage slots */}
              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-foreground uppercase tracking-wider">Garagem Mínimo</label>
                <div className="flex gap-2">
                  {['1', '2', '3+'].map((num) => {
                    const val = num.replace('+', '');
                    const isSelected = garageSlots === val;
                    return (
                      <button
                        type="button"
                        key={num}
                        onClick={() => setGarageSlots(isSelected ? '' : val)}
                        className={`flex-grow py-2 rounded-lg border text-sm font-semibold transition-all ${
                          isSelected ? 'bg-primary border-primary text-white shadow-md' : 'bg-secondary/40 text-foreground hover:bg-secondary/70'
                        }`}
                      >
                        {num}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Reset filter button */}
              <button
                type="button"
                onClick={resetFilters}
                className="mt-2 w-full border border-dashed py-2.5 rounded-xl text-sm font-bold text-muted-foreground hover:text-primary hover:border-primary/50 transition-all cursor-pointer"
              >
                Limpar Filtros
              </button>
            </aside>
          )}

          {/* Map Side View Layout */}
          {mapOpen && (
            <div className="w-full lg:w-96 h-[75vh] border rounded-2xl overflow-hidden shadow-md flex-shrink-0">
              <iframe
                src={getMapIframeSrc()}
                className="w-full h-full border-none"
                title="Geolocalização dos Imóveis"
              />
            </div>
          )}

          {/* Grid of Results */}
          <div className="flex-grow w-full">
            {filteredProperties.length === 0 ? (
              <div className="bg-card border rounded-2xl py-20 px-4 text-center space-y-4">
                <Building2 className="h-12 w-12 text-muted-foreground mx-auto" />
                <h3 className="text-xl font-bold text-foreground">Nenhum imóvel encontrado</h3>
                <p className="text-muted-foreground text-sm max-w-sm mx-auto font-medium">
                  Tente alterar seus critérios de busca ou redefinir os filtros aplicados na lateral.
                </p>
                <button
                  onClick={resetFilters}
                  className="bg-primary text-white font-semibold py-2 px-6 rounded-lg shadow hover:bg-primary/90 transition-colors"
                >
                  Limpar Todos Filtros
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredProperties.map((property) => (
                  <div
                    key={property.id}
                    className="bg-card text-card-foreground border rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col group"
                  >
                    <div className="relative h-56 w-full overflow-hidden">
                      <PropertyImageCarousel property={property} className="relative h-56 w-full overflow-hidden bg-black" imageClassName="w-full h-full object-cover transition-transform duration-500" />
                      <div className="absolute top-4 left-4 bg-primary text-white text-xs font-extrabold px-3 py-1.5 rounded-md uppercase tracking-wider">
                        {property.type === 'VENDA' ? 'Comprar' : 'Alugar'}
                      </div>
                      {property.featured && (
                        <div className="absolute top-4 right-4 bg-amber-500 text-white p-1.5 rounded-lg shadow">
                          <Flame className="h-4 w-4 fill-current" />
                        </div>
                      )}
                      <div className="absolute bottom-4 right-4 bg-black/80 backdrop-blur-xs text-white text-xs font-semibold px-2 py-0.5 rounded">
                        {property.code}
                      </div>
                    </div>

                    <div className="p-6 flex-grow flex flex-col gap-4">
                      <div className="space-y-1.5">
                        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
                          {property.category.replace('_', ' ')} • {property.neighborhood}
                        </span>
                        <h3 className="font-extrabold text-base line-clamp-1 group-hover:text-primary transition-colors">
                          {property.title}
                        </h3>
                      </div>

                      {/* Amenities Icons */}
                      <div className="flex gap-4 text-xs text-muted-foreground border-y py-2.5 my-1">
                        <div className="flex items-center gap-1">
                          <Bed className="h-4 w-4 text-primary" />
                          <span>{property.bedrooms} Qts</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Bath className="h-4 w-4 text-primary" />
                          <span>{property.bathrooms} Banh</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Car className="h-4 w-4 text-primary" />
                          <span>{property.garageSlots} Vag</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Maximize className="h-4 w-4 text-primary" />
                          <span>{property.areaTotal} m²</span>
                        </div>
                      </div>

                      {/* Address */}
                      <p className="text-xs text-muted-foreground line-clamp-1 flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                        {property.address}, {property.city}
                      </p>

                      {/* Pricing and Link */}
                      <div className="flex justify-between items-center mt-auto pt-2 border-t border-dashed">
                        <span className="font-black text-lg text-primary">
                          {formatPrice(property.price, property.type)}
                        </span>
                        <a
                          href={`/imoveis/${property.id}`}
                          className="bg-secondary hover:bg-primary/10 hover:text-primary text-foreground font-semibold px-3 py-1.5 rounded-lg text-xs transition-colors"
                        >
                          Ver detalhes
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function PropertiesCatalog() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    }>
      <PropertiesCatalogContent />
    </Suspense>
  );
}
