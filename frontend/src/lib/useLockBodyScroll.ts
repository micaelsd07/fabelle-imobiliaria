'use client';

import { useEffect } from 'react';

/**
 * Trava o scroll do <body> enquanto `locked` for true.
 * Evita "scroll bleeding" — a página de trás rolando quando você
 * chega no fim do scroll de um modal.
 *
 * Compensa a largura da scrollbar pra a página não "pular".
 */
export function useLockBodyScroll(locked: boolean) {
  useEffect(() => {
    if (!locked) return;

    const body = document.body;
    const prevOverflow = body.style.overflow;
    const prevPaddingRight = body.style.paddingRight;

    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

    body.style.overflow = 'hidden';
    if (scrollbarWidth > 0) {
      body.style.paddingRight = `${scrollbarWidth}px`;
    }

    return () => {
      body.style.overflow = prevOverflow;
      body.style.paddingRight = prevPaddingRight;
    };
  }, [locked]);
}
