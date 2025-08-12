import type { ApiError } from './types';

function getApiBase(): string {
  try {
    // Vite runtime
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const metaEnv = (typeof import.meta !== 'undefined' ? (import.meta as any).env : undefined) as
      | Record<string, string>
      | undefined;
    if (metaEnv && typeof metaEnv.VITE_API_BASE === 'string') return metaEnv.VITE_API_BASE;
  } catch {
    // ignore
  }
  // Node/test fallback
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const g = globalThis as any;
  if (g?.importMeta?.env?.VITE_API_BASE) return g.importMeta.env.VITE_API_BASE as string;
  return 'http://localhost:3001/api';
}

const API_BASE = getApiBase();

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) },
    ...init,
  });
  const text = await res.text();
  const parsed: unknown = text ? JSON.parse(text) : {};

  if (!res.ok) {
    if (isApiError(parsed)) {
      const e = new Error(parsed.error.message);
      (e as { traceId?: string }).traceId = parsed.traceId;
      throw e;
    }
    const e = new Error(res.statusText || 'Request failed');
    throw e;
  }

  if (isApiSuccess<T>(parsed)) return parsed.data;
  return parsed as T;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isApiError(value: unknown): value is ApiError {
  return (
    isRecord(value) &&
    'error' in value &&
    isRecord((value as Record<string, unknown>).error) &&
    typeof (value as { error: { message?: unknown } }).error.message === 'string'
  );
}

function isApiSuccess<T>(value: unknown): value is { data: T; traceId?: string } {
  return isRecord(value) && 'data' in value;
}
