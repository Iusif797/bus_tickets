'use strict';

const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    trustProxy: false,
    keyGenerator: (req, _res) => req.ip || req.connection?.remoteAddress || 'unknown',
    message: { error: { message: 'Too many requests', code: 429 } },
});

module.exports = limiter;
