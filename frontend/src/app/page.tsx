'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Hero from '@/components/Hero';
import PropertyImageCarousel from '@/components/PropertyImageCarousel';
import { Bed, Bath, ArrowRight, Star, Sparkles, Building2, Flame, Phone, Mail, MapPin, Instagram, Calculator, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

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
  bathrooms: number;
  areaTotal: number;
  neighborhood: string;
  city: string;
  photos: string;
  photoItems?: Array<{ url: string; alt?: string | null }>;
  featured: boolean;
}

export default function Home() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedType, setSelectedType] = useState('VENDA');
  const router = useRouter();

  // Fetch properties from backend
  useEffect(() => {
    fetch('http://localhost:3001/properties')
      .then((res) => {
        if (!res.ok) throw new Error('API offline');
        return res.json();
      })
      .then((data) => {
        // Display featured properties or just take first 3
        setProperties(data);
      })
      .catch((err) => {
        console.warn('API error, using seed fallbacks:', err);
        // Fallback seed mock data to keep UI functional
        setProperties([
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
            bathrooms: 5,
            areaTotal: 320,
            neighborhood: 'Jardins',
            city: 'São Paulo',
            photos: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&q=80&w=600,https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=600',
            featured: true
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
            bathrooms: 6,
            areaTotal: 650,
            neighborhood: 'Alphaville',
            city: 'Barueri',
            photos: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&q=80&w=600,https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&q=80&w=600',
            featured: true
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
            bathrooms: 3,
            areaTotal: 110,
            neighborhood: 'Itaim Bibi',
            city: 'São Paulo',
            photos: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&q=80&w=600,https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&q=80&w=600',
            featured: true
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
            bathrooms: 2,
            areaTotal: 85,
            neighborhood: 'Pinheiros',
            city: 'São Paulo',
            photos: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=600,https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&q=80&w=600',
            featured: false
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
            bathrooms: 2,
            areaTotal: 92,
            neighborhood: 'Bela Vista',
            city: 'São Paulo',
            photos: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=600,https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&q=80&w=600',
            featured: false
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
            bathrooms: 0,
            areaTotal: 1200,
            neighborhood: 'Jardim Aquarius',
            city: 'São José dos Campos',
            photos: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=600',
            featured: false
          }
        ]);
      });
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery) params.append('search', searchQuery);
    if (selectedCategory) params.append('category', selectedCategory);
    if (selectedType) params.append('type', selectedType);
    router.push(`/imoveis?${params.toString()}`);
  };

  const formatPrice = (val: number, type: string) => {
    const formatted = val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    return type === 'ALUGUEL' ? `${formatted}/mês` : formatted;
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      {/* Modern Scroll-Triggered Hero Section */}
      <Hero 
        onSearch={handleSearch}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        selectedType={selectedType}
        setSelectedType={setSelectedType}
      />

      {/* Featured Properties Grid */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div className="space-y-2">
            <span className="text-primary font-bold tracking-wider uppercase text-sm flex items-center gap-1.5">
              <Flame className="h-4 w-4" /> Destaques da Semana
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground">
              Nossos Imóveis Exclusivos
            </h2>
          </div>
          <Link
            href="/imoveis"
            className="text-primary font-bold hover:gap-3 flex items-center gap-2 transition-all group"
          >
            Ver catálogo completo <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {properties
            .filter((p) => p.featured)
            .slice(0, 3)
            .map((property) => (
              <motion.div
                key={property.id}
                whileHover={{ y: -6 }}
                className="relative bg-card text-card-foreground border rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all flex flex-col group"
              >
                {/* Image carousel */}
                <div className="relative h-60 w-full overflow-hidden">
                  <PropertyImageCarousel
                    property={property}
                    className="relative h-60 w-full overflow-hidden bg-black"
                    imageClassName="w-full h-full object-cover transition-transform duration-500"
                  />
                  <div className="absolute top-4 left-4 bg-primary text-white text-xs font-extrabold px-3 py-1.5 rounded-md uppercase tracking-wider">
                    {property.type === 'VENDA' ? 'Comprar' : 'Alugar'}
                  </div>
                  <div className="absolute bottom-4 right-4 bg-black/80 backdrop-blur-xs text-white text-xs font-semibold px-2.5 py-1 rounded">
                    {property.code}
                  </div>
                </div>

                {/* Details */}
                <div className="p-6 flex-grow flex flex-col gap-4">
                  <div className="space-y-1.5">
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
                      {property.category.replace('_', ' ')} • {property.neighborhood}
                    </span>
                    <h3 className="font-extrabold text-lg line-clamp-1 group-hover:text-primary transition-colors">
                      {property.title}
                    </h3>
                  </div>

                  {/* Badges/Characteristics */}
                  <div className="flex gap-4 text-sm text-muted-foreground border-y py-3 my-1">
                    <div className="flex items-center gap-1.5">
                      <Bed className="h-4 w-4 text-primary" />
                      <span>{property.bedrooms} Quartos</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Bath className="h-4 w-4 text-primary" />
                      <span>{property.bathrooms} Banheiros</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Building2 className="h-4 w-4 text-primary" />
                      <span>{property.areaTotal} m²</span>
                    </div>
                  </div>

                  {/* Price and Action */}
                  <div className="flex justify-between items-center mt-auto pt-2">
                    <span className="font-black text-xl text-primary">
                      {formatPrice(property.price, property.type)}
                    </span>
                    <Link
                      href={`/imoveis/${property.id}`}
                      className="border border-secondary hover:border-primary/50 text-foreground/80 hover:text-primary px-4 py-2 rounded-lg font-semibold text-sm transition-colors"
                    >
                      Ver Detalhes
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
        </div>
      </section>

      {/* Simulator Presentation Section */}
      <section className="py-24 bg-secondary/15 border-t border-neutral-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Info Side */}
          <div className="space-y-6">
            <div className="space-y-3">
              <span className="text-primary font-bold uppercase tracking-wider text-xs flex items-center gap-1.5">
                <Calculator className="h-4 w-4" /> Planejamento Financeiro
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
                Simule seu Financiamento de Forma Simples e Transparente
              </h2>
              <p className="text-muted-foreground text-sm leading-relaxed max-w-md mx-auto lg:mx-0 font-medium">
                Desenvolvemos uma ferramenta exclusiva para ajudar você a planejar a compra do seu próximo imóvel. Saiba instantaneamente o valor das parcelas e a renda ideal recomendada.
              </p>
            </div>

            <ul className="space-y-3 text-sm text-foreground/80 font-semibold">
              <li className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-primary shrink-0" />
                <span>Simulação em tempo real para os sistemas SAC e PRICE</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-primary shrink-0" />
                <span>Cálculo automático de valor financiado e entrada mínima</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-primary shrink-0" />
                <span>Recomendação personalizada de renda familiar exigida</span>
              </li>
            </ul>

            <div className="pt-2">
              <Link
                href="/simulador"
                className="inline-flex items-center gap-2 bg-primary hover:bg-primary/95 text-white font-bold px-6 py-3 rounded-xl shadow-lg transition-colors text-xs uppercase cursor-pointer"
              >
                Acessar Simulador Completo
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Visual Card Mockup Side */}
          <div className="relative">
            <div className="absolute inset-0 bg-primary/10 rounded-3xl blur-3xl -z-10" />
            <div className="bg-card border border-neutral-900 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
              <div className="flex justify-between items-center border-b border-neutral-900 pb-3">
                <h4 className="font-extrabold text-sm text-foreground flex items-center gap-2">
                  <Calculator className="h-4 w-4 text-primary" />
                  Demonstração do Simulador
                </h4>
                <span className="text-[10px] font-extrabold bg-primary/10 text-primary px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  SAC / PRICE
                </span>
              </div>

              {/* Mock sliders */}
              <div className="space-y-4 text-[11px] font-bold text-muted-foreground uppercase">
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span>Valor do Imóvel</span>
                    <span className="text-primary font-black text-xs">R$ 350.000,00</span>
                  </div>
                  <div className="w-full h-1 bg-secondary rounded-lg" />
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span>Valor de Entrada (20%)</span>
                    <span className="text-primary font-black text-xs">R$ 70.000,00</span>
                  </div>
                  <div className="w-full h-1 bg-secondary rounded-lg" />
                </div>
              </div>

              {/* Quick results mockup */}
              <div className="grid grid-cols-2 gap-4 bg-secondary/15 p-4 rounded-2xl border border-neutral-900 text-center">
                <div className="space-y-1">
                  <span className="text-[9px] font-bold text-muted-foreground uppercase">Parcela Inicial</span>
                  <span className="text-sm font-black text-primary block">R$ 2.994,44</span>
                </div>
                <div className="space-y-1">
                  <span className="text-[9px] font-bold text-muted-foreground uppercase">Renda Sugerida</span>
                  <span className="text-sm font-black text-foreground block">R$ 9.981,48</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Instagram Feed Section */}
      <section className="py-20 bg-background border-t border-neutral-900 text-center space-y-10">
        <div className="max-w-3xl mx-auto px-4 space-y-3">
          <span className="text-primary font-bold uppercase tracking-wider text-xs flex items-center justify-center gap-1.5">
            <Instagram className="h-4 w-4" /> Instagram Feed
          </span>
          <h2 className="text-3xl font-extrabold text-foreground">Siga @fabelleimobiliaria</h2>
          <p className="text-muted-foreground text-sm font-semibold max-w-md mx-auto">
            Acompanhe nossas novidades, lançamentos exclusivos e bastidores do mercado imobiliário em Jacareí e região.
          </p>
          <a
            href="https://www.instagram.com/fabelleimobiliaria/"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 bg-primary hover:bg-primary/95 text-white font-bold px-6 py-3 rounded-xl shadow-lg transition-colors cursor-pointer text-xs uppercase"
          >
            <Instagram className="h-4 w-4" /> Seguir no Instagram
          </a>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            {
              url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=600',
              likes: '142',
              comments: '12',
            },
            {
              url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=600',
              likes: '98',
              comments: '8',
            },
            {
              url: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&q=80&w=600',
              likes: '215',
              comments: '19',
            },
            {
              url: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&q=80&w=600',
              likes: '176',
              comments: '15',
            },
          ].map((post, idx) => (
            <a
              key={idx}
              href="https://www.instagram.com/fabelleimobiliaria/"
              target="_blank"
              rel="noreferrer"
              className="relative aspect-square rounded-2xl overflow-hidden group shadow-md border border-neutral-900 block"
            >
              <img
                src={post.url}
                alt="Instagram post Fabelle"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-6 text-white font-bold text-sm">
                <span className="flex items-center gap-1.5">
                  ❤️ {post.likes}
                </span>
                <span className="flex items-center gap-1.5">
                  💬 {post.comments}
                </span>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-secondary/35 text-center space-y-12">
        <div className="max-w-3xl mx-auto px-4 space-y-3">
          <span className="text-primary font-bold uppercase tracking-wider text-xs">Avaliações do Google</span>
          <h2 className="text-3xl font-extrabold text-foreground">O que dizem nossos clientes</h2>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-2">
            <div className="flex items-center gap-2">
              <span className="text-xl font-black text-foreground">5.0</span>
              <div className="flex text-amber-500">
                <Star className="h-5 w-5 fill-current" />
                <Star className="h-5 w-5 fill-current" />
                <Star className="h-5 w-5 fill-current" />
                <Star className="h-5 w-5 fill-current" />
                <Star className="h-5 w-5 fill-current" />
              </div>
              <span className="text-xs text-muted-foreground font-semibold">(34 avaliações no Google)</span>
            </div>
            <a
              href="https://www.google.com/search?q=Fabelle+Imobili%C3%A1ria+Jacare%C3%AD"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 bg-primary/15 hover:bg-primary/25 text-primary border border-primary/20 px-3 py-1.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider transition-all cursor-pointer"
            >
              Ver todas no Google →
            </a>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              text: 'Recomendo de olhos fechados para quem busca um negócio seguro e sem burocracia!',
              name: 'Marcos Silva',
              role: 'Avaliação do Google',
            },
            {
              text: 'Atendimento impecável, atenção, profissionalismo e dedicação ao cliente.',
              name: 'Natália D.',
              role: 'Avaliação do Google',
            },
            {
              text: 'Processo rápido, transparente e corretores extremamente qualificados. Recomendo muito!',
              name: 'Micael Domiciano',
              role: 'Avaliação do Google',
            },
          ].map((t, idx) => (
            <div key={idx} className="bg-card border rounded-2xl p-8 shadow-sm flex flex-col gap-6 text-left relative">
              <div className="flex gap-1 text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-current" />
                ))}
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed italic flex-grow">
                "{t.text}"
              </p>
              <div className="flex items-center gap-3.5 border-t pt-4">
                <div className="h-10 w-10 bg-primary/10 text-primary font-bold rounded-full flex items-center justify-center text-sm">
                  {t.name[0]}
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-foreground">{t.name}</h4>
                  <span className="text-xs text-muted-foreground">{t.role}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Contact Section on Homepage */}
      <section id="contato" className="py-20 bg-background border-t border-neutral-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-stretch">
          <div className="space-y-6 flex flex-col justify-center">
            <div className="space-y-3">
              <span className="text-primary font-bold uppercase tracking-wider text-xs">Atendimento</span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground">Fale Conosco</h2>
              <p className="text-muted-foreground text-sm leading-relaxed max-w-md font-medium">
                Tem dúvidas sobre algum imóvel ou gostaria de anunciar com a Fabelle? Preencha o formulário e nossa equipe entrará em contato rapidamente.
              </p>
            </div>
            
            <div className="space-y-4 text-sm text-foreground/80 font-semibold">
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 text-primary p-2.5 rounded-lg">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-extrabold text-foreground text-xs">Endereço</h4>
                  <span className="text-xs text-muted-foreground font-light">R. Barão de Jacareí, 985 - Centro, Jacareí - SP, 12308-000</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 text-primary p-2.5 rounded-lg">
                  <Phone className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-extrabold text-foreground text-xs">Telefone e WhatsApp</h4>
                  <span className="text-xs text-muted-foreground font-light">(12) 99784-8803</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 text-primary p-2.5 rounded-lg">
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-extrabold text-foreground text-xs">E-mail de Contato</h4>
                  <span className="text-xs text-muted-foreground font-light">fabelleimobiliaria@gmail.com</span>
                </div>
              </div>

              {/* Map embed on homepage too */}
              <div className="h-64 w-full border border-neutral-900 rounded-xl overflow-hidden shadow-xs mt-4">
                <iframe
                  src="https://www.openstreetmap.org/export/embed.html?bbox=-45.9697%2C-23.3110%2C-45.9597%2C-23.3010&layer=mapnik&marker=-23.3060%2C-45.9647"
                  className="w-full h-full border-none"
                  title="Localização Fabelle Jacareí Homepage"
                />
              </div>
            </div>
          </div>

          <div className="bg-card border border-neutral-900 rounded-2xl p-8 shadow-md">
            <h3 className="font-extrabold text-lg text-foreground mb-4">Envie uma Mensagem</h3>
            <form className="space-y-4" onSubmit={(e) => {
              e.preventDefault();
              alert('Mensagem enviada com sucesso! Um corretor Fabelle entrará em contato.');
              (e.target as HTMLFormElement).reset();
            }}>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-foreground/80 uppercase">Nome Completo</label>
                <input required type="text" placeholder="Ex: João da Silva" className="w-full bg-secondary/50 border border-neutral-900 px-4 py-2.5 rounded-lg outline-none text-sm text-foreground focus:ring-1 focus:ring-primary" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-foreground/80 uppercase">E-mail</label>
                  <input required type="email" placeholder="Ex: joao@email.com" className="w-full bg-secondary/50 border border-neutral-900 px-4 py-2.5 rounded-lg outline-none text-sm text-foreground focus:ring-1 focus:ring-primary" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-foreground/80 uppercase">Telefone</label>
                  <input required type="tel" placeholder="Ex: (12) 99999-9999" className="w-full bg-secondary/50 border border-neutral-900 px-4 py-2.5 rounded-lg outline-none text-sm text-foreground focus:ring-1 focus:ring-primary" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-foreground/80 uppercase">Como podemos ajudar?</label>
                <textarea required rows={3} placeholder="Escreva sua mensagem aqui..." className="w-full bg-secondary/50 border border-neutral-900 px-4 py-2.5 rounded-lg outline-none text-sm text-foreground focus:ring-1 focus:ring-primary" />
              </div>
              <button type="submit" className="w-full bg-primary hover:bg-primary/95 text-white font-bold py-3 rounded-xl shadow transition-colors cursor-pointer text-sm">
                Enviar Mensagem
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* CTA section */}
      <section className="py-20 bg-primary text-white text-center">
        <div className="max-w-4xl mx-auto px-4 space-y-8">
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
            Pronto para encontrar o seu próximo imóvel?
          </h2>
          <p className="text-lg text-amber-100/90 max-w-xl mx-auto font-light">
            Entre em contato com nossos especialistas ou explore nosso catálogo completo e agende uma visita agora mesmo.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href="/imoveis"
              className="bg-white hover:bg-slate-100 text-primary font-bold px-8 py-4 rounded-xl shadow-lg transition-colors cursor-pointer"
            >
              Ver Imóveis
            </Link>
            <Link
              href="/contato"
              className="border border-white/40 hover:bg-white/10 text-white font-bold px-8 py-4 rounded-xl transition-colors cursor-pointer"
            >
              Falar com Corretor
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
