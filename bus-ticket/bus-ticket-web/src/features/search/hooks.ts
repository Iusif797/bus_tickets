import { useEffect, useState } from 'react';
import { fetchStops, searchTrips } from './api';
import type { Stop, Trip } from '../../shared/api/types';

export function useStops() {
    const [stops, setStops] = useState<Stop[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    useEffect(() => {
        setLoading(true);
        fetchStops()
            .then(setStops)
            .catch((e) => setError(e.message))
            .finally(() => setLoading(false));
    }, []);
    return { stops, loading, error };
}

export function useSearchTrips(params: { from?: string; to?: string; date?: string }) {
    const [trips, setTrips] = useState<Trip[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    useEffect(() => {
        if (!params.date) return;
        setLoading(true);
        searchTrips({ from: params.from, to: params.to, date: params.date! })
            .then(setTrips)
            .catch((e) => setError(e.message))
            .finally(() => setLoading(false));
    }, [params.from, params.to, params.date]);
    return { trips, loading, error };
}
