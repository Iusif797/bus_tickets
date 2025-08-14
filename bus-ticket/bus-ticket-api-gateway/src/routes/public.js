'use strict';

const express = require('express');
const { callKw } = require('../rpc');

const router = express.Router();
const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

router.get(
    '/stops',
    asyncHandler(async (req, res) => {
        const stops = await callKw({
            model: 'bus.stop',
            method: 'search_read',
            args: [[]],
            kwargs: { fields: ['id', 'name', 'code'], limit: 100, order: 'name asc' },
        });
        res.json({ data: stops, traceId: res.locals.traceId });
    })
);

router.get(
    '/search',
    asyncHandler(async (req, res) => {
        const { from, to, date } = req.query;
        if (!date) {
            return res
                .status(400)
                .json({ error: { message: 'date is required', code: 400 }, traceId: res.locals.traceId });
        }
        const domain = [['date', '=', date]];
        // Валидация маршрута по остановкам специфична модели Odoo; оставляем фильтр по дате.
        const trips = await callKw({
            model: 'bus.trip',
            method: 'search_read',
            args: [domain],
            kwargs: {
                fields: ['id', 'date', 'sell_enabled', 'free_seats', 'capacity', 'price_from', 'base_price'],
                limit: 100,
                order: 'date asc',
            },
        });

        const tripIds = (trips || []).map((t) => t.id).filter(Boolean);
        const priceMinByTrip = {};
        if (tripIds.length > 0) {
            try {
                const groups = await callKw({
                    model: 'bus.price.rule',
                    method: 'read_group',
                    args: [[['trip_id', 'in', tripIds]], ['price:min'], ['trip_id']],
                    kwargs: {},
                });
                if (Array.isArray(groups)) {
                    for (const g of groups) {
                        const trip = Array.isArray(g.trip_id) ? g.trip_id[0] : g.trip_id;
                        const minPrice = g['price_min'] ?? g['price:min'] ?? g.price;
                        if (trip && typeof minPrice === 'number') priceMinByTrip[trip] = minPrice;
                    }
                }
            } catch (_) {
                // если модели правил нет — просто пропустим
            }
        }

        const enriched = (trips || []).map((t) => ({
            ...t,
            priceFrom:
                typeof t.price_from === 'number'
                    ? t.price_from
                    : typeof t.base_price === 'number'
                        ? t.base_price
                        : priceMinByTrip[t.id] ?? 0,
        }));

        res.json({ data: enriched, traceId: res.locals.traceId });
    })
);

function generateSeatGrid(capacity, freeSeats) {
    const total = Number(capacity) || 0;
    const free = Number(freeSeats) || 0;
    const occupied = Math.max(0, total - free);
    const columns = 4;
    const rows = Math.ceil(total / columns);
    const seats = [];
    let seatNo = 1;
    let occLeft = occupied;
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < columns; c++) {
            if (seatNo > total) break;
            let status = 'free';
            if (occLeft > 0) {
                status = 'occupied';
                occLeft--;
            }
            seats.push({ seat_no: seatNo, status });
            seatNo++;
        }
    }
    return seats;
}

router.get(
    '/trips/:id',
    asyncHandler(async (req, res) => {
        const id = Number(req.params.id);
        if (!id) {
            return res
                .status(400)
                .json({ error: { message: 'Invalid trip id', code: 400 }, traceId: res.locals.traceId });
        }
        const tripArr = await callKw({
            model: 'bus.trip',
            method: 'read',
            args: [[id], ['id', 'date', 'status', 'free_seats', 'capacity', 'vehicle_id', 'base_price', 'price_from']],
            kwargs: {},
        });
        const trip = Array.isArray(tripArr) ? tripArr[0] : tripArr;
        if (!trip) {
            return res
                .status(404)
                .json({ error: { message: 'Trip not found', code: 404 }, traceId: res.locals.traceId });
        }

        let seats = [];
        try {
            // 1) Пробуем конкретную карту рейса
            const mapsByTrip = await callKw({
                model: 'bus.seat.map',
                method: 'search_read',
                args: [[['trip_id', '=', id]]],
                kwargs: { fields: ['layout_json'], limit: 1 },
            });
            let layout = mapsByTrip?.[0]?.layout_json;

            // 2) Если нет, пробуем карту по транспортному средству
            if (!layout && trip.vehicle_id && Array.isArray(trip.vehicle_id)) {
                const vehicleId = trip.vehicle_id[0];
                const mapsByVehicle = await callKw({
                    model: 'bus.seat.map',
                    method: 'search_read',
                    args: [[['vehicle_id', '=', vehicleId]]],
                    kwargs: { fields: ['layout_json'], limit: 1 },
                });
                layout = mapsByVehicle?.[0]?.layout_json;
            }

            // 3) Если есть layout, парсим и уважаем статусы
            if (layout) {
                const parsed = typeof layout === 'string' ? JSON.parse(layout) : layout;
                if (Array.isArray(parsed?.seats)) {
                    seats = parsed.seats.map((s, idx) => ({
                        seat_no: s.seat_no || s.number || idx + 1,
                        status: s.status || 'free',
                    }));
                }
            }
        } catch (_) {
            // ignore
        }

        if (!seats || seats.length === 0) {
            seats = generateSeatGrid(trip.capacity, trip.free_seats);
        }

        res.json({
            data: {
                id: trip.id,
                date: trip.date,
                status: trip.status,
                free_seats: trip.free_seats,
                capacity: trip.capacity,
                vehicle_id: trip.vehicle_id,
                seats,
                priceFrom: typeof trip.price_from === 'number' ? trip.price_from : (trip.base_price || 0),
            },
            traceId: res.locals.traceId,
        });
    })
);

module.exports = router;
