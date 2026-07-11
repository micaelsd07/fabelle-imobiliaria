'use client';

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export type ColumnDef<T> = {
  header: string;
  accessor: (row: T) => string | number;
};

/** Escapa um campo pro formato CSV RFC 4180 (aspas duplas + escape). */
function csvField(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return '';
  const s = String(value);
  if (/["\n,;\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function timestamp() {
  const d = new Date();
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}_${pad(d.getHours())}${pad(d.getMinutes())}`;
}

function download(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function exportCSV<T>(rows: T[], columns: ColumnDef<T>[], baseName: string) {
  const header = columns.map((c) => csvField(c.header)).join(',');
  const body = rows
    .map((row) => columns.map((c) => csvField(c.accessor(row))).join(','))
    .join('\r\n');
  const csv = '﻿' + header + '\r\n' + body; // BOM pra Excel abrir com UTF-8
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  download(blob, `${baseName}_${timestamp()}.csv`);
}

export function exportPDF<T>(
  rows: T[],
  columns: ColumnDef<T>[],
  opts: { baseName: string; title: string; subtitle?: string },
) {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });

  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Fabelle Imobiliária', 40, 40);

  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(opts.title, 40, 60);

  if (opts.subtitle) {
    doc.setFontSize(9);
    doc.setTextColor(120);
    doc.text(opts.subtitle, 40, 76);
    doc.setTextColor(0);
  }

  autoTable(doc, {
    startY: 90,
    head: [columns.map((c) => c.header)],
    body: rows.map((r) => columns.map((c) => String(c.accessor(r) ?? ''))),
    styles: { fontSize: 8, cellPadding: 6 },
    headStyles: { fillColor: [37, 99, 235], textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [245, 247, 250] },
    margin: { left: 40, right: 40 },
  });

  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    const pageHeight = doc.internal.pageSize.getHeight();
    doc.setFontSize(8);
    doc.setTextColor(140);
    doc.text(
      `Gerado em ${new Date().toLocaleString('pt-BR')}   •   Página ${i}/${pageCount}`,
      40,
      pageHeight - 20,
    );
  }

  doc.save(`${opts.baseName}_${timestamp()}.pdf`);
}

/** Helper: formatar BRL. */
export const fmtBRL = (n: number) =>
  (n ?? 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

/** Helper: formatar data ISO -> dd/mm/yyyy. */
export const fmtDate = (iso: string | Date) => {
  if (!iso) return '';
  const d = typeof iso === 'string' ? new Date(iso) : iso;
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('pt-BR');
};
