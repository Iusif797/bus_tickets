import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTrip } from '../hooks';
import { formatDate } from '../../../shared/lib/format';
import SeatGrid from '../components/SeatGrid';

const TripPage: React.FC = () => {
    const params = useParams();
    const id = params.id ? Number(params.id) : undefined;
    const { trip, loading, error } = useTrip(id);
    const [seat, setSeat] = useState<number | null>(null);
    const navigate = useNavigate();

    return (
        <div className="container">
            {loading && <div className="badge">Загрузка...</div>}
            {error && <div className="badge">Ошибка: {error}</div>}
            {trip && (
                <div className="card" style={{ padding: 16, display: 'grid', gap: 12 }}>
                    <div className="h1">Рейс #{trip.id}</div>
                    <div className="h2">{formatDate(trip.date)}</div>
                    <div className="separator" />
                    <SeatGrid seats={trip.seats} selected={seat} onSelect={setSeat} />
                    <div className="separator" />
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div className="badge">Выбрано место: {seat || '—'}</div>
                        <button className="btn lg" disabled={!seat} onClick={() => navigate(`/checkout?trip=${trip.id}&seat=${seat}`)}>
                            Перейти к оформлению
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TripPage;
