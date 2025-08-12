import React, { useState } from 'react';
import SearchForm from '../components/SearchForm';
import { useNavigate } from 'react-router-dom';

const HomePage: React.FC = () => {
    const navigate = useNavigate();
    const [values, setValues] = useState({ from: '', to: '', date: '' });

    function handleSubmit() {
        const q = new URLSearchParams();
        if (values.from) q.set('from', values.from);
        if (values.to) q.set('to', values.to);
        if (values.date) q.set('date', values.date);
        navigate(`/search?${q.toString()}`);
    }

    return (
        <div className="container">
            <div style={{ margin: '20vh 0 16px' }}>
                <h1 className="h1">Bus Ticket</h1>
                <div className="h2">Поиск рейсов и покупка билетов</div>
            </div>
            <SearchForm values={values} onChange={setValues} onSubmit={handleSubmit} />
        </div>
    );
};

export default HomePage;



