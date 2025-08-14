import { useEffect, useState } from 'react';
import { fetchTrip } from './api';
import type { TripDetail } from '../../shared/api/types';

export function useTrip(id?: number) {
    const [trip, setTrip] = useState<TripDetail | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    useEffect(() => {
        if (!id) return;
        setLoading(true);
        fetchTrip(id)
            .then(setTrip)
            .catch((e) => setError(e.message))
            .finally(() => setLoading(false));
    }, [id]);
    return { trip, loading, error };
}





