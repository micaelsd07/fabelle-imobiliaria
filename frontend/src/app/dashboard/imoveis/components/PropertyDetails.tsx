'use client';

import { Building2, MapPin, User, X } from 'lucide-react';
import { getPropertyPhotos } from '@/components/PropertyImageCarousel';
import { useLockBodyScroll } from '@/lib/useLockBodyScroll';
import type { Property } from './types';
import { SPOUSE_REQUIRED_STATUSES } from './types';

interface Props {
  property: Property | null;
  onClose: () => void;
}

const fmtBRL = (n?: number | null) =>
  (n ?? 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const emptyDash = (v?: string | null) => (v && v.trim() ? v : '—');

export function PropertyDetails({ property, onClose }: Props) {
  useLockBodyScroll(!!property);
  if (!property) return null;
  const photos = getPropertyPhotos(property);
  const spouseVisible = property.ownerCivilStatus
    ? SPOUSE_REQUIRED_STATUSES.includes(property.ownerCivilStatus)
    : false;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/60 backdrop-blur-xs">
      <div className="bg-card text-card-foreground border rounded-2xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col animate-in scale-in duration-200">
        <div className="h-16 border-b flex items-center justify-between px-6 shrink-0">
          <h3 className="font-extrabold text-base flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            {property.code} — {property.title}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 border rounded-lg hover:bg-secondary cursor-pointer"
            aria-label="Fechar"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        </div>

        <div className="flex-grow overflow-y-auto p-6 space-y-6 text-sm">
          {photos[0] && (
            <img
              src={photos[0]}
              alt={property.title}
              className="w-full h-52 object-cover rounded-xl border"
            />
          )}

          <Section title="Comercial">
            <Grid>
              <Info label="Modalidade" value={property.type} />
              <Info label="Categoria" value={property.category} />
              <Info label="Status" value={property.status} />
              <Info
                label="Preço"
                value={
                  fmtBRL(property.price) +
                  (property.type === 'ALUGUEL' ? ' /mês' : '')
                }
                highlight
              />
            </Grid>
          </Section>

          <Section title="Características">
            <Grid cols={4}>
              <Info label="Quartos" value={property.bedrooms} />
              <Info label="Suítes" value={property.suites} />
              <Info label="Banheiros" value={property.bathrooms} />
              <Info label="Vagas" value={property.garageSlots} />
              <Info label="Área total" value={`${property.areaTotal} m²`} />
              <Info label="Área construída" value={`${property.areaConstruida} m²`} />
              <Info label="Condomínio" value={property.condoFee ? fmtBRL(property.condoFee) : '—'} />
              <Info label="IPTU" value={property.iptu ? fmtBRL(property.iptu) : '—'} />
            </Grid>
            {property.features && (
              <p className="text-xs text-muted-foreground pt-2">
                <span className="font-bold text-foreground/80">Diferenciais:</span>{' '}
                {property.features}
              </p>
            )}
          </Section>

          <Section title="Endereço" icon={<MapPin className="h-4 w-4 text-primary" />}>
            <Grid>
              <Info label="Endereço" value={property.address} />
              <Info label="Bairro" value={property.neighborhood} />
              <Info label="Cidade" value={property.city} />
              <Info label="Estado" value={property.state} />
              <Info label="CEP" value={property.zipCode || '—'} />
            </Grid>
            {property.description && (
              <p className="text-xs text-muted-foreground pt-2 leading-relaxed">
                {property.description}
              </p>
            )}
          </Section>

          <Section title="Locador (proprietário)" icon={<User className="h-4 w-4 text-primary" />}>
            <Grid>
              <Info label="Nome" value={emptyDash(property.ownerName)} />
              <Info label="Estado civil" value={emptyDash(property.ownerCivilStatus)} />
              <Info label="CPF" value={emptyDash(property.ownerCpf)} />
              <Info label="RG" value={emptyDash(property.ownerRg)} />
              <Info label="Telefone / WhatsApp" value={emptyDash(property.ownerPhone)} />
              <Info label="E-mail" value={emptyDash(property.ownerEmail)} />
              <Info label="Endereço" value={emptyDash(property.ownerAddress)} />
              <Info label="Profissão" value={emptyDash(property.ownerProfession)} />
            </Grid>

            {spouseVisible && (
              <div className="mt-4 rounded-xl border border-primary/30 bg-primary/5 p-4">
                <h5 className="text-[10px] font-black uppercase tracking-wider text-primary flex items-center gap-2 mb-3">
                  <User className="h-3.5 w-3.5" /> Cônjuge
                </h5>
                <Grid cols={3}>
                  <Info label="Nome" value={emptyDash(property.spouseName)} />
                  <Info label="CPF" value={emptyDash(property.spouseCpf)} />
                  <Info label="Telefone" value={emptyDash(property.spousePhone)} />
                </Grid>
              </div>
            )}
          </Section>
        </div>

        <div className="border-t p-4 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="border px-5 py-2 rounded-xl font-bold hover:bg-secondary cursor-pointer text-xs"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}

function Section({
  title,
  icon,
  children,
}: {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-3">
      <h4 className="text-[11px] font-black uppercase tracking-wider text-muted-foreground flex items-center gap-2">
        {icon}
        {title}
      </h4>
      {children}
    </div>
  );
}

function Grid({ cols = 2, children }: { cols?: 2 | 3 | 4; children: React.ReactNode }) {
  const cls = cols === 4 ? 'md:grid-cols-4' : cols === 3 ? 'md:grid-cols-3' : 'md:grid-cols-2';
  return <div className={`grid grid-cols-2 ${cls} gap-3`}>{children}</div>;
}

function Info({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string | number | null | undefined;
  highlight?: boolean;
}) {
  return (
    <div className="space-y-0.5">
      <span className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground block">
        {label}
      </span>
      <span
        className={
          highlight
            ? 'text-primary font-black text-base'
            : 'text-foreground font-semibold text-xs break-words'
        }
      >
        {value ?? '—'}
      </span>
    </div>
  );
}
