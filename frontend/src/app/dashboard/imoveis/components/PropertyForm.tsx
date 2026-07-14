'use client';

import { useEffect, useState } from 'react';
import { Car, ImagePlus, Sparkles, UploadCloud, User, X } from 'lucide-react';
import { api, absoluteUrl } from '@/lib/api';
import { maskCep, maskCpf, maskPhone, maskRg } from '@/lib/masks';
import { CurrencyInput } from '@/components/CurrencyInput';
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

export function PropertyForm({ isOpen, property, onClose, onSave }: Props) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState(0);
  const [type, setType] = useState('VENDA');
  const [category, setCategory] = useState('APARTAMENTO');
  const [status, setStatus] = useState('DISPONIVEL');
  const [areaTotal, setAreaTotal] = useState(100);
  const [areaConstruida, setAreaConstruida] = useState(80);
  const [bedrooms, setBedrooms] = useState(2);
  const [suites, setSuites] = useState(1);
  const [bathrooms, setBathrooms] = useState(2);
  const [garageSlots, setGarageSlots] = useState(1);
  const [coveredGarage, setCoveredGarage] = useState(false);
  const [address, setAddress] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [city, setCity] = useState('Sao Paulo');
  const [state, setState] = useState('SP');
  const [zipCode, setZipCode] = useState('');
  const [features, setFeatures] = useState('Varanda, Piscina, Portaria 24h');
  const [featured, setFeatured] = useState(false);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Locador (dono do imóvel)
  const [ownerName, setOwnerName] = useState('');
  const [ownerCpf, setOwnerCpf] = useState('');
  const [ownerRg, setOwnerRg] = useState('');
  const [ownerPhone, setOwnerPhone] = useState('');
  const [ownerEmail, setOwnerEmail] = useState('');
  const [ownerAddress, setOwnerAddress] = useState('');
  const [ownerProfession, setOwnerProfession] = useState('');
  const [ownerCivilStatus, setOwnerCivilStatus] = useState('Solteiro(a)');
  const [spouseName, setSpouseName] = useState('');
  const [spouseCpf, setSpouseCpf] = useState('');
  const [spousePhone, setSpousePhone] = useState('');

  const spouseRequired = SPOUSE_REQUIRED_STATUSES.includes(ownerCivilStatus);

  useEffect(() => {
    if (!isOpen) return;
    if (property) {
      setTitle(property.title);
      setDescription(property.description);
      setPrice(property.price);
      setType(property.type);
      setCategory(property.category);
      setStatus(property.status);
      setAreaTotal(property.areaTotal);
      setAreaConstruida(property.areaConstruida);
      setBedrooms(property.bedrooms);
      setSuites(property.suites);
      setBathrooms(property.bathrooms);
      setGarageSlots(property.garageSlots);
      setCoveredGarage(property.features?.toLowerCase().includes('garagem coberta') ?? false);
      setAddress(property.address);
      setNeighborhood(property.neighborhood);
      setCity(property.city);
      setState(property.state);
      setZipCode(property.zipCode);
      setFeatures(removeCoveredGarage(property.features));
      setFeatured(property.featured);
      setSelectedImages(getExistingImages(property));
      setOwnerName(property.ownerName ?? '');
      setOwnerCpf(property.ownerCpf ?? '');
      setOwnerRg(property.ownerRg ?? '');
      setOwnerPhone(property.ownerPhone ?? '');
      setOwnerEmail(property.ownerEmail ?? '');
      setOwnerAddress(property.ownerAddress ?? '');
      setOwnerProfession(property.ownerProfession ?? '');
      setOwnerCivilStatus(property.ownerCivilStatus ?? 'Solteiro(a)');
      setSpouseName(property.spouseName ?? '');
      setSpouseCpf(property.spouseCpf ?? '');
      setSpousePhone(property.spousePhone ?? '');
    } else {
      setTitle('');
      setDescription('');
      setPrice(0);
      setType('VENDA');
      setCategory('APARTAMENTO');
      setStatus('DISPONIVEL');
      setAreaTotal(100);
      setAreaConstruida(80);
      setBedrooms(2);
      setSuites(1);
      setBathrooms(2);
      setGarageSlots(1);
      setCoveredGarage(false);
      setAddress('');
      setNeighborhood('');
      setCity('Sao Paulo');
      setState('SP');
      setZipCode('');
      setFeatures('Varanda, Piscina, Portaria 24h');
      setFeatured(false);
      setSelectedImages([DEFAULT_COVER]);
      setOwnerName('');
      setOwnerCpf('');
      setOwnerRg('');
      setOwnerPhone('');
      setOwnerEmail('');
      setOwnerAddress('');
      setOwnerProfession('');
      setOwnerCivilStatus('Solteiro(a)');
      setSpouseName('');
      setSpouseCpf('');
      setSpousePhone('');
    }
  }, [property, isOpen]);

  useLockBodyScroll(isOpen);

  if (!isOpen) return null;

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanFeatures = removeCoveredGarage(features)
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
    const finalFeatures = coveredGarage ? [...cleanFeatures, 'Garagem coberta'] : cleanFeatures;

    onSave({
      title,
      description,
      price: parseFloat(price.toString()),
      type,
      category,
      status,
      areaTotal: parseFloat(areaTotal.toString()),
      areaConstruida: parseFloat(areaConstruida.toString()),
      bedrooms: parseInt(bedrooms.toString()),
      suites: parseInt(suites.toString()),
      bathrooms: parseInt(bathrooms.toString()),
      garageSlots: parseInt(garageSlots.toString()),
      address,
      neighborhood,
      city,
      state,
      zipCode,
      photos: selectedImages,
      features: finalFeatures.join(', '),
      featured,

      ownerName: ownerName || null,
      ownerCpf: ownerCpf || null,
      ownerRg: ownerRg || null,
      ownerPhone: ownerPhone || null,
      ownerEmail: ownerEmail || null,
      ownerAddress: ownerAddress || null,
      ownerProfession: ownerProfession || null,
      ownerCivilStatus,
      // Só envia cônjuge se estado civil for casado/união estável, caso contrário zera
      spouseName: spouseRequired ? spouseName || null : null,
      spouseCpf: spouseRequired ? spouseCpf || null : null,
      spousePhone: spouseRequired ? spousePhone || null : null,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/60 backdrop-blur-xs">
      <div className="bg-card text-card-foreground border rounded-2xl shadow-2xl max-w-5xl w-full max-h-[92vh] flex flex-col animate-in scale-in duration-200">
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
                <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex: Cobertura Duplex nos Jardins" className="modal-input" />
              </Field>
              <Field label="Preço">
                <CurrencyInput required value={price} onChange={setPrice} className="modal-input font-bold text-primary" />
              </Field>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Field label="Modalidade">
                <select value={type} onChange={(e) => setType(e.target.value)} className="modal-input cursor-pointer">
                  <option value="VENDA">Venda</option>
                  <option value="ALUGUEL">Aluguel</option>
                </select>
              </Field>
              <Field label="Categoria">
                <select value={category} onChange={(e) => setCategory(e.target.value)} className="modal-input cursor-pointer">
                  <option value="APARTAMENTO">Apartamento</option>
                  <option value="CASA">Casa</option>
                  <option value="COBERTURA">Cobertura</option>
                  <option value="SALA_COMERCIAL">Sala Comercial</option>
                  <option value="TERRENO">Terreno</option>
                </select>
              </Field>
              <Field label="Status">
                <select value={status} onChange={(e) => setStatus(e.target.value)} className="modal-input cursor-pointer">
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
              <NumberInput label="Quartos" value={bedrooms} onChange={setBedrooms} />
              <NumberInput label="Suites" value={suites} onChange={setSuites} />
              <NumberInput label="Banheiros" value={bathrooms} onChange={setBathrooms} />
              <NumberInput label="Vagas Garagem" value={garageSlots} onChange={setGarageSlots} />
            </div>
            <label className="flex items-center gap-3 rounded-xl border bg-secondary/20 px-4 py-3 text-xs font-bold uppercase text-foreground/85 cursor-pointer">
              <input type="checkbox" checked={coveredGarage} onChange={(e) => setCoveredGarage(e.target.checked)} className="h-4 w-4 rounded text-primary focus:ring-primary" />
              <Car className="h-4 w-4 text-primary" />
              Garagem coberta
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <NumberInput label="Area Total (m2)" value={areaTotal} onChange={setAreaTotal} float />
              <NumberInput label="Area Construida (m2)" value={areaConstruida} onChange={setAreaConstruida} float />
              <Field label="Diferenciais (virgula)">
                <input type="text" value={features} onChange={(e) => setFeatures(e.target.value)} placeholder="Varanda, Piscina..." className="modal-input" />
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
                <input type="text" value={ownerName} onChange={(e) => setOwnerName(e.target.value)} placeholder="Nome do proprietário" className="modal-input" />
              </Field>
              <Field label="Estado civil">
                <select value={ownerCivilStatus} onChange={(e) => setOwnerCivilStatus(e.target.value)} className="modal-input cursor-pointer">
                  {CIVIL_STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </Field>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Field label="CPF">
                <input type="text" value={ownerCpf} onChange={(e) => setOwnerCpf(maskCpf(e.target.value))} placeholder="000.000.000-00" className="modal-input" inputMode="numeric" />
              </Field>
              <Field label="RG">
                <input type="text" value={ownerRg} onChange={(e) => setOwnerRg(maskRg(e.target.value))} placeholder="00.000.000-0" className="modal-input" inputMode="numeric" />
              </Field>
              <Field label="Telefone / WhatsApp">
                <input type="text" value={ownerPhone} onChange={(e) => setOwnerPhone(maskPhone(e.target.value))} placeholder="(00) 00000-0000" className="modal-input" inputMode="numeric" />
              </Field>
              <Field label="E-mail">
                <input type="email" value={ownerEmail} onChange={(e) => setOwnerEmail(e.target.value)} placeholder="proprietario@email.com" className="modal-input" />
              </Field>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Endereço do locador">
                <input type="text" value={ownerAddress} onChange={(e) => setOwnerAddress(e.target.value)} placeholder="Rua, número, cidade" className="modal-input" />
              </Field>
              <Field label="Profissão">
                <input type="text" value={ownerProfession} onChange={(e) => setOwnerProfession(e.target.value)} placeholder="Ex: Empresário" className="modal-input" />
              </Field>
            </div>

            {spouseRequired && (
              <div className="mt-2 rounded-xl border border-primary/30 bg-primary/5 p-4 space-y-4">
                <h5 className="text-[10px] font-black uppercase tracking-wider text-primary flex items-center gap-2">
                  <User className="h-3.5 w-3.5" />
                  Dados do cônjuge
                </h5>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Field label="Nome do cônjuge">
                    <input type="text" value={spouseName} onChange={(e) => setSpouseName(e.target.value)} placeholder="Nome completo" className="modal-input" />
                  </Field>
                  <Field label="CPF do cônjuge">
                    <input type="text" value={spouseCpf} onChange={(e) => setSpouseCpf(maskCpf(e.target.value))} placeholder="000.000.000-00" className="modal-input" inputMode="numeric" />
                  </Field>
                  <Field label="Telefone do cônjuge">
                    <input type="text" value={spousePhone} onChange={(e) => setSpousePhone(maskPhone(e.target.value))} placeholder="(00) 00000-0000" className="modal-input" inputMode="numeric" />
                  </Field>
                </div>
              </div>
            )}
          </section>

          <section className="space-y-4">
            <h4 className="text-[11px] font-black uppercase tracking-wider text-muted-foreground">Endereço do imóvel e descrição</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Field label="Endereco Completo" className="md:col-span-2">
                <input type="text" required value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Rua, numero, complemento" className="modal-input" />
              </Field>
              <Field label="Bairro">
                <input type="text" required value={neighborhood} onChange={(e) => setNeighborhood(e.target.value)} placeholder="Bairro" className="modal-input" />
              </Field>
              <Field label="Cidade">
                <input type="text" required value={city} onChange={(e) => setCity(e.target.value)} placeholder="Cidade" className="modal-input" />
              </Field>
              <Field label="Estado">
                <input type="text" required value={state} onChange={(e) => setState(e.target.value)} placeholder="UF" className="modal-input" />
              </Field>
              <Field label="CEP">
                <input type="text" value={zipCode} onChange={(e) => setZipCode(maskCep(e.target.value))} placeholder="00000-000" className="modal-input" inputMode="numeric" />
              </Field>
            </div>
            <Field label="Descricao detalhada">
              <textarea rows={3} required value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Informacoes adicionais..." className="modal-input resize-y" />
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
                  <input type="text" placeholder="URL da imagem" value={newImageUrl} onChange={(e) => setNewImageUrl(e.target.value)} className="flex-grow bg-background border border-border px-2.5 py-1.5 rounded-lg outline-none text-[11px] text-foreground" />
                  <button type="button" disabled={selectedImages.length >= MAX_IMAGES} onClick={() => { if (newImageUrl.trim()) { appendImages(newImageUrl.split(',').map((u) => u.trim()).filter(Boolean)); setNewImageUrl(''); } }} className="bg-primary hover:bg-primary/95 text-white font-bold px-3 py-1.5 rounded-lg text-[10px] uppercase cursor-pointer disabled:opacity-40">
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
            <input type="checkbox" id="modal-featured" checked={featured} onChange={(e) => setFeatured(e.target.checked)} className="h-4 w-4 rounded text-primary focus:ring-primary cursor-pointer" />
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

function NumberInput({ label, value, onChange, float }: { label: string; value: number; onChange: (n: number) => void; float?: boolean }) {
  return (
    <Field label={label}>
      <input type="number" value={value} onChange={(e) => onChange(float ? parseFloat(e.target.value) || 0 : parseInt(e.target.value) || 0)} className="modal-input" />
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

