'use strict';

module.exports = (err, req, res, next) => {
    const traceId = res.locals.traceId || 'n/a';
    const status = err.status || err.code || 500;
    const message = err.message || 'Internal Server Error';
    // Логи: человекочитаемо, без секретов
    console.error(`[${traceId}] ${req.method} ${req.originalUrl} -> ${status} ${message}`);
    res.status(status).json({ error: { message, code: status }, traceId });
};
