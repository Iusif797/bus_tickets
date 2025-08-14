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
            args: [[{ trip_id, seat_no, hold_until: holdUntil, state: 'HOLD' }]],
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
            state: 'INIT', // TODO: обновить после оплаты
            price_total: 0, // TODO: подставить вычисленную цену
        };
        const ticketId = await callKw({ model: 'bus.ticket', method: 'create', args: [[payload]], kwargs: {} });
        res.json({ data: { ticket_id: ticketId }, traceId: res.locals.traceId });
    })
);

module.exports = router;
/**
 * Maintenance endpoint (optional): purge expired reservations.
 * Could be called by a cron or health job.
 * Requires Odoo model to provide a method that deletes by domain.
 */
// router.post('/maintenance/purge-expired', asyncHandler(async (req, res) => {
//   const nowIso = new Date().toISOString();
//   // If your Odoo has server action to purge, call it, otherwise emulate:
//   await callKw({
//     model: 'bus.reservation',
//     method: 'unlink_by_domain', // custom server method in Odoo
//     args: [[['hold_until', '<', nowIso], ['state', '=', 'HOLD']]],
//     kwargs: {},
//   });
//   res.json({ data: { purged: true }, traceId: res.locals.traceId });
// }));
