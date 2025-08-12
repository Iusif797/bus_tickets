'use strict';

const express = require('express');
const { callKw } = require('../rpc');

const router = express.Router();
const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

router.get(
    '/partners',
    asyncHandler(async (req, res) => {
        const partners = await callKw({
            model: 'res.partner',
            method: 'search_read',
            args: [[]],
            kwargs: { fields: ['id', 'name', 'email'], limit: 10, order: 'id desc' },
        });
        res.json({ data: partners, traceId: res.locals.traceId });
    })
);

router.post(
    '/partners',
    asyncHandler(async (req, res) => {
        const body = req.body || {};
        if (!body.name) {
            return res
                .status(400)
                .json({ error: { message: 'name is required', code: 400 }, traceId: res.locals.traceId });
        }
        const id = await callKw({ model: 'res.partner', method: 'create', args: [[body]], kwargs: {} });
        res.json({ data: { id }, traceId: res.locals.traceId });
    })
);

module.exports = router;
