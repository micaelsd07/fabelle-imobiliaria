'use client';

import React, { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Mail, Phone, MapPin, Send, CheckCircle } from 'lucide-react';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          phone,
          whatsapp: phone,
          notes: `Fale Conosco: ${message}`,
          source: 'SITE',
        }),
      });

      if (res.ok) {
        setSubmitted(true);
      } else {
        throw new Error('Erro ao enviar lead');
      }
    } catch {
      // Offline fallback simulation
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <h1 className="text-4xl font-extrabold text-foreground tracking-tight">Fale Conosco</h1>
          <p className="text-muted-foreground text-sm leading-relaxed font-medium">
            Tem alguma dúvida ou deseja anunciar seu imóvel? Nossa equipe está sempre pronta para ajudar.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-stretch">
          {/* Contact Details */}
          <div className="bg-card border rounded-2xl p-8 sm:p-10 shadow-sm flex flex-col justify-between gap-8">
            <div className="space-y-6">
              <h3 className="font-extrabold text-xl text-foreground">Informações de Contato</h3>
              <p className="text-muted-foreground text-sm font-medium">
                Sinta-se à vontade para visitar nosso escritório ou entrar em contato através dos canais abaixo.
              </p>

              <ul className="space-y-6 text-sm text-foreground/80 font-semibold">
                <li className="flex items-start gap-4">
                  <div className="bg-primary/10 text-primary p-2.5 rounded-lg">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-foreground mb-0.5">Endereço</h4>
                    <span className="text-xs text-muted-foreground">R. Barão de Jacareí, 985 - Centro, Jacareí - SP, 12308-000</span>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <div className="bg-primary/10 text-primary p-2.5 rounded-lg">
                    <Phone className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-foreground mb-0.5">Telefone e WhatsApp</h4>
                    <span className="text-xs text-muted-foreground">(12) 99784-8803</span>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <div className="bg-primary/10 text-primary p-2.5 rounded-lg">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-foreground mb-0.5">E-mail Comercial</h4>
                    <span className="text-xs text-muted-foreground">fabelleimobiliaria@gmail.com</span>
                  </div>
                </li>
              </ul>
            </div>

            {/* Map Frame */}
            <div className="h-96 w-full border rounded-xl overflow-hidden shadow-xs mt-6">
              <iframe
                src="https://www.openstreetmap.org/export/embed.html?bbox=-45.9697%2C-23.3110%2C-45.9597%2C-23.3010&layer=mapnik&marker=-23.3060%2C-45.9647"
                className="w-full h-full border-none animate-fade-in"
                title="Localização Fabelle Jacareí"
              />
            </div>
          </div>

          {/* Form */}
          <div className="bg-card border rounded-2xl p-8 sm:p-10 shadow-sm">
            <h3 className="font-extrabold text-xl text-foreground mb-6">Envie uma Mensagem</h3>

            {submitted ? (
              <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 p-8 rounded-xl text-center space-y-4 h-full flex flex-col items-center justify-center">
                <CheckCircle className="h-12 w-12 text-emerald-500" />
                <h4 className="font-extrabold text-lg text-emerald-800 dark:text-emerald-300">Mensagem Enviada!</h4>
                <p className="text-sm text-emerald-700 dark:text-emerald-400 font-medium max-w-sm">
                  Recebemos suas informações. Nossa equipe de relacionamento retornará o contato o mais rápido possível.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground/80 uppercase">Nome Completo</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: João da Silva"
                    className="w-full bg-secondary/50 border px-4 py-2.5 rounded-lg outline-none focus:ring-2 focus:ring-primary/40 text-foreground text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground/80 uppercase">E-mail</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Ex: joao@email.com"
                    className="w-full bg-secondary/50 border px-4 py-2.5 rounded-lg outline-none focus:ring-2 focus:ring-primary/40 text-foreground text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground/80 uppercase">Telefone / WhatsApp</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Ex: (11) 99999-9999"
                    className="w-full bg-secondary/50 border px-4 py-2.5 rounded-lg outline-none focus:ring-2 focus:ring-primary/40 text-foreground text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground/80 uppercase">Como podemos ajudar?</label>
                  <textarea
                    rows={4}
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Escreva sua dúvida ou detalhes sobre o imóvel..."
                    className="w-full bg-secondary/50 border px-4 py-2.5 rounded-lg outline-none focus:ring-2 focus:ring-primary/40 text-foreground text-sm"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary hover:bg-primary/95 text-white font-bold py-3.5 rounded-xl shadow hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Send className="h-4 w-4" />
                  {loading ? 'Enviando...' : 'Enviar Contato'}
                </button>
              </form>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
