import { api } from '../../shared/api/client';
import type { Stop, Trip } from '../../shared/api/types';

export function fetchStops(): Promise<Stop[]> {
  return api('/stops');
}

export function searchTrips(params: { from?: string; to?: string; date: string }): Promise<Trip[]> {
  const q = new URLSearchParams();
  if (params.from) q.set('from', params.from);
  if (params.to) q.set('to', params.to);
  q.set('date', params.date);
  return api(`/search?${q.toString()}`);
}
