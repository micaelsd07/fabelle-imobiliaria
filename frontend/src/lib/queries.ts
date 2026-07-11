'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from './api';
import type { Property } from '@/app/dashboard/imoveis/components/types';

function buildQueryString(filters?: Record<string, string | number | undefined>) {
  if (!filters) return '';
  const qs = Object.entries(filters)
    .filter(([, v]) => v !== undefined && v !== '')
    .map(([k, v]) => `${k}=${encodeURIComponent(String(v))}`)
    .join('&');
  return qs ? `?${qs}` : '';
}

function invalidate(qc: ReturnType<typeof useQueryClient>, key: unknown[]) {
  return () => qc.invalidateQueries({ queryKey: key });
}

// ---- Properties ----
export function useProperties(filters?: Record<string, string | number | undefined>) {
  return useQuery({
    queryKey: ['properties', filters ?? {}],
    queryFn: () => api.get<Property[]>(`/properties${buildQueryString(filters)}`),
  });
}

export function useProperty(id: string | undefined) {
  return useQuery({
    queryKey: ['properties', id],
    queryFn: () => api.get<Property>(`/properties/${id}`),
    enabled: !!id,
  });
}

export function useCreateProperty() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (body: Partial<Property>) => api.post<Property>('/properties', body), onSuccess: invalidate(qc, ['properties']) });
}

export function useUpdateProperty() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: Partial<Property> }) => api.put<Property>(`/properties/${id}`, body),
    onSuccess: invalidate(qc, ['properties']),
  });
}

export function useDeleteProperty() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (id: string) => api.del<void>(`/properties/${id}`), onSuccess: invalidate(qc, ['properties']) });
}

export function useDuplicateProperty() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (id: string) => api.post<Property>(`/properties/${id}/duplicate`), onSuccess: invalidate(qc, ['properties']) });
}

export function useArchiveProperty() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (id: string) => api.post<Property>(`/properties/${id}/archive`), onSuccess: invalidate(qc, ['properties']) });
}

// ---- Dashboard ----
export function useDashboardStats() {
  return useQuery({ queryKey: ['dashboard', 'stats'], queryFn: () => api.get<any>('/dashboard/stats') });
}
export function useFinancialMetrics() {
  return useQuery({ queryKey: ['financial', 'metrics'], queryFn: () => api.get<any>('/financial/metrics') });
}

// ---- Clients ----
export function useClients(search?: string) {
  return useQuery({ queryKey: ['clients', search ?? ''], queryFn: () => api.get<any[]>(`/clients${buildQueryString({ search })}`) });
}
export function useCreateClient() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (body: any) => api.post<any>('/clients', body), onSuccess: invalidate(qc, ['clients']) });
}
export function useUpdateClient() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ id, body }: { id: string; body: any }) => api.put<any>(`/clients/${id}`, body), onSuccess: invalidate(qc, ['clients']) });
}
export function useDeleteClient() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (id: string) => api.del<void>(`/clients/${id}`), onSuccess: invalidate(qc, ['clients']) });
}

// ---- Leads ----
export function useLeads(filters?: Record<string, string | number | undefined>) {
  return useQuery({ queryKey: ['leads', filters ?? {}], queryFn: () => api.get<any[]>(`/leads${buildQueryString(filters)}`) });
}
export function useCreateLead() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (body: any) => api.post<any>('/leads', body), onSuccess: invalidate(qc, ['leads']) });
}
export function useUpdateLead() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ id, body }: { id: string; body: any }) => api.put<any>(`/leads/${id}`, body), onSuccess: invalidate(qc, ['leads']) });
}
export function useDeleteLead() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (id: string) => api.del<void>(`/leads/${id}`), onSuccess: invalidate(qc, ['leads']) });
}

// ---- Users ----
export function useUsers() {
  return useQuery({ queryKey: ['users'], queryFn: () => api.get<any[]>('/users') });
}
export function useCreateUser() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (body: any) => api.post<any>('/users', body), onSuccess: invalidate(qc, ['users']) });
}
export function useUpdateUser() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ id, body }: { id: string; body: any }) => api.put<any>(`/users/${id}`, body), onSuccess: invalidate(qc, ['users']) });
}
export function useDeleteUser() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (id: string) => api.del<void>(`/users/${id}`), onSuccess: invalidate(qc, ['users']) });
}

// ---- Agenda ----
export function useAgenda(filters?: Record<string, string | number | undefined>) {
  return useQuery({ queryKey: ['agenda', filters ?? {}], queryFn: () => api.get<any[]>(`/agenda${buildQueryString(filters)}`) });
}
export function useCreateVisit() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (body: any) => api.post<any>('/agenda', body), onSuccess: invalidate(qc, ['agenda']) });
}
export function useUpdateVisit() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ id, body }: { id: string; body: any }) => api.put<any>(`/agenda/${id}`, body), onSuccess: invalidate(qc, ['agenda']) });
}
export function useDeleteVisit() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (id: string) => api.del<void>(`/agenda/${id}`), onSuccess: invalidate(qc, ['agenda']) });
}

// ---- Contracts ----
export function useContracts() {
  return useQuery({ queryKey: ['contracts'], queryFn: () => api.get<any[]>('/contracts') });
}
export function useCreateContract() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (body: any) => api.post<any>('/contracts', body), onSuccess: invalidate(qc, ['contracts']) });
}
export function useUpdateContract() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ id, body }: { id: string; body: any }) => api.put<any>(`/contracts/${id}`, body), onSuccess: invalidate(qc, ['contracts']) });
}
export function useDeleteContract() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (id: string) => api.del<void>(`/contracts/${id}`), onSuccess: invalidate(qc, ['contracts']) });
}

// ---- Financial ----
export function useFinancial(filters?: Record<string, string | number | undefined>) {
  return useQuery({ queryKey: ['financial', filters ?? {}], queryFn: () => api.get<any[]>(`/financial${buildQueryString(filters)}`) });
}
export function useCreateTransaction() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (body: any) => api.post<any>('/financial', body), onSuccess: invalidate(qc, ['financial']) });
}
export function useUpdateTransaction() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ id, body }: { id: string; body: any }) => api.put<any>(`/financial/${id}`, body), onSuccess: invalidate(qc, ['financial']) });
}
export function useDeleteTransaction() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (id: string) => api.del<void>(`/financial/${id}`), onSuccess: invalidate(qc, ['financial']) });
}
