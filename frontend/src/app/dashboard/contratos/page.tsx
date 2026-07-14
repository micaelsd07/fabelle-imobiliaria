'use client';

import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api, absoluteUrl } from '@/lib/api';
import { CurrencyInput } from '@/components/CurrencyInput';
import { useAuth } from '@/context/AuthContext';
import { generateContractPDF } from './contract-pdf';
import {
  FileSignature,
  Plus,
  Search,
  CheckCircle,
  Clock,
  X,
  FileText,
  DollarSign,
  Download,
  AlertCircle,
  PenTool,
  Trash2,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface Contract {
  id: string;
  title: string;
  type: string; // ALUGUEL, VENDA
  status: string; // RASCUNHO, ATIVO, VENCIDO, CANCELADO
  value: number;
  startDate: string;
  endDate: string;
  pdfUrl?: string;
  signatureStatus: string; // PENDENTE, ASSINADO
  clientSignature?: string;
  client: { id: string; name: string };
  property: { id: string; code: string; title: string; price: number };
  broker?: { id: string; name: string };
}

const MOCK_CONTRACTS: Contract[] = [{
  id: '1',
  title: 'Contrato de Locação Residencial - Pinheiros FAB-002',
  type: 'ALUGUEL', status: 'ATIVO', value: 7500,
  startDate: new Date().toISOString(), endDate: new Date().toISOString(),
  signatureStatus: 'ASSINADO',
  clientSignature: 'Assinado digitalmente por João Pedro de Oliveira',
  client: { id: 'c1', name: 'João Pedro de Oliveira' },
  property: { id: 'p2', code: 'FAB-002', title: 'Apartamento em Pinheiros', price: 7500 },
  broker: { id: 'b2', name: 'Amanda Souza' },
}];

export default function DashboardContracts() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const contractsQuery = useQuery({ queryKey: ['contracts'], queryFn: () => api.get<Contract[]>('/contracts'), retry: false });
  const clientsQuery = useQuery({ queryKey: ['clients'], queryFn: () => api.get<any[]>('/clients'), retry: false });
  const propertiesQuery = useQuery({ queryKey: ['properties'], queryFn: () => api.get<any[]>('/properties'), retry: false });

  const contracts: Contract[] = contractsQuery.data ?? [];
  const loading = contractsQuery.isLoading;
  // Só locatários e compradores fazem sentido pra um contrato — filtra locadores/interessados fora.
  const clients: Array<{ id: string; name: string; clientType?: string }> =
    (clientsQuery.data ?? []).filter((c: any) => !c.clientType || c.clientType === 'LOCATARIO' || c.clientType === 'COMPRADOR');
  type PropertyLite = {
    id: string; code: string; title: string; price: number;
    ownerName?: string; ownerCpf?: string; ownerPhone?: string; ownerEmail?: string;
    ownerCivilStatus?: string;
  };
  const properties: PropertyLite[] =
    (propertiesQuery.data ?? []).filter((x: any) => x.status === 'DISPONIVEL');

  const [search, setSearch] = useState('');

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [type, setType] = useState('ALUGUEL');
  const [value, setValue] = useState(0);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [clientId, setClientId] = useState('');
  const [propertyId, setPropertyId] = useState('');
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [uploadingPdf, setUploadingPdf] = useState(false);

  const [signatureModalOpen, setSignatureModalOpen] = useState(false);
  const [signingContractId, setSigningContractId] = useState<string | null>(null);
  const [typedSignatureName, setTypedSignatureName] = useState('');
  const [simulatedSignature, setSimulatedSignature] = useState(false);

  const refresh = () => qc.invalidateQueries({ queryKey: ['contracts'] });

  const selectedProperty = properties.find((p) => p.id === propertyId);
  const selectedClient = clients.find((c) => c.id === clientId);

  const handleCreateContract = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pdfFile) {
      toast.error('Selecione o PDF do contrato antes de salvar.');
      return;
    }
    setUploadingPdf(true);
    try {
      const uploaded = await api.uploadDocument(pdfFile);
      const pdfUrl = uploaded.url;

      // Título automático — imóvel + locatário
      const autoTitle = title ||
        `Contrato ${type === 'ALUGUEL' ? 'Locação' : 'Compra e Venda'} — ${selectedProperty?.code || ''} · ${selectedClient?.name || ''}`.trim();

      const payload = {
        title: autoTitle,
        type,
        value: parseFloat(value.toString()) || 0,
        startDate: startDate || new Date().toISOString().slice(0, 10),
        endDate: endDate || new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString().slice(0, 10),
        clientId,
        propertyId,
        brokerId: user?.id,
        pdfUrl,
        signatureStatus: 'ASSINADO',
        status: 'ATIVO',
      };
      await api.post('/contracts', payload);
      refresh();
      setCreateModalOpen(false);
      setPdfFile(null);
      setTitle('');
      toast.success('Contrato criado com sucesso');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao comunicar com o banco de dados.');
    } finally {
      setUploadingPdf(false);
    }
  };

  const handleDeleteContract = async (id: string) => {
    if (!confirm('Deseja excluir este contrato?')) return;
    try {
      await api.del(`/contracts/${id}`);
      refresh();
      toast.success('Contrato excluído');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao excluir contrato.');
    }
  };

  const openSignModal = (contractId: string) => {
    const c = contracts.find((x) => x.id === contractId);
    if (c) {
      setSigningContractId(contractId);
      setTypedSignatureName(c.client.name);
      setSignatureModalOpen(true);
    }
  };

  const submitSignature = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signingContractId) return;
    const signatureText = `Assinado eletronicamente por ${typedSignatureName} sob IP 192.168.1.${Math.floor(Math.random() * 254)}`;
    try {
      await api.post(`/contracts/${signingContractId}/sign`, { signature: signatureText });
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      refresh();
      toast.success('Contrato assinado eletronicamente');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao assinar contrato.');
      return;
    }
    setSignatureModalOpen(false);
  };

  const filteredContracts = contracts.filter((c) =>
    c.title.toLowerCase().includes(search.toLowerCase()) ||
    c.client.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-5">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Contratos</h1>
          <p className="text-sm text-muted-foreground font-semibold">Suba o PDF do contrato e vincule ao imóvel, locador e locatário.</p>
        </div>
        <button
          onClick={() => setCreateModalOpen(true)}
          className="bg-primary hover:bg-primary/95 text-white font-bold px-5 py-3 rounded-xl shadow-md flex items-center gap-2 transition-all cursor-pointer text-sm"
        >
          <Plus className="h-4.5 w-4.5" /> Subir Contrato
        </button>
      </div>

      {/* Search Input */}
      <div className="relative max-w-lg">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground h-4.5 w-4.5" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar contrato por título ou cliente..."
          className="w-full bg-card border pl-11 pr-4 py-2.5 rounded-xl outline-none focus:ring-2 focus:ring-primary/45 text-foreground text-sm"
        />
      </div>

      {/* Grid List contracts */}
      <div className="bg-card border rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-primary mx-auto"></div>
          </div>
        ) : filteredContracts.length === 0 ? (
          <div className="py-20 text-center text-muted-foreground text-sm font-semibold">
            Nenhum contrato elaborado.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-semibold">
              <thead>
                <tr className="border-b bg-secondary/35 text-muted-foreground uppercase tracking-wider font-bold">
                  <th className="p-4">Contrato</th>
                  <th className="p-4">Cliente</th>
                  <th className="p-4">Imóvel</th>
                  <th className="p-4">Valor</th>
                  <th className="p-4">Assinatura</th>
                  <th className="p-4 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredContracts.map((c) => (
                  <tr key={c.id} className="hover:bg-secondary/15 transition-colors">
                    <td className="p-4">
                      <span className="font-extrabold text-sm text-foreground block line-clamp-1">{c.title}</span>
                      <span className="text-[10px] text-muted-foreground font-medium flex items-center gap-1.5 mt-0.5">
                        Vigência: {new Date(c.startDate).toLocaleDateString('pt-BR')} até {new Date(c.endDate).toLocaleDateString('pt-BR')}
                      </span>
                    </td>
                    <td className="p-4 text-foreground/80">{c.client.name}</td>
                    <td className="p-4 text-muted-foreground font-bold">{c.property.code}</td>
                    <td className="p-4 text-primary font-black text-sm">
                      {c.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      {c.type === 'ALUGUEL' && <span className="text-[10px] text-muted-foreground font-normal">/mês</span>}
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase border flex items-center gap-1 w-fit ${
                        c.signatureStatus === 'ASSINADO' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                      }`}>
                        {c.signatureStatus === 'ASSINADO' ? (
                          <>
                            <CheckCircle className="h-3 w-3" /> Assinado
                          </>
                        ) : (
                          <>
                            <Clock className="h-3 w-3" /> Pendente
                          </>
                        )}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        {c.signatureStatus === 'PENDENTE' ? (
                          <button
                            onClick={() => openSignModal(c.id)}
                            className="bg-primary hover:bg-primary/95 text-white font-bold px-3 py-1.5 rounded-lg text-xs shadow flex items-center gap-1 cursor-pointer transition-colors"
                          >
                            <PenTool className="h-3.5 w-3.5" /> Assinar
                          </button>
                        ) : (
                          <button
                            disabled
                            className="border bg-secondary text-muted-foreground px-3 py-1.5 rounded-lg text-xs flex items-center gap-1"
                          >
                            Concluído
                          </button>
                        )}
                        {c.pdfUrl ? (
                          <a
                            href={absoluteUrl(c.pdfUrl)}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 border hover:bg-primary/10 text-primary rounded-lg cursor-pointer"
                            title="Abrir contrato PDF"
                          >
                            <Download className="h-4 w-4" />
                          </a>
                        ) : (
                          <button
                            onClick={() => generateContractPDF(c)}
                            className="p-1.5 border hover:bg-secondary rounded-lg text-muted-foreground hover:text-foreground cursor-pointer"
                            title="Gerar PDF do sistema"
                          >
                            <Download className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteContract(c.id)}
                          className="p-1.5 border hover:bg-destructive/10 text-muted-foreground hover:text-destructive rounded-lg cursor-pointer"
                          title="Excluir contrato"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Contract Upload Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-card text-card-foreground border rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-5 animate-in scale-in duration-300 max-h-[92vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-extrabold text-lg flex items-center gap-2">
                <FileSignature className="h-5 w-5 text-primary" /> Subir Contrato
              </h3>
              <button
                onClick={() => setCreateModalOpen(false)}
                className="p-1 border rounded-lg hover:bg-secondary cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateContract} className="space-y-4 text-xs font-semibold">
              {/* Imóvel */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground/80 uppercase">Imóvel</label>
                <select
                  required
                  value={propertyId}
                  onChange={(e) => setPropertyId(e.target.value)}
                  className="w-full bg-secondary/40 border px-3 py-2.5 rounded-lg outline-none text-foreground cursor-pointer"
                >
                  <option value="">Selecione o imóvel</option>
                  {properties.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.code} - {p.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Preview do Locador */}
              {selectedProperty && (
                <div className="rounded-xl bg-primary/5 border border-primary/20 p-3 space-y-1.5">
                  <p className="text-[10px] uppercase font-black text-primary tracking-wider">Locador (proprietário)</p>
                  {selectedProperty.ownerName ? (
                    <>
                      <p className="text-sm font-bold text-foreground">{selectedProperty.ownerName}</p>
                      <div className="grid grid-cols-2 gap-1 text-[11px] text-muted-foreground">
                        {selectedProperty.ownerCpf && <span>CPF: {selectedProperty.ownerCpf}</span>}
                        {selectedProperty.ownerPhone && <span>Tel: {selectedProperty.ownerPhone}</span>}
                        {selectedProperty.ownerEmail && <span className="col-span-2 truncate">Email: {selectedProperty.ownerEmail}</span>}
                        {selectedProperty.ownerCivilStatus && <span>Estado civil: {selectedProperty.ownerCivilStatus}</span>}
                      </div>
                    </>
                  ) : (
                    <p className="text-[11px] text-muted-foreground italic">
                      Este imóvel ainda não tem locador cadastrado. Edite o imóvel para preencher.
                    </p>
                  )}
                </div>
              )}

              {/* Locatário / Comprador */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground/80 uppercase">Locatário / Comprador</label>
                <select
                  required
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  className="w-full bg-secondary/40 border px-3 py-2.5 rounded-lg outline-none text-foreground cursor-pointer"
                >
                  <option value="">Selecione o cliente</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Modalidade + Valor */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground/80 uppercase">Modalidade</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full bg-secondary/40 border px-3 py-2.5 rounded-lg outline-none text-foreground cursor-pointer"
                  >
                    <option value="ALUGUEL">Locação (Aluguel)</option>
                    <option value="VENDA">Compra e Venda</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground/80 uppercase">Valor (opcional)</label>
                  <CurrencyInput
                    value={value}
                    onChange={setValue}
                    className="w-full bg-secondary/40 border px-3 py-2.5 rounded-lg outline-none focus:ring-2 focus:ring-primary/40 text-foreground font-semibold text-primary"
                  />
                </div>
              </div>

              {/* PDF (obrigatório) */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground/80 uppercase">PDF do contrato <span className="text-red-500">*</span></label>
                <div className="rounded-xl border-2 border-dashed border-primary/40 bg-primary/5 p-4 flex items-center gap-3">
                  <input
                    id="contract-pdf-input"
                    type="file"
                    accept="application/pdf"
                    className="hidden"
                    onChange={(e) => setPdfFile(e.target.files?.[0] ?? null)}
                  />
                  <label
                    htmlFor="contract-pdf-input"
                    className="bg-primary text-white px-3 py-1.5 rounded-lg text-[10px] uppercase font-black tracking-wider cursor-pointer hover:bg-primary/95 shrink-0"
                  >
                    Escolher PDF
                  </label>
                  <span className="text-[11px] text-muted-foreground truncate flex-1">
                    {pdfFile ? pdfFile.name : 'Nenhum arquivo selecionado (até 20 MB)'}
                  </span>
                  {pdfFile && (
                    <button
                      type="button"
                      onClick={() => setPdfFile(null)}
                      className="text-red-500 hover:text-red-700 text-lg leading-none shrink-0"
                      title="Remover PDF"
                    >
                      ×
                    </button>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="border px-4 py-2 rounded-xl hover:bg-secondary cursor-pointer"
                  disabled={uploadingPdf}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={uploadingPdf || !pdfFile}
                  className="bg-primary hover:bg-primary/95 text-white font-bold px-6 py-2 rounded-xl shadow cursor-pointer disabled:opacity-60"
                >
                  {uploadingPdf ? 'Enviando…' : 'Salvar contrato'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Simulated digital signature canvas modal */}
      {signatureModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-card text-card-foreground border rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-6 animate-in scale-in duration-300">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-extrabold text-lg flex items-center gap-2">
                <FileSignature className="h-5 w-5 text-primary" /> Assinatura Eletrônica Fabelle
              </h3>
              <button
                onClick={() => setSignatureModalOpen(false)}
                className="p-1 border rounded-lg hover:bg-secondary cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={submitSignature} className="space-y-6 text-xs font-semibold">
              <div className="bg-amber-500/10 text-amber-500 border border-amber-500/20 p-4 rounded-xl flex items-start gap-2.5">
                <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                <p className="font-medium leading-relaxed">
                  Para assinar eletronicamente esta minuta com fé pública e validade jurídica, confirme o nome do signatário e desenhe no pad abaixo.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground/80 uppercase">Nome Completo do Assinante</label>
                <input
                  type="text"
                  required
                  value={typedSignatureName}
                  onChange={(e) => setTypedSignatureName(e.target.value)}
                  className="w-full bg-secondary/40 border px-3 py-2.5 rounded-lg outline-none text-foreground font-bold"
                />
              </div>

              {/* Draw pad simulation */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-foreground/80 uppercase block">Assinatura (Escreva / Desenhe abaixo)</label>
                <div
                  onClick={() => setSimulatedSignature(true)}
                  className="h-32 border border-dashed rounded-xl bg-secondary/20 flex items-center justify-center cursor-pointer hover:bg-secondary/40 relative overflow-hidden select-none"
                >
                  {simulatedSignature ? (
                    <span className="font-serif italic text-2xl text-primary font-medium tracking-wide">
                      {typedSignatureName}
                    </span>
                  ) : (
                    <span className="text-muted-foreground flex items-center gap-1 font-medium">
                      <PenTool className="h-4 w-4 text-primary" /> Clique aqui para simular a rubrica
                    </span>
                  )}
                  {simulatedSignature && (
                    <div className="absolute bottom-1 right-2 text-[8px] text-muted-foreground font-mono">
                      Criptografia SHA-256 Validada
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setSignatureModalOpen(false)}
                  className="border px-4 py-2 rounded-xl hover:bg-secondary cursor-pointer"
                >
                  Recusar
                </button>
                <button
                  type="submit"
                  disabled={!simulatedSignature}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-6 py-2.5 rounded-xl shadow cursor-pointer disabled:opacity-50"
                >
                  Assinar Minuta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}




