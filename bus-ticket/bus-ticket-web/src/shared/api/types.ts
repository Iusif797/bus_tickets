export type Stop = { id: number; name: string; code: string };

export type Trip = {
    id: number;
    date: string;
    sell_enabled: boolean;
    free_seats: number;
    capacity: number;
    priceFrom: number;
};

export type Seat = { seat_no: number; status: 'free' | 'occupied' | 'hold' };

export type TripDetail = {
    id: number;
    date: string;
    status: string;
    free_seats: number;
    capacity: number;
    vehicle_id: unknown;
    seats: Seat[];
};

export type ReservationReq = { trip_id: number; seat_no: number };
export type ReservationRes = { reservation_id: number; hold_until: string };

export type CheckoutReq = {
    trip_id: number;
    from_stop_id: number;
    to_stop_id: number;
    passenger: { name: string; email: string };
};
export type CheckoutRes = { ticket_id: number };

export type ApiResponse<T> = { data: T; traceId: string };
export type ApiError = { error: { message: string; code?: number }; traceId?: string };




