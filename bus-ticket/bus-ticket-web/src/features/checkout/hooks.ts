import { useState } from 'react';
import { createReservation, checkout } from './api';

export function useCheckout() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ticketId, setTicketId] = useState<number | null>(null);

  async function submit(payload: {
    trip_id: number;
    seat_no: number;
    from_stop_id: number;
    to_stop_id: number;
    passenger: { name: string; email: string };
  }) {
    setLoading(true);
    setError(null);
    setTicketId(null);
    try {
      await createReservation({ trip_id: payload.trip_id, seat_no: payload.seat_no });
      const res = await checkout({
        trip_id: payload.trip_id,
        from_stop_id: payload.from_stop_id,
        to_stop_id: payload.to_stop_id,
        passenger: payload.passenger,
      });
      setTicketId(res.ticket_id);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Ошибка оформления';
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return { loading, error, ticketId, submit };
}
