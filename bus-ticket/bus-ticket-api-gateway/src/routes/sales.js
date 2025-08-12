'use strict';

const express = require('express');
const { callKw } = require('../rpc');

const router = express.Router();
const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

router.post(
    '/reservations',
    asyncHandler(async (req, res) => {
        const { trip_id, seat_no } = req.body || {};
        if (!trip_id || !seat_no) {
            return res.status(400).json({
                error: { message: 'trip_id and seat_no are required', code: 400 },
                traceId: res.locals.traceId,
            });
        }
        const holdUntil = new Date(Date.now() + 15 * 60 * 1000).toISOString();
        const reservationId = await callKw({
            model: 'bus.reservation',
            method: 'create',
            args: [[{ trip_id, seat_no, hold_until: holdUntil }]],
            kwargs: {},
        });
        res.json({ data: { reservation_id: reservationId, hold_until: holdUntil }, traceId: res.locals.traceId });
    })
);

router.post(
    '/tickets/checkout',
    asyncHandler(async (req, res) => {
        const { trip_id, from_stop_id, to_stop_id, passenger } = req.body || {};
        if (!trip_id || !from_stop_id || !to_stop_id || !passenger?.name || !passenger?.email) {
            return res.status(400).json({
                error: {
                    message: 'trip_id, from_stop_id, to_stop_id and passenger{name,email} are required',
                    code: 400,
                },
                traceId: res.locals.traceId,
            });
        }
        const payload = {
            trip_id,
            from_stop_id,
            to_stop_id,
            passenger_name: passenger.name,
            passenger_email: passenger.email,
            state: 'INIT', // TODO: статусы оплаты/webhook
            price_total: 0, // TODO: реальный расчет цены
        };
        const ticketId = await callKw({ model: 'bus.ticket', method: 'create', args: [[payload]], kwargs: {} });
        res.json({ data: { ticket_id: ticketId }, traceId: res.locals.traceId });
    })
);

module.exports = router;
