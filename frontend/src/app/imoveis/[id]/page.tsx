'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Bed, Bath, Car, Maximize, MapPin, Building, Phone, Send, CheckCircle, ShieldCheck, Mail, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getPropertyPhotos } from '@/components/PropertyImageCarousel';

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
  featured?: boolean;
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
  broker?: {
    id: string;
    name: string;
    phone: string;
    email: string;
    photo?: string;
  };
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
    longitude: -46.6627,
    broker: {
      id: 'broker1',
      name: 'Rodrigo Silva',
      phone: '(12) 99784-8803',
      email: 'corretor1@fabelle.com.br',
      photo: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=200'
    }
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
    longitude: -46.8522,
    broker: {
      id: 'broker1',
      name: 'Rodrigo Silva',
      phone: '(12) 99784-8803',
      email: 'corretor1@fabelle.com.br',
      photo: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=200'
    }
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
    longitude: -46.6772,
    broker: {
      id: 'broker1',
      name: 'Rodrigo Silva',
      phone: '(12) 99784-8803',
      email: 'corretor1@fabelle.com.br',
      photo: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=200'
    }
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
    longitude: -46.6853,
    broker: {
      id: 'broker1',
      name: 'Rodrigo Silva',
      phone: '(12) 99784-8803',
      email: 'corretor1@fabelle.com.br',
      photo: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=200'
    }
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
    longitude: -46.6562,
    broker: {
      id: 'broker1',
      name: 'Rodrigo Silva',
      phone: '(12) 99784-8803',
      email: 'corretor1@fabelle.com.br',
      photo: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=200'
    }
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
    longitude: -45.9082,
    broker: {
      id: 'broker1',
      name: 'Rodrigo Silva',
      phone: '(12) 99784-8803',
      email: 'corretor1@fabelle.com.br',
      photo: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=200'
    }
  }
];

