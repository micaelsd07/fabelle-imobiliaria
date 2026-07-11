'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Calculator, DollarSign, Calendar, Percent, ShieldAlert, FileText, CheckCircle } from 'lucide-react';

export default function PropertySimulator() {
  const [propertyValue, setPropertyValue] = useState<number>(350000);
  const [downPayment, setDownPayment] = useState<number>(70000); // 20% default
  const [interestRate, setInterestRate] = useState<number>(9.5); // Annual
  const [years, setYears] = useState<number>(30);
  const [system, setSystem] = useState<'SAC' | 'PRICE'>('SAC');

  // Results state
  const [financedAmount, setFinancedAmount] = useState<number>(0);
  const [firstInstallment, setFirstInstallment] = useState<number>(0);
  const [lastInstallment, setLastInstallment] = useState<number>(0);
  const [totalPaid, setTotalPaid] = useState<number>(0);
  const [requiredIncome, setRequiredIncome] = useState<number>(0);

  // Validate and update down payment min requirement
  useEffect(() => {
    const minDownPayment = propertyValue * 0.2;
    if (downPayment < minDownPayment) {
      setDownPayment(Math.round(minDownPayment));
    }
  }, [propertyValue]);

  // Recalculate financing plan
  useEffect(() => {
    const financed = propertyValue - downPayment;
    setFinancedAmount(financed);

    if (financed <= 0) {
      setFirstInstallment(0);
      setLastInstallment(0);
      setTotalPaid(0);
      setRequiredIncome(0);
      return;
    }

    const months = years * 12;
    const monthlyRate = interestRate / 100 / 12;

    if (system === 'SAC') {
      // SAC: Constant amortization, decreasing interest
      const amortization = financed / months;
      
      // First installment: Amortization + First Month Interest
      const firstInterest = financed * monthlyRate;
      const first = amortization + firstInterest;
      setFirstInstallment(first);

      // Last installment: Amortization + Last Month Interest (interest on 1 month amortization)
      const lastInterest = amortization * monthlyRate;
      const last = amortization + lastInterest;
      setLastInstallment(last);

      // Total Paid under SAC: Sum of all installments
      // Total Interest = financed * monthlyRate * (months + 1) / 2
      const totalInterest = financed * monthlyRate * (months + 1) / 2;
      const total = financed + totalInterest;
      setTotalPaid(total);

      // Required Income: installment should be max 30% of income
      setRequiredIncome(first / 0.3);
    } else {
      // PRICE: Constant installments
      // PMT = financed * [i * (1+i)^n] / [(1+i)^n - 1]
      let pmt = 0;
      if (monthlyRate === 0) {
        pmt = financed / months;
      } else {
        pmt = (financed * monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);
      }
      setFirstInstallment(pmt);
      setLastInstallment(pmt);

      const total = pmt * months;
      setTotalPaid(total);

      // Required Income: installment should be max 30% of income
      setRequiredIncome(pmt / 0.3);
    }
  }, [propertyValue, downPayment, interestRate, years, system]);

  const minDownPayment = propertyValue * 0.2;

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />

      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20 space-y-12">
        {/* Intro */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="bg-primary/10 text-primary font-bold text-xs px-3.5 py-1.5 rounded-full uppercase tracking-wider">
            Simulação de Financiamento
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-foreground tracking-tight leading-tight">
            Simulador de Imóveis Fabelle
          </h1>
          <p className="text-muted-foreground text-sm leading-relaxed font-semibold">
            Descubra as parcelas mensais estimadas, o valor total financiado e a renda recomendada para adquirir o imóvel dos seus sonhos de forma transparente e imediata.
          </p>
        </div>

        {/* Simulator Core Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Controls Form */}
          <div className="lg:col-span-7 bg-card border border-neutral-900 rounded-2xl p-6 sm:p-8 space-y-6 shadow-lg">
            <h3 className="font-extrabold text-lg text-foreground flex items-center gap-2 border-b border-neutral-900 pb-3">
              <Calculator className="h-5 w-5 text-primary" />
              Parâmetros de Simulação
            </h3>

            {/* Parameter: Property Value */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider text-muted-foreground">
                <span>Valor do Imóvel</span>
                <span className="text-primary text-sm font-black">
                  {propertyValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </span>
              </div>
              <input
                type="range"
                min={50000}
                max={5000000}
                step={10000}
                value={propertyValue}
                onChange={(e) => setPropertyValue(parseInt(e.target.value))}
                className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
              />
              <div className="flex justify-between text-[10px] text-muted-foreground font-semibold">
                <span>R$ 50 mil</span>
                <span>R$ 5 milhões</span>
              </div>
            </div>

            {/* Parameter: Down Payment */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider text-muted-foreground">
                <span>Valor de Entrada (Mín. 20%)</span>
                <span className="text-primary text-sm font-black">
                  {downPayment.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </span>
              </div>
              <input
                type="range"
                min={minDownPayment}
                max={propertyValue}
                step={5000}
                value={downPayment}
                onChange={(e) => setDownPayment(parseInt(e.target.value))}
                className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
              />
              <div className="flex justify-between text-[10px] text-muted-foreground font-semibold">
                <span>Mín: {minDownPayment.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} (20%)</span>
                <span>Max: {propertyValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
              </div>
            </div>

            {/* Grid for rate and duration */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Duration (Years) */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  <span>Prazo em Anos</span>
                  <span className="text-foreground font-extrabold">{years} anos ({years * 12} meses)</span>
                </div>
                <input
                  type="range"
                  min={5}
                  max={35}
                  step={1}
                  value={years}
                  onChange={(e) => setYears(parseInt(e.target.value))}
                  className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
                />
                <div className="flex justify-between text-[10px] text-muted-foreground font-semibold">
                  <span>5 anos</span>
                  <span>35 anos</span>
                </div>
              </div>

              {/* Interest Rate */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  <span>Taxa de Juros Anual</span>
                  <span className="text-foreground font-extrabold">{interestRate}% a.a.</span>
                </div>
                <input
                  type="range"
                  min={4.5}
                  max={15.0}
                  step={0.1}
                  value={interestRate}
                  onChange={(e) => setInterestRate(parseFloat(e.target.value))}
                  className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
                />
                <div className="flex justify-between text-[10px] text-muted-foreground font-semibold">
                  <span>4.5%</span>
                  <span>15.0%</span>
                </div>
              </div>
            </div>

            {/* Amortization System */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">Sistema de Amortização</label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setSystem('SAC')}
                  className={`py-3 px-4 rounded-xl border text-center font-bold text-sm cursor-pointer transition-all ${
                    system === 'SAC'
                      ? 'bg-primary text-white border-primary shadow-md'
                      : 'bg-secondary/40 text-muted-foreground border-border hover:bg-secondary/70'
                  }`}
                >
                  SAC (Parcelas Decrescentes)
                </button>
                <button
                  type="button"
                  onClick={() => setSystem('PRICE')}
                  className={`py-3 px-4 rounded-xl border text-center font-bold text-sm cursor-pointer transition-all ${
                    system === 'PRICE'
                      ? 'bg-primary text-white border-primary shadow-md'
                      : 'bg-secondary/40 text-muted-foreground border-border hover:bg-secondary/70'
                  }`}
                >
                  PRICE (Parcelas Fixas)
                </button>
              </div>
              <p className="text-[10px] text-muted-foreground leading-normal font-semibold">
                {system === 'SAC'
                  ? 'No sistema SAC, a amortização do valor financiado é igual todo mês, e o valor dos juros diminui, resultando em prestações que começam mais altas e terminam mais baixas.'
                  : 'No sistema PRICE, as prestações mensais são fixas do início ao fim do financiamento. A amortização cresce ao longo dos meses e os juros diminuem.'}
              </p>
            </div>
          </div>

          {/* Results Summary Box */}
          <div className="lg:col-span-5 space-y-6">
            {/* Main stats card */}
            <div className="bg-card border border-neutral-900 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-primary/10 text-primary text-[9px] font-extrabold px-3 py-1 rounded-bl-xl uppercase tracking-widest">
                Orçamento Estimado
              </div>
              <h3 className="font-extrabold text-lg text-foreground flex items-center gap-2 border-b border-neutral-900 pb-3">
                <FileText className="h-5 w-5 text-primary" />
                Resumo da Simulação
              </h3>

              <div className="space-y-4">
                {/* Val Financiado */}
                <div className="flex justify-between items-center py-2 border-b border-neutral-900">
                  <span className="text-xs text-muted-foreground font-semibold">Valor Financiado</span>
                  <span className="text-sm font-extrabold text-foreground">
                    {financedAmount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </span>
                </div>

                {/* Parcela Inicial */}
                <div className="flex justify-between items-center py-2 border-b border-neutral-900">
                  <span className="text-xs text-muted-foreground font-semibold">
                    {system === 'SAC' ? 'Primeira Parcela' : 'Parcela Mensal Fixa'}
                  </span>
                  <span className="text-lg font-black text-primary">
                    {firstInstallment.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </span>
                </div>

                {/* Parcela Final for SAC */}
                {system === 'SAC' && (
                  <div className="flex justify-between items-center py-2 border-b border-neutral-900">
                    <span className="text-xs text-muted-foreground font-semibold">Última Parcela</span>
                    <span className="text-sm font-extrabold text-foreground">
                      {lastInstallment.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </span>
                  </div>
                )}

                {/* Renda Minima */}
                <div className="flex justify-between items-center py-2 border-b border-neutral-900">
                  <span className="text-xs text-muted-foreground font-semibold">Renda Familiar Recomendada</span>
                  <span className="text-sm font-extrabold text-foreground">
                    {requiredIncome.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </span>
                </div>

                {/* Total Pago */}
                <div className="flex justify-between items-center py-2">
                  <span className="text-xs text-muted-foreground font-semibold">Total a ser Pago</span>
                  <span className="text-sm font-extrabold text-foreground">
                    {totalPaid.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </span>
                </div>
              </div>

              {/* Alert notice */}
              <div className="bg-primary/5 border border-primary/20 p-4 rounded-xl flex gap-3 text-xs">
                <ShieldAlert className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div className="space-y-1 font-medium text-neutral-300">
                  <span className="font-extrabold text-foreground block">Aviso Importante</span>
                  <p className="leading-relaxed">
                    Esta simulação representa uma estimativa aproximada dos custos. Taxas adicionais como seguros, impostos municipais (ITBI) e despesas de cartório não estão inclusas nos valores informados.
                  </p>
                </div>
              </div>
            </div>

            {/* Action card */}
            <div className="bg-card border border-neutral-900 rounded-2xl p-6 space-y-4 shadow-lg text-center">
              <h4 className="font-extrabold text-base text-foreground">Gostou da simulação?</h4>
              <p className="text-xs text-muted-foreground font-semibold">
                Nossos corretores parceiros estão prontos para ajudar você a aprovar sua carta de crédito junto aos principais bancos.
              </p>
              <button
                type="button"
                onClick={() => {
                  window.location.href = '/#contato';
                }}
                className="w-full bg-primary hover:bg-primary/95 text-white font-bold py-3 rounded-xl shadow transition-colors flex items-center justify-center gap-2 cursor-pointer text-xs uppercase"
              >
                <CheckCircle className="h-4 w-4" />
                Enviar Simulação para Análise
              </button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
