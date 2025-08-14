import React from 'react';
import type { Trip } from '../../../shared/api/types';
import { formatDate, formatPrice } from '../../../shared/lib/format';
import { Link } from 'react-router-dom';

const TripCard: React.FC<{ trip: Trip }> = ({ trip }) => {
    return (
        <div className="card" style={{ padding: 16, display: 'grid', gap: 8, position: 'relative', overflow: 'hidden' }}>
            <div className="row" style={{ justifyContent: 'space-between' }}>
                <div>
                    <div className="h1">Рейс #{trip.id}</div>
                    <div className="h2">{formatDate(trip.date)}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <div className="badge">Свободно: {trip.free_seats} / {trip.capacity}</div>
                    <div style={{ marginTop: 8, fontWeight: 700 }}>{formatPrice(trip.priceFrom)}</div>
                </div>
            </div>
            <div className="actions" style={{ marginTop: 0 }}>
                <Link className="btn ghost" to={`/trip/${trip.id}`}>Детали и выбор места</Link>
            </div>
            <div aria-hidden style={{ position: 'absolute', inset: -1, opacity: .08, pointerEvents: 'none', background: 'radial-gradient(600px 300px at 120% -20%,#9a7cff,transparent),radial-gradient(400px 280px at -10% 120%,#6ea8ff,transparent)' }} />
        </div>
    );
};

export default TripCard;