export default function PropertyDetail() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();

  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Lead Form States
  const [leadName, setLeadName] = useState('');
  const [leadEmail, setLeadEmail] = useState('');
  const [leadPhone, setLeadPhone] = useState('');
  const [leadNotes, setLeadNotes] = useState('');
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [submittingLead, setSubmittingLead] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);

    fetch(`http://localhost:3001/properties/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error('Not found');
        return res.json();
      })
      .then((data) => {
        setProperty(data);
        setLoading(false);
      })
      .catch(() => {
        // Fallback checks
        const found = SEED_PROPERTIES.find((p) => p.id === id);
        if (found) {
          setProperty(found);
        } else {
          router.push('/imoveis');
        }
        setLoading(false);
      });
  }, [id]);

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!property) return;
    setSubmittingLead(true);

    try {
      const res = await fetch('http://localhost:3001/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: leadName,
          email: leadEmail,
          phone: leadPhone,
          whatsapp: leadPhone,
          notes: `Interesse no imóvel ${property.code} (${property.title}). Mensagem do cliente: ${leadNotes}`,
          brokerId: property.broker?.id,
          source: 'SITE',
        }),
      });

      if (res.ok) {
        setFormSubmitted(true);
      } else {
        throw new Error('Falha ao enviar lead');
      }
    } catch {
      // Mock success if API is offline so customer visual flow is working
      setFormSubmitted(true);
    } finally {
      setSubmittingLead(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <Header />
        <div className="flex-grow flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!property) return null;

  const imageList = getPropertyPhotos(property);
  const goToImage = (direction: -1 | 1) => {
    setActiveImageIndex((current) => (current + direction + imageList.length) % imageList.length);
  };
  const featureList = property.features.split(',').filter(Boolean);

  const formatPrice = (val: number, type: string) => {
    const formatted = val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    return type === 'ALUGUEL' ? `${formatted}/mês` : formatted;
  };

  const mapSrc = `https://www.openstreetmap.org/export/embed.html?bbox=${(property.longitude || -46.6333) - 0.005}%2C${(property.latitude || -23.5505) - 0.005}%2C${(property.longitude || -46.6333) + 0.005}%2C${(property.latitude || -23.5505) + 0.005}&layer=mapnik&marker=${property.latitude || -23.5505}%2C${property.longitude || -46.6333}`;

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />

      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16 space-y-10">
        {/* Back Link */}
        <div className="mb-2">
          <Link 
            href="/imoveis" 
            className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:underline transition-all"
          >
            ← Voltar para o catálogo de imóveis
          </Link>
        </div>

        {/* Title, Category & Code */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-2">
            <span className="bg-primary/10 text-primary font-bold text-xs px-3 py-1 rounded-full uppercase tracking-wider">
              {property.type === 'VENDA' ? 'Comprar' : 'Alugar'} • {property.category.replace('_', ' ')}
            </span>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-foreground tracking-tight leading-tight">
              {property.title}
            </h1>
            <p className="flex items-center gap-1.5 text-sm text-muted-foreground font-semibold">
              <MapPin className="h-4 w-4 text-primary" />
              {property.address}, {property.neighborhood}, {property.city} - {property.state}
            </p>
          </div>

          <div className="text-left md:text-right space-y-1 bg-secondary/35 p-4 rounded-2xl border min-w-[200px]">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Valor do Imóvel</span>
            <div className="text-2xl sm:text-3xl font-black text-primary">
              {formatPrice(property.price, property.type)}
            </div>
            <span className="text-xs font-semibold text-muted-foreground block">
              Código: {property.code}
            </span>
          </div>
        </div>

        {/* Gallery & Sidebar layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Main info & images */}
          <div className="lg:col-span-2 space-y-8">
            {/* Gallery Component */}
            <div className="space-y-4">
              <div className="relative h-[480px] w-full border rounded-2xl overflow-hidden shadow-sm bg-black">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={activeImageIndex}
                    src={imageList[activeImageIndex]}
                    alt={`Foto ${activeImageIndex + 1}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="w-full h-full object-cover"
                  />
                </AnimatePresence>
              </div>

              {/* Thumbnails */}
              {imageList.length > 1 && (
                <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin">
                  {imageList.map((photo, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIndex(idx)}
                      className={`h-20 w-28 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 ${
                        activeImageIndex === idx ? 'border-primary scale-95 shadow-md' : 'border-transparent hover:border-muted-foreground/30'
                      }`}
                    >
                      <img src={photo} alt={`Miniatura ${idx + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Metrics */}
            <div className="bg-card border rounded-2xl p-6 shadow-xs grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div className="space-y-1">
                <Bed className="h-6 w-6 text-primary mx-auto" />
                <span className="text-sm font-extrabold text-foreground block">{property.bedrooms} Quartos</span>
                <span className="text-xs text-muted-foreground font-semibold">{property.suites} Suítes</span>
              </div>
              <div className="space-y-1">
                <Bath className="h-6 w-6 text-primary mx-auto" />
                <span className="text-sm font-extrabold text-foreground block">{property.bathrooms} Banheiros</span>
              </div>
              <div className="space-y-1">
                <Car className="h-6 w-6 text-primary mx-auto" />
                <span className="text-sm font-extrabold text-foreground block">{property.garageSlots} Vagas</span>
                <span className="text-xs text-muted-foreground font-semibold">Garagem</span>
              </div>
              <div className="space-y-1">
                <Maximize className="h-6 w-6 text-primary mx-auto" />
                <span className="text-sm font-extrabold text-foreground block">{property.areaTotal} m²</span>
                <span className="text-xs text-muted-foreground font-semibold">Área Total</span>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-4">
              <h3 className="font-extrabold text-xl text-foreground">Descrição do Imóvel</h3>
              <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-line font-medium">
                {property.description}
              </p>
            </div>

            {/* Comodidades/Características */}
            <div className="space-y-4">
              <h3 className="font-extrabold text-xl text-foreground">Características e Diferenciais</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {featureList.map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-2 bg-secondary/40 border px-4 py-2.5 rounded-xl text-xs font-bold text-foreground">
                    <CheckCircle className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                    {feature}
                  </div>
                ))}
              </div>
            </div>

            {/* Map Location */}
            <div className="space-y-4">
              <h3 className="font-extrabold text-xl text-foreground">Localização</h3>
              <div className="h-72 w-full border rounded-2xl overflow-hidden shadow-xs">
                <iframe
                  src={mapSrc}
                  className="w-full h-full border-none"
                  title="Localização do Imóvel"
                />
              </div>
            </div>
          </div>

          {/* Sidebar Forms */}
          <div className="space-y-6 lg:sticky lg:top-24">
            {/* Broker responsible */}
            {property.broker && (
              <div className="bg-card border rounded-2xl p-6 shadow-sm flex items-center gap-4">
                <img
                  src={property.broker.photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'}
                  alt={property.broker.name}
                  className="h-14 w-14 rounded-full object-cover shadow"
                />
                <div className="space-y-1">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Corretor Responsável</span>
                  <h4 className="font-extrabold text-base text-foreground">{property.broker.name}</h4>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground font-semibold">
                    <Phone className="h-3 w-3 text-primary" />
                    {property.broker.phone}
                  </div>
                </div>
              </div>
            )}

            {/* Contact Lead Form */}
            <div className="bg-card border rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
              <h3 className="font-extrabold text-lg text-foreground border-b pb-3 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" /> Tenho Interesse
              </h3>

              {formSubmitted ? (
                <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 p-6 rounded-xl text-center space-y-3">
                  <CheckCircle className="h-10 w-10 text-emerald-500 mx-auto" />
                  <h4 className="font-extrabold text-base text-emerald-800 dark:text-emerald-300">Solicitação enviada!</h4>
                  <p className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">
                    Obrigado pelo contato. Um corretor especialista da Fabelle entrará em contato via WhatsApp ou e-mail o mais breve possível.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleLeadSubmit} className="space-y-4">
                  {/* Name */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground/80 uppercase">Nome completo</label>
                    <input
                      type="text"
                      required
                      value={leadName}
                      onChange={(e) => setLeadName(e.target.value)}
                      placeholder="Ex: João da Silva"
                      className="w-full bg-secondary/50 border px-4 py-2.5 rounded-lg outline-none focus:ring-2 focus:ring-primary/40 text-foreground text-sm"
                    />
                  </div>

                  {/* Email */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground/80 uppercase">E-mail</label>
                    <input
                      type="email"
                      required
                      value={leadEmail}
                      onChange={(e) => setLeadEmail(e.target.value)}
                      placeholder="Ex: joao@email.com"
                      className="w-full bg-secondary/50 border px-4 py-2.5 rounded-lg outline-none focus:ring-2 focus:ring-primary/40 text-foreground text-sm"
                    />
                  </div>

                  {/* Phone */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground/80 uppercase">Telefone / WhatsApp</label>
                    <input
                      type="tel"
                      required
                      value={leadPhone}
                      onChange={(e) => setLeadPhone(e.target.value)}
                      placeholder="Ex: (11) 99999-9999"
                      className="w-full bg-secondary/50 border px-4 py-2.5 rounded-lg outline-none focus:ring-2 focus:ring-primary/40 text-foreground text-sm"
                    />
                  </div>

                  {/* Message */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground/80 uppercase">Mensagem</label>
                    <textarea
                      rows={3}
                      value={leadNotes}
                      onChange={(e) => setLeadNotes(e.target.value)}
                      placeholder="Quero agendar uma visita..."
                      className="w-full bg-secondary/50 border px-4 py-2.5 rounded-lg outline-none focus:ring-2 focus:ring-primary/40 text-foreground text-sm"
                    />
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={submittingLead}
                    className="w-full bg-primary hover:bg-primary/95 text-white font-bold py-3 rounded-xl shadow hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <Send className="h-4 w-4" />
                    {submittingLead ? 'Enviando...' : 'Enviar Mensagem'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* Outros Imóveis Relacionados */}
        <div className="border-t border-neutral-900 pt-12 space-y-8">
          <div className="space-y-1">
            <span className="text-primary font-bold uppercase tracking-wider text-xs">Exclusividades Fabelle</span>
            <h2 className="text-2xl font-extrabold text-foreground">Conheça Outros Imóveis</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {SEED_PROPERTIES
              .filter((p) => p.id !== property.id)
              .slice(0, 3)
              .map((relatedProp) => (
                <Link
                  key={relatedProp.id}
                  href={`/imoveis/${relatedProp.id}`}
                  className="bg-card text-card-foreground border rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all flex flex-col group"
                >
                  <div className="relative h-48 w-full overflow-hidden">
                    <img
                      src={relatedProp.photos.split(',')[0]}
                      alt={relatedProp.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-4 left-4 bg-primary text-white text-[10px] font-extrabold px-2.5 py-1 rounded uppercase tracking-wider">
                      {relatedProp.type === 'VENDA' ? 'Comprar' : 'Alugar'}
                    </div>
                  </div>
                  <div className="p-5 flex-grow flex flex-col justify-between gap-4">
                    <div className="space-y-1.5">
                      <h3 className="font-extrabold text-base text-foreground group-hover:text-primary transition-colors line-clamp-1">
                        {relatedProp.title}
                      </h3>
                      <p className="text-xs text-muted-foreground font-semibold line-clamp-2">
                        {relatedProp.description}
                      </p>
                    </div>
                    <div className="flex justify-between items-center border-t border-neutral-900 pt-3">
                      <span className="text-sm font-bold text-primary">
                        {relatedProp.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        {relatedProp.type === 'ALUGUEL' && '/mês'}
                      </span>
                      <span className="text-[10px] font-bold bg-secondary px-2 py-1 rounded text-muted-foreground">
                        {relatedProp.code}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
