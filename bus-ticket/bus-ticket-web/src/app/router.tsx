import React from 'react';
import { createBrowserRouter } from 'react-router-dom';
import HomePage from '../features/search/pages/HomePage';
import SearchPage from '../features/search/pages/SearchPage';
import TripPage from '../features/trip/pages/TripPage';
import CheckoutPage from '../features/checkout/pages/CheckoutPage';

export const router = createBrowserRouter([
    { path: '/', element: <HomePage /> },
    { path: '/search', element: <SearchPage /> },
    { path: '/trip/:id', element: <TripPage /> },
    { path: '/checkout', element: <CheckoutPage /> },
]);
