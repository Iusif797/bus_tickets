import { api } from '../../shared/api/client';
import type { ReservationReq, ReservationRes, CheckoutReq, CheckoutRes } from '../../shared/api/types';

export function createReservation(payload: ReservationReq): Promise<ReservationRes> {
    return api('/reservations', { method: 'POST', body: JSON.stringify(payload) });
}

export function checkout(payload: CheckoutReq): Promise<CheckoutRes> {
    return api('/tickets/checkout', { method: 'POST', body: JSON.stringify(payload) });
}




