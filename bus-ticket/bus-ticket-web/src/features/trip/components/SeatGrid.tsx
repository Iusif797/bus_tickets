import React from 'react';
import type { Seat } from '../../../shared/api/types';

type Props = {
    seats: Seat[];
    selected?: number | null;
    onSelect?: (seatNo: number) => void;
};

const SeatGrid: React.FC<Props> = ({ seats, selected, onSelect }) => {
    const columns = 4;
    return (
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${columns}, 1fr)`, gap: 8 }}>
            {seats.map((s) => {
                const isSelected = selected === s.seat_no;
                const disabled = s.status !== 'free';
                return (
                    <button
                        key={s.seat_no}
                        className={`seat ${s.status}${isSelected ? ' selected' : ''}`}
                        onClick={() => !disabled && onSelect?.(s.seat_no)}
                        aria-pressed={isSelected}
                        disabled={disabled}
                    >
                        {s.seat_no}
                    </button>
                );
            })}
        </div>
    );
};

export default SeatGrid;
