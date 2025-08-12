import { describe, it, expect } from 'vitest';
import React from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import SearchPage from './SearchPage';

describe('SearchPage', () => {
    it('renders empty state', async () => {
        const { getByText } = render(
            <MemoryRouter initialEntries={[{ pathname: '/search', search: '?date=2025-09-01' }]}>
                <Routes>
                    <Route path="/search" element={<SearchPage />} />
                </Routes>
            </MemoryRouter>
        );
        expect(getByText('Найденные рейсы')).toBeInTheDocument();
    });
});
