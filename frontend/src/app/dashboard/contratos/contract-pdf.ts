'use client';

import jsPDF from 'jspdf';
import { fmtBRL, fmtDate } from '@/lib/export';

interface Contract {
  id: string;
  title: string;
  type: string;
  status: string;
  value: number;
  startDate: string;
  endDate: string;
  signatureStatus: string;
  clientSignature?: string;
  client: { id: string; name: string };
  property: { id: string; code: string; title: string; price: number };
  broker?: { id: string; name: string };
}

export function generateContractPDF(c: Contract) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
  const w = doc.internal.pageSize.getWidth();
  let y = 60;

  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('Fabelle Imobiliária', 40, y);
  y += 24;

  doc.setFontSize(14);
  doc.text(c.title, 40, y, { maxWidth: w - 80 });
  y += 30;

  const info: Array<[string, string]> = [
    ['Código', c.id.slice(0, 8).toUpperCase()],
    ['Modalidade', c.type],
    ['Status', c.status],
    ['Valor', fmtBRL(c.value)],
    ['Início', fmtDate(c.startDate)],
    ['Término', fmtDate(c.endDate)],
    ['Assinatura', c.signatureStatus],
  ];

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  for (const [label, value] of info) {
    doc.setFont('helvetica', 'bold');
    doc.text(`${label}:`, 40, y);
    doc.setFont('helvetica', 'normal');
    doc.text(value, 140, y);
    y += 18;
  }

  y += 10;
  doc.setDrawColor(200);
  doc.line(40, y, w - 40, y);
  y += 24;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('Partes envolvidas', 40, y);
  y += 20;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`Locatário/Comprador: ${c.client.name}`, 40, y); y += 18;
  doc.text(`Imóvel: ${c.property.title} (${c.property.code})`, 40, y); y += 18;
  if (c.broker) {
    doc.text(`Corretor responsável: ${c.broker.name}`, 40, y);
    y += 18;
  }

  y += 20;
  doc.setDrawColor(200);
  doc.line(40, y, w - 40, y);
  y += 30;

  if (c.clientSignature) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('Assinatura eletrônica', 40, y);
    y += 16;
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(9);
    doc.setTextColor(80);
    const wrapped = doc.splitTextToSize(c.clientSignature, w - 80);
    doc.text(wrapped, 40, y);
    y += wrapped.length * 12 + 12;
    doc.setTextColor(0);
  }

  const pageHeight = doc.internal.pageSize.getHeight();
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(140);
  doc.text(
    `Documento gerado em ${new Date().toLocaleString('pt-BR')} pelo sistema Fabelle CRM.`,
    40,
    pageHeight - 30,
  );

  doc.save(`contrato_${c.property.code || c.id.slice(0, 8)}.pdf`);
}
