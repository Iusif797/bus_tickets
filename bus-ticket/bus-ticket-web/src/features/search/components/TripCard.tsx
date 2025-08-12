import React from 'react';
import type { Trip } from '../../../shared/api/types';
import { formatDate, formatPrice } from '../../../shared/lib/format';
import { Link } from 'react-router-dom';

const TripCard: React.FC<{ trip: Trip }> = ({ trip }) => {
    return (
        <div className="card" style={{ padding: 16, display: 'grid', gap: 8 }}>
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
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Link className="link" to={`/trip/${trip.id}`}>Детали и выбор места →</Link>
            </div>
        </div>
    );
};

export default TripCard;




