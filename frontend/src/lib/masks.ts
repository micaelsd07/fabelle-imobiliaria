/**
 * Máscaras leves para inputs BR — CPF, telefone, CEP, dinheiro.
 * Uso: `<input value={maskCpf(cpf)} onChange={(e) => setCpf(unmaskDigits(e.target.value))} />`
 * O valor guardado no state fica só com dígitos (limpo), o display formatado.
 */

const onlyDigits = (s: string) => s.replace(/\D/g, '');

export const unmaskDigits = onlyDigits;

/** 000.000.000-00 */
export function maskCpf(value: string): string {
  const d = onlyDigits(value).slice(0, 11);
  if (d.length <= 3) return d;
  if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`;
  if (d.length <= 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`;
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
}

/** 00.000.000-0 (RG SP; mantém formato flexível) */
export function maskRg(value: string): string {
  const d = value.replace(/[^0-9Xx]/g, '').slice(0, 9);
  if (d.length <= 2) return d;
  if (d.length <= 5) return `${d.slice(0, 2)}.${d.slice(2)}`;
  if (d.length <= 8) return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5)}`;
  return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}-${d.slice(8)}`;
}

/** (00) 00000-0000 ou (00) 0000-0000 */
export function maskPhone(value: string): string {
  const d = onlyDigits(value).slice(0, 11);
  if (d.length === 0) return '';
  if (d.length <= 2) return `(${d}`;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

/** 00000-000 */
export function maskCep(value: string): string {
  const d = onlyDigits(value).slice(0, 8);
  if (d.length <= 5) return d;
  return `${d.slice(0, 5)}-${d.slice(5)}`;
}

/** R$ 0,00 — para exibição / input de dinheiro. */
export function maskCurrency(value: number | string): string {
  const n = typeof value === 'string'
    ? Number(onlyDigits(value)) / 100
    : value;
  if (isNaN(n)) return '';
  return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

/** Ao editar um input de moeda: retorna o número (float) e a string mascarada. */
export function parseCurrency(raw: string): { number: number; display: string } {
  const digits = onlyDigits(raw);
  const number = Number(digits) / 100;
  return { number, display: maskCurrency(number) };
}
