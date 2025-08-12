import { api } from '../../shared/api/client';
import type { TripDetail } from '../../shared/api/types';

export function fetchTrip(id: number): Promise<TripDetail> {
    return api(`/trips/${id}`);
}




