'use strict';

const { v4: uuidv4 } = require('uuid');

module.exports = (req, res, next) => {
    const traceId = uuidv4();
    res.locals.traceId = traceId;
    res.setHeader('X-Trace-Id', traceId);
    next();
};
