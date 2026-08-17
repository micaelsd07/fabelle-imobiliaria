'use client';

import { useEffect, useRef, useState } from 'react';
import { Car, ImagePlus, Sparkles, UploadCloud, User, X } from 'lucide-react';
import { api, absoluteUrl } from '@/lib/api';
import { maskCep, maskCpf, maskCurrency, maskPhone, maskRg, parseCurrency } from '@/lib/masks';
import { useLockBodyScroll } from '@/lib/useLockBodyScroll';
import type { Property } from './types';
import { CIVIL_STATUS_OPTIONS, SPOUSE_REQUIRED_STATUSES } from './types';

interface Props {
  isOpen: boolean;
  property: Property | null;
  onClose: () => void;
  onSave: (payload: any) => void;
}

const DEFAULT_COVER =
  'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&q=80&w=600';
const MAX_IMAGES = 40;

const SAMPLE_URLS = [
  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=600',
  'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&q=80&w=600',
  'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?auto=format&fit=crop&q=80&w=600',
];

// Aplica uma máscara no valor do input SEM usar estado do React (input não-controlado).
const maskInPlace = (mask: (v: string) => string) => (e: React.ChangeEvent<HTMLInputElement>) => {
  e.target.value = mask(e.target.value);
};

export function PropertyForm({ isOpen, property, onClose, onSave }: Props) {
  // Só o que muda com pouca frequência fica em estado — digitar em texto NÃO re-renderiza.
  const [selectedImages, setSelectedImages] = useState<string[]>(
    property ? getExistingImages(property) : [DEFAULT_COVER],
  );
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [spouseVisible, setSpouseVisible] = useState<boolean>(
    property?.ownerCivilStatus ? SPOUSE_REQUIRED_STATUSES.includes(property.ownerCivilStatus) : false,
  );
  const newImageUrlRef = useRef<HTMLInputElement>(null);

  useLockBodyScroll(isOpen);

  // Reinicia galeria + seção do cônjuge sempre que o modal abre (o componente não desmonta ao fechar).
  useEffect(() => {
    if (!isOpen) return;
    setSelectedImages(property ? getExistingImages(property) : [DEFAULT_COVER]);
    setSpouseVisible(
      property?.ownerCivilStatus ? SPOUSE_REQUIRED_STATUSES.includes(property.ownerCivilStatus) : false,
    );
  }, [isOpen, property]);

  if (!isOpen) return null;

  // Valores iniciais (input não-controlado usa defaultValue; o componente remonta a cada abertura).
  const d = {
    title: property?.title ?? '',
    price: property?.price ? maskCurrency(property.price) : '',
    type: property?.type ?? 'VENDA',
    category: property?.category ?? 'APARTAMENTO',
    status: property?.status ?? 'DISPONIVEL',
    bedrooms: property?.bedrooms ?? 2,
    suites: property?.suites ?? 1,
    bathrooms: property?.bathrooms ?? 2,
    garageSlots: property?.garageSlots ?? 1,
    coveredGarage: property?.features?.toLowerCase().includes('garagem coberta') ?? false,
    areaTotal: property?.areaTotal ?? 100,
    areaConstruida: property?.areaConstruida ?? 80,
    features: property ? removeCoveredGarage(property.features) : 'Varanda, Piscina, Portaria 24h',
    address: property?.address ?? '',
    neighborhood: property?.neighborhood ?? '',
    city: property?.city ?? 'Sao Paulo',
    state: property?.state ?? 'SP',
    zipCode: property?.zipCode ?? '',
    description: property?.description ?? '',
    featured: property?.featured ?? false,
    ownerName: property?.ownerName ?? '',
    ownerCivilStatus: property?.ownerCivilStatus ?? 'Solteiro(a)',
    ownerCpf: property?.ownerCpf ?? '',
    ownerRg: property?.ownerRg ?? '',
    ownerPhone: property?.ownerPhone ?? '',
    ownerEmail: property?.ownerEmail ?? '',
    ownerAddress: property?.ownerAddress ?? '',
    ownerProfession: property?.ownerProfession ?? '',
    spouseName: property?.spouseName ?? '',
    spouseCpf: property?.spouseCpf ?? '',
    spousePhone: property?.spousePhone ?? '',
  };

  const appendImages = (images: string[]) => {
    setSelectedImages((current) => {
      const merged = [...current, ...images.filter((img) => img && !current.includes(img))];
      return merged.slice(0, MAX_IMAGES);
    });
  };

  const addSampleImage = () => {
    const url = SAMPLE_URLS[Math.floor(Math.random() * SAMPLE_URLS.length)];
    appendImages([url]);
  };

  const handleImageFiles = async (files: FileList | null) => {
    if (!files) return;
    setUploadError(null);
    const available = MAX_IMAGES - selectedImages.length;
    const imageFiles = Array.from(files)
      .filter((file) => file.type.startsWith('image/'))
      .slice(0, Math.max(available, 0));
    if (!imageFiles.length) return;
    setUploading(true);
    try {
      const { files: uploaded } = await api.uploadImages(imageFiles);
      appendImages(uploaded.map((u) => u.url));
    } catch (err: any) {
      setUploadError(err?.message || 'Falha ao enviar imagens.');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const get = (k: string) => ((fd.get(k) as string | null) ?? '').trim();

    const civilStatus = get('ownerCivilStatus');
    const spouseOn = SPOUSE_REQUIRED_STATUSES.includes(civilStatus);
    const coveredGarage = fd.get('coveredGarage') === 'on';

    const cleanFeatures = removeCoveredGarage(get('features'))
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
    const finalFeatures = coveredGarage ? [...cleanFeatures, 'Garagem coberta'] : cleanFeatures;

    onSave({
      title: get('title'),
      description: get('description'),
      price: parseCurrency(get('price')).number,
      type: get('type'),
      category: get('category'),
      status: get('status'),
      areaTotal: parseFloat(get('areaTotal')) || 0,
      areaConstruida: parseFloat(get('areaConstruida')) || 0,
      bedrooms: parseInt(get('bedrooms')) || 0,
      suites: parseInt(get('suites')) || 0,
      bathrooms: parseInt(get('bathrooms')) || 0,
      garageSlots: parseInt(get('garageSlots')) || 0,
      address: get('address'),
      neighborhood: get('neighborhood'),
      city: get('city'),
      state: get('state'),
      zipCode: get('zipCode'),
      photos: selectedImages,
      features: finalFeatures.join(', '),
      featured: fd.get('featured') === 'on',

      ownerName: get('ownerName') || null,
      ownerCpf: get('ownerCpf') || null,
      ownerRg: get('ownerRg') || null,
      ownerPhone: get('ownerPhone') || null,
      ownerEmail: get('ownerEmail') || null,
      ownerAddress: get('ownerAddress') || null,
      ownerProfession: get('ownerProfession') || null,
      ownerCivilStatus: civilStatus,
      spouseName: spouseOn ? get('spouseName') || null : null,
      spouseCpf: spouseOn ? get('spouseCpf') || null : null,
      spousePhone: spouseOn ? get('spousePhone') || null : null,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/70" onClick={onClose}>
      <div className="bg-card text-card-foreground border rounded-2xl shadow-2xl max-w-5xl w-full max-h-[92vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="h-16 border-b flex items-center justify-between px-6 shrink-0">
          <h3 className="font-extrabold text-base flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            {property ? 'Editar Imovel' : 'Cadastrar Novo Imovel'}
          </h3>
          <button type="button" onClick={onClose} className="p-1.5 border rounded-lg hover:bg-secondary cursor-pointer" aria-label="Fechar">
            <X className="h-4.5 w-4.5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-grow overflow-y-auto p-6 space-y-6 text-xs font-semibold">
          <section className="space-y-4">
            <h4 className="text-[11px] font-black uppercase tracking-wider text-muted-foreground">Dados comerciais</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Field label="Titulo Comercial" className="md:col-span-2">
                <input type="text" name="title" required defaultValue={d.title} placeholder="Ex: Cobertura Duplex nos Jardins" className="modal-input" />
              </Field>
              <Field label="Preço">
                <input type="text" name="price" required inputMode="numeric" defaultValue={d.price} onChange={maskInPlace(maskCurrency)} placeholder="R$ 0,00" className="modal-input font-bold text-primary" />
              </Field>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Field label="Modalidade">
                <select name="type" defaultValue={d.type} className="modal-input cursor-pointer">
                  <option value="VENDA">Venda</option>
                  <option value="ALUGUEL">Aluguel</option>
                </select>
              </Field>
              <Field label="Categoria">
                <select name="category" defaultValue={d.category} className="modal-input cursor-pointer">
                  <option value="APARTAMENTO">Apartamento</option>
                  <option value="CASA">Casa</option>
                  <option value="COBERTURA">Cobertura</option>
                  <option value="SALA_COMERCIAL">Sala Comercial</option>
                  <option value="TERRENO">Terreno</option>
                </select>
              </Field>
              <Field label="Status">
                <select name="status" defaultValue={d.status} className="modal-input cursor-pointer">
                  <option value="DISPONIVEL">Disponivel</option>
                  <option value="ALUGADO">Alugado</option>
                  <option value="VENDIDO">Vendido</option>
                  <option value="ARQUIVADO">Arquivado</option>
                </select>
              </Field>
            </div>
          </section>

          <section className="space-y-4">
            <h4 className="text-[11px] font-black uppercase tracking-wider text-muted-foreground">Caracteristicas</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <NumberInput label="Quartos" name="bedrooms" defaultValue={d.bedrooms} />
              <NumberInput label="Suites" name="suites" defaultValue={d.suites} />
              <NumberInput label="Banheiros" name="bathrooms" defaultValue={d.bathrooms} />
              <NumberInput label="Vagas Garagem" name="garageSlots" defaultValue={d.garageSlots} />
            </div>
            <label className="flex items-center gap-3 rounded-xl border bg-secondary/20 px-4 py-3 text-xs font-bold uppercase text-foreground/85 cursor-pointer">
              <input type="checkbox" name="coveredGarage" defaultChecked={d.coveredGarage} className="h-4 w-4 rounded text-primary focus:ring-primary" />
              <Car className="h-4 w-4 text-primary" />
              Garagem coberta
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <NumberInput label="Area Total (m2)" name="areaTotal" defaultValue={d.areaTotal} float />
              <NumberInput label="Area Construida (m2)" name="areaConstruida" defaultValue={d.areaConstruida} float />
              <Field label="Diferenciais (virgula)">
                <input type="text" name="features" defaultValue={d.features} placeholder="Varanda, Piscina..." className="modal-input" />
              </Field>
            </div>
          </section>

          <section className="space-y-4">
            <h4 className="text-[11px] font-black uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <User className="h-4 w-4 text-primary" />
              Locador (proprietário do imóvel)
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Field label="Nome completo" className="md:col-span-2">
                <input type="text" name="ownerName" defaultValue={d.ownerName} placeholder="Nome do proprietário" className="modal-input" />
              </Field>
              <Field label="Estado civil">
                <select
                  name="ownerCivilStatus"
                  defaultValue={d.ownerCivilStatus}
                  onChange={(e) => setSpouseVisible(SPOUSE_REQUIRED_STATUSES.includes(e.target.value))}
                  className="modal-input cursor-pointer"
                >
                  {CIVIL_STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </Field>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Field label="CPF">
                <input type="text" name="ownerCpf" defaultValue={d.ownerCpf} onChange={maskInPlace(maskCpf)} placeholder="000.000.000-00" className="modal-input" inputMode="numeric" />
              </Field>
              <Field label="RG">
                <input type="text" name="ownerRg" defaultValue={d.ownerRg} onChange={maskInPlace(maskRg)} placeholder="00.000.000-0" className="modal-input" inputMode="numeric" />
              </Field>
              <Field label="Telefone / WhatsApp">
                <input type="text" name="ownerPhone" defaultValue={d.ownerPhone} onChange={maskInPlace(maskPhone)} placeholder="(00) 00000-0000" className="modal-input" inputMode="numeric" />
              </Field>
              <Field label="E-mail">
                <input type="email" name="ownerEmail" defaultValue={d.ownerEmail} placeholder="proprietario@email.com" className="modal-input" />
              </Field>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Endereço do locador">
                <input type="text" name="ownerAddress" defaultValue={d.ownerAddress} placeholder="Rua, número, cidade" className="modal-input" />
              </Field>
              <Field label="Profissão">
                <input type="text" name="ownerProfession" defaultValue={d.ownerProfession} placeholder="Ex: Empresário" className="modal-input" />
              </Field>
            </div>

            {spouseVisible && (
              <div className="mt-2 rounded-xl border border-primary/30 bg-primary/5 p-4 space-y-4">
                <h5 className="text-[10px] font-black uppercase tracking-wider text-primary flex items-center gap-2">
                  <User className="h-3.5 w-3.5" />
                  Dados do cônjuge
                </h5>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Field label="Nome do cônjuge">
                    <input type="text" name="spouseName" defaultValue={d.spouseName} placeholder="Nome completo" className="modal-input" />
                  </Field>
                  <Field label="CPF do cônjuge">
                    <input type="text" name="spouseCpf" defaultValue={d.spouseCpf} onChange={maskInPlace(maskCpf)} placeholder="000.000.000-00" className="modal-input" inputMode="numeric" />
                  </Field>
                  <Field label="Telefone do cônjuge">
                    <input type="text" name="spousePhone" defaultValue={d.spousePhone} onChange={maskInPlace(maskPhone)} placeholder="(00) 00000-0000" className="modal-input" inputMode="numeric" />
                  </Field>
                </div>
              </div>
            )}
          </section>

          <section className="space-y-4">
            <h4 className="text-[11px] font-black uppercase tracking-wider text-muted-foreground">Endereço do imóvel e descrição</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Field label="Endereco Completo" className="md:col-span-2">
                <input type="text" name="address" required defaultValue={d.address} placeholder="Rua, numero, complemento" className="modal-input" />
              </Field>
              <Field label="Bairro">
                <input type="text" name="neighborhood" required defaultValue={d.neighborhood} placeholder="Bairro" className="modal-input" />
              </Field>
              <Field label="Cidade">
                <input type="text" name="city" required defaultValue={d.city} placeholder="Cidade" className="modal-input" />
              </Field>
              <Field label="Estado">
                <input type="text" name="state" required defaultValue={d.state} placeholder="UF" className="modal-input" />
              </Field>
              <Field label="CEP">
                <input type="text" name="zipCode" defaultValue={d.zipCode} onChange={maskInPlace(maskCep)} placeholder="00000-000" className="modal-input" inputMode="numeric" />
              </Field>
            </div>
            <Field label="Descricao detalhada">
              <textarea rows={3} name="description" required defaultValue={d.description} placeholder="Informacoes adicionais..." className="modal-input resize-y" />
            </Field>
          </section>

          <section className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <h4 className="text-[11px] font-black uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <ImagePlus className="h-4 w-4 text-primary" /> Galeria de fotos
              </h4>
              <span className="text-[10px] text-muted-foreground font-bold">{selectedImages.length}/{MAX_IMAGES} imagens</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className={`border-2 border-dashed border-border hover:border-primary/50 hover:bg-primary/5 p-4 rounded-xl text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-1.5 ${uploading ? 'opacity-60 pointer-events-none' : ''}`}>
                <UploadCloud className="h-6 w-6 text-muted-foreground" />
                <span className="font-semibold text-[10px] text-foreground">
                  {uploading ? 'Enviando…' : 'Anexar imagens do computador'}
                </span>
                <span className="text-[9px] text-muted-foreground font-bold">JPG, PNG ou WEBP - ate 40 (max 8MB cada)</span>
                {uploadError && <span className="text-[9px] text-red-500 font-bold">{uploadError}</span>}
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  disabled={uploading}
                  onChange={(e) => { handleImageFiles(e.target.files); e.currentTarget.value = ''; }}
                />
              </label>
              <div className="border border-border p-4 rounded-xl flex flex-col justify-between gap-2 bg-secondary/15">
                <span className="text-[10px] text-muted-foreground uppercase font-bold">Colar links ou usar foto demo</span>
                <div className="flex gap-2">
                  <input ref={newImageUrlRef} type="text" placeholder="URL da imagem" className="flex-grow bg-background border border-border px-2.5 py-1.5 rounded-lg outline-none text-[11px] text-foreground" />
                  <button
                    type="button"
                    disabled={selectedImages.length >= MAX_IMAGES}
                    onClick={() => {
                      const raw = newImageUrlRef.current?.value.trim();
                      if (raw) {
                        appendImages(raw.split(',').map((u) => u.trim()).filter(Boolean));
                        if (newImageUrlRef.current) newImageUrlRef.current.value = '';
                      }
                    }}
                    className="bg-primary hover:bg-primary/95 text-white font-bold px-3 py-1.5 rounded-lg text-[10px] uppercase cursor-pointer disabled:opacity-40"
                  >
                    Anexar
                  </button>
                </div>
                <button type="button" onClick={addSampleImage} disabled={selectedImages.length >= MAX_IMAGES} className="border border-dashed border-border hover:border-primary/60 hover:text-primary rounded-lg py-1.5 text-[10px] font-black uppercase transition-colors disabled:opacity-40">
                  Adicionar foto demo
                </button>
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              {selectedImages.map((img, idx) => (
                <div key={`${img}-${idx}`} className="relative h-16 w-20 rounded-lg overflow-hidden border group shadow-xs">
                  <img src={absoluteUrl(img)} alt={`Preview ${idx + 1}`} className="h-full w-full object-cover" />
                  <button type="button" onClick={() => setSelectedImages(selectedImages.filter((_, i) => i !== idx))} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 cursor-pointer" aria-label="Remover imagem">
                    <X className="h-2.5 w-2.5" />
                  </button>
                  {idx === 0 && <div className="absolute bottom-0 left-0 w-full bg-primary text-white text-[8px] font-extrabold text-center py-0.5 uppercase tracking-wide">Capa</div>}
                </div>
              ))}
            </div>
          </section>

          <label className="flex items-center gap-3 border-t pt-4">
            <input type="checkbox" name="featured" defaultChecked={d.featured} className="h-4 w-4 rounded text-primary focus:ring-primary cursor-pointer" />
            <span className="text-foreground/85 uppercase cursor-pointer select-none">Destacar este imovel na homepage do site</span>
          </label>

          <div className="flex justify-end gap-3 pt-4 border-t shrink-0">
            <button type="button" onClick={onClose} className="border px-5 py-2 rounded-xl font-bold hover:bg-secondary cursor-pointer">Cancelar</button>
            <button type="submit" className="bg-primary hover:bg-primary/95 text-white font-bold px-6 py-2 rounded-xl shadow cursor-pointer">Salvar Registro</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({ label, className = '', children }: { label: string; className?: string; children: React.ReactNode }) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      <label className="text-foreground/85 uppercase">{label}</label>
      {children}
    </div>
  );
}

function NumberInput({ label, name, defaultValue, float }: { label: string; name: string; defaultValue: number; float?: boolean }) {
  return (
    <Field label={label}>
      <input type="number" name={name} defaultValue={defaultValue} step={float ? '0.01' : '1'} className="modal-input" />
    </Field>
  );
}

function getExistingImages(property: Property): string[] {
  const related = Array.isArray(property.photoItems) ? property.photoItems.map((photo) => photo.url).filter(Boolean) : [];
  if (related.length > 0) return related.slice(0, MAX_IMAGES);
  return property.photos ? property.photos.split(',').map((photo) => photo.trim()).filter(Boolean).slice(0, MAX_IMAGES) : [DEFAULT_COVER];
}

function removeCoveredGarage(value: string) {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter((item) => item && item.toLowerCase() !== 'garagem coberta')
    .join(', ');
}
