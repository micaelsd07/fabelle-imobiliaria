'use client';

import React, { useState } from 'react';
import { QueryClient, QueryClientProvider, keepPreviousData } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60_000, // 5 min — revisitar página usa cache (instantâneo)
            gcTime: 30 * 60_000, // mantém dados em memória por 30 min
            retry: 1,
            refetchOnWindowFocus: false,
            // Mostra os dados anteriores enquanto recarrega, em vez de spinner.
            placeholderData: keepPreviousData,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={client}>
      {children}
      {process.env.NODE_ENV !== 'production' && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
}
