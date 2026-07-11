import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Calendar, User, ArrowRight, BookOpen } from 'lucide-react';

const ARTICLES = [
  {
    title: '5 Dicas Essenciais para Comprar o Primeiro Imóvel em São Paulo',
    excerpt: 'Comprar um imóvel é um grande passo. Saiba quais são os principais pontos jurídicos e financeiros a analisar antes de fechar o contrato.',
    date: '05 de Julho, 2026',
    author: 'Amanda Souza',
    image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=600',
    category: 'Compra & Venda',
  },
  {
    title: 'Jardins vs Pinheiros: Qual o melhor bairro para morar de aluguel?',
    excerpt: 'Comparamos a infraestrutura, transporte, polo gastronômico e média de valores residenciais entre duas das regiões mais procuradas de SP.',
    date: '28 de Junho, 2026',
    author: 'Rodrigo Silva',
    image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80&w=600',
    category: 'Mercado Local',
  },
  {
    title: 'O que é a Assinatura Eletrônica e como ela acelera contratos de locação?',
    excerpt: 'Descubra a legalidade e os benefícios de assinar contratos digitalmente, eliminando a burocracia do cartório e reduzindo prazos.',
    date: '15 de Junho, 2026',
    author: 'Carla Gerente',
    image: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&q=80&w=600',
    category: 'Tecnologia',
  },
];

export default function BlogPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16 space-y-12">
        {/* Banner header */}
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <span className="text-primary font-bold uppercase tracking-wider text-xs flex items-center justify-center gap-1.5">
            <BookOpen className="h-4 w-4" /> Nosso Blog
          </span>
          <h1 className="text-4xl font-extrabold text-foreground tracking-tight">Fabelle Insights</h1>
          <p className="text-muted-foreground text-sm leading-relaxed font-medium">
            Mantenha-se informado com análises de mercado, guias práticos e novidades sobre o mercado imobiliário paulista.
          </p>
        </div>

        {/* Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {ARTICLES.map((article, idx) => (
            <article
              key={idx}
              className="bg-card border rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col group"
            >
              <div className="relative h-52 w-full overflow-hidden">
                <img
                  src={article.image}
                  alt={article.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-4 left-4 bg-black/80 backdrop-blur-xs text-white text-xs font-semibold px-3 py-1 rounded">
                  {article.category}
                </div>
              </div>

              <div className="p-6 flex-grow flex flex-col gap-4">
                <div className="flex items-center gap-4 text-xs text-muted-foreground font-semibold">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" /> {article.date}
                  </span>
                  <span className="flex items-center gap-1">
                    <User className="h-3.5 w-3.5" /> {article.author}
                  </span>
                </div>

                <div className="space-y-2">
                  <h2 className="font-extrabold text-lg text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                    {article.title}
                  </h2>
                  <p className="text-muted-foreground text-xs leading-relaxed line-clamp-3 font-medium">
                    {article.excerpt}
                  </p>
                </div>

                <a
                  href="#"
                  className="text-primary font-bold text-xs mt-auto pt-4 border-t flex items-center gap-1 hover:gap-2 transition-all group/link"
                >
                  Ler matéria completa
                  <ArrowRight className="h-3.5 w-3.5 group-hover/link:translate-x-0.5 transition-transform" />
                </a>
              </div>
            </article>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
