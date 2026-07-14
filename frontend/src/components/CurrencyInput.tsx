'use client';

import React, { useState, useEffect } from 'react';

interface Props {
  value: number;
  onChange: (n: number) => void;
  placeholder?: string;
  className?: string;
  required?: boolean;
  disabled?: boolean;
}

const onlyDigits = (s: string) => s.replace(/\D/g, '');

function format(n: number): string {
  if (!isFinite(n) || n === 0) return '';
  return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

/**
 * Input de moeda BR. Guarda `number` no state pai; exibe `R$ 1.234,56`.
 * Digitação parece um caixa: cada dígito vai pros centavos, casas rolam pra esquerda.
 */
export function CurrencyInput({
  value,
  onChange,
  placeholder = 'R$ 0,00',
  className = 'modal-input',
  required,
  disabled,
}: Props) {
  const [display, setDisplay] = useState<string>(value ? format(value) : '');

  useEffect(() => {
    // Sincroniza quando o pai zera ou muda (ex: abrir modal de edição)
    setDisplay(value ? format(value) : '');
  }, [value]);

  return (
    <input
      type="text"
      inputMode="numeric"
      required={required}
      disabled={disabled}
      value={display}
      placeholder={placeholder}
      className={className}
      onChange={(e) => {
        const digits = onlyDigits(e.target.value);
        const n = digits ? Number(digits) / 100 : 0;
        setDisplay(digits ? format(n) : '');
        onChange(n);
      }}
    />
  );
}
