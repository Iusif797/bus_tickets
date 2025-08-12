import React, { useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import FormField from '../../../shared/components/FormField';
import Button from '../../../shared/components/Button';
import { useStops } from '../../search/hooks';
import { useCheckout } from '../hooks';

function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

const CheckoutPage: React.FC = () => {
  const q = useQuery();
  const trip = Number(q.get('trip') || '');
  const seat = Number(q.get('seat') || '');
  const { stops } = useStops();
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const { loading, error, ticketId, submit } = useCheckout();

  const options = useMemo(() => stops.map((s) => ({ value: String(s.id), label: `${s.name} (${s.code})` })), [stops]);

  function onSubmit() {
    if (!trip || !seat || !from || !to || !name || !email) return;
    submit({
      trip_id: trip,
      seat_no: seat,
      from_stop_id: Number(from),
      to_stop_id: Number(to),
      passenger: { name, email },
    });
  }

  return (
    <div className="container">
      <div className="card" style={{ padding: 16, display: 'grid', gap: 12 }}>
        <div className="h1">Оформление билета</div>
        <div className="badge">Рейс #{trip} — Место {seat}</div>
        <div className="row">
          <FormField label="Откуда">
            <select value={from} onChange={(e) => setFrom(e.target.value)}>
              <option value="">Выберите остановку</option>
              {options.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </FormField>
          <FormField label="Куда">
            <select value={to} onChange={(e) => setTo(e.target.value)}>
              <option value="">Выберите остановку</option>
              {options.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </FormField>
        </div>
        <div className="row">
          <FormField label="Имя пассажира">
            <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Иван Иванов" />
          </FormField>
          <FormField label="Email">
            <input className="input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@email.com" />
          </FormField>
        </div>
        {error && <div className="badge">Ошибка: {error}</div>}
        {ticketId ? (
          <div className="card" style={{ padding: 16 }}>
            <div className="h1">Успех!</div>
            <div className="h2">Ваш ticket_id: {ticketId}</div>
          </div>
        ) : (
          <div className="actions">
            <Button className={loading ? 'lg' : 'lg'} onClick={onSubmit} disabled={loading || !trip || !seat || !from || !to || !name || !email}>
              {loading ? (
                <>
                  <span className="spinner" aria-hidden /> Оформляем…
                </>
              ) : (
                'Оформить'
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CheckoutPage;
