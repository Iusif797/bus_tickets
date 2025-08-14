import React, { useMemo } from 'react';
import Button from '../../../shared/components/Button';
import FormField from '../../../shared/components/FormField';
import { useStops } from '../hooks';

type Props = {
    values: { from: string; to: string; date: string };
    onChange: (v: { from: string; to: string; date: string }) => void;
    onSubmit: () => void;
};

const SearchForm: React.FC<Props> = ({ values, onChange, onSubmit }) => {
    const { stops } = useStops();

    const options = useMemo(() => stops.map((s) => ({ value: String(s.id), label: `${s.name} (${s.code})` })), [stops]);

    return (
        <div className="card" style={{ padding: 16, position: 'relative', overflow: 'hidden' }}>
            <div aria-hidden style={{ position: 'absolute', inset: -1, opacity: .06, pointerEvents: 'none', background: 'radial-gradient(500px 260px at 10% -20%,#6ea8ff,transparent),radial-gradient(420px 240px at 110% 120%,#9a7cff,transparent)' }} />
            <div className="row">
                <FormField label="Откуда">
                    <select
                        value={values.from}
                        onChange={(e) => onChange({ ...values, from: e.target.value })}
                        aria-label="Откуда"
                    >
                        <option value="">Выберите остановку</option>
                        {options.map((o) => (
                            <option key={o.value} value={o.value}>
                                {o.label}
                            </option>
                        ))}
                    </select>
                </FormField>
                <FormField label="Куда">
                    <select value={values.to} onChange={(e) => onChange({ ...values, to: e.target.value })} aria-label="Куда">
                        <option value="">Выберите остановку</option>
                        {options.map((o) => (
                            <option key={o.value} value={o.value}>
                                {o.label}
                            </option>
                        ))}
                    </select>
                </FormField>
                <FormField label="Дата">
                    <input
                        className="input"
                        type="date"
                        value={values.date}
                        onChange={(e) => onChange({ ...values, date: e.target.value })}
                        aria-label="Дата"
                    />
                </FormField>
            </div>
            <div className="actions">
                <Button className="lg" onClick={onSubmit}>Найти рейсы</Button>
            </div>
        </div>
    );
};

export default SearchForm;



