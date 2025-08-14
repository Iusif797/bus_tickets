import React from 'react';
import { useLocation } from 'react-router-dom';
import { useSearchTrips } from '../hooks';
import TripCard from '../components/TripCard';

function useQuery() {
    const { search } = useLocation();
    return React.useMemo(() => new URLSearchParams(search), [search]);
}

const SearchPage: React.FC = () => {
    const q = useQuery();
    const from = q.get('from') || undefined;
    const to = q.get('to') || undefined;
    const date = q.get('date') || undefined;
    const { trips, loading, error } = useSearchTrips({ from, to, date });

    return (
        <div className="container">
            <h1 className="h1" style={{ margin: '16px 0' }}>
                Найденные рейсы
            </h1>
            {loading && <div className="badge">Загрузка...</div>}
            {error && <div className="badge">Ошибка: {error}</div>}
            <div className="list">
                {trips.map((t) => (
                    <TripCard key={t.id} trip={t} />
                ))}
                {!loading && trips.length === 0 && <div className="badge">Нет рейсов на выбранную дату</div>}
            </div>
        </div>
    );
};

export default SearchPage;





