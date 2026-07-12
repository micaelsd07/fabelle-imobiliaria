import type { Metadata } from "next";
import "./globals.css";
import { AppProvider } from "@/context/AppContext";
import { QueryProvider } from "@/context/QueryProvider";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "Fabelle Imobiliária | CRM Premium & Portal de Imóveis",
  description: "O sistema completo para gestão de imóveis, clientes, corretores, contratos e funil de vendas. Premium CRM Fabelle.",
  keywords: ["imobiliaria", "crm", "imoveis", "sao paulo", "fabelle", "corretor", "venda", "aluguel"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="h-full antialiased">
      <head>
        {/* Leaflet map styles */}
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
          crossOrigin=""
        />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground transition-colors duration-300">
        <QueryProvider>
          <AppProvider>
            {children}
            <Toaster
              position="top-right"
              richColors
              closeButton
              expand
              toastOptions={{ style: { fontFamily: 'inherit' } }}
            />
          </AppProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
