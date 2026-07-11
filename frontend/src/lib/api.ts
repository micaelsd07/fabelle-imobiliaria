export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const TOKEN_KEY = 'fabelle-token';

export class ApiError extends Error {
  status: number;
  body: unknown;
  constructor(status: number, message: string, body?: unknown) {
    super(message);
    this.status = status;
    this.body = body;
  }
}

type Method = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

// Handler global para 401 — setado pelo AuthProvider, evita import circular.
let onUnauthorized: (() => void) | null = null;
export function setOnUnauthorized(fn: (() => void) | null) {
  onUnauthorized = fn;
}

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

async function request<T>(method: Method, path: string, body?: unknown): Promise<T> {
  const url = path.startsWith('http') ? path : `${API_URL}${path}`;

  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  let res: Response;
  try {
    res = await fetch(url, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new ApiError(0, 'Falha de conexão com o servidor.');
  }

  if (res.status === 401 && onUnauthorized) onUnauthorized();

  const text = await res.text();
  const data = text ? safeJson(text) : null;

  if (!res.ok) {
    throw new ApiError(res.status, getErrorMessage(data, res.status), data);
  }

  return data as T;
}

function getErrorMessage(data: unknown, status: number): string {
  if (data && typeof data === 'object' && 'message' in data) {
    const rawMessage = (data as { message?: unknown }).message;
    if (Array.isArray(rawMessage)) return rawMessage.join(', ');
    if (rawMessage) return String(rawMessage);
  }
  if (typeof data === 'string' && data.trim()) return data;
  return `Erro ${status}`;
}
function safeJson(text: string): unknown {
  try { return JSON.parse(text); } catch { return text; }
}

export type UploadedFile = { url: string; originalName: string; size: number; mimeType: string };

async function uploadDocument(file: File): Promise<UploadedFile> {
  const form = new FormData();
  form.append('file', file);
  const token = getToken();
  let res: Response;
  try {
    res = await fetch(`${API_URL}/upload/document`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      body: form,
    });
  } catch {
    throw new ApiError(0, 'Falha ao enviar documento.');
  }
  if (res.status === 401 && onUnauthorized) onUnauthorized();
  const text = await res.text();
  const data = text ? safeJson(text) : null;
  if (!res.ok) throw new ApiError(res.status, getErrorMessage(data, res.status), data);
  return data as UploadedFile;
}

async function uploadImages(files: File[]): Promise<{ files: UploadedFile[] }> {
  if (!files.length) return { files: [] };
  const form = new FormData();
  for (const f of files) form.append('files', f);

  const token = getToken();
  let res: Response;
  try {
    res = await fetch(`${API_URL}/upload/images`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      body: form,
    });
  } catch {
    throw new ApiError(0, 'Falha ao enviar arquivos.');
  }
  if (res.status === 401 && onUnauthorized) onUnauthorized();
  const text = await res.text();
  const data = text ? safeJson(text) : null;
  if (!res.ok) throw new ApiError(res.status, getErrorMessage(data, res.status), data);
  return data as any;
}

/** Recebe URLs relativas do backend (ex: "/uploads/abc.png") e prefixa com API_URL. */
export function absoluteUrl(u: string): string {
  if (!u) return u;
  if (u.startsWith('http') || u.startsWith('data:')) return u;
  return `${API_URL}${u}`;
}

export const api = {
  get:  <T>(path: string)                  => request<T>('GET', path),
  post: <T>(path: string, body?: unknown)  => request<T>('POST', path, body),
  put:  <T>(path: string, body?: unknown)  => request<T>('PUT', path, body),
  patch:<T>(path: string, body?: unknown)  => request<T>('PATCH', path, body),
  del:  <T>(path: string)                  => request<T>('DELETE', path),
  uploadImages,
  uploadDocument,
};
