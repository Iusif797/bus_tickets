'use strict';

require('dotenv').config();

const express = require('express');
const helmet = require('helmet');
const hpp = require('hpp');
const cors = require('cors');
const morgan = require('morgan');

const rateLimiter = require('./src/middleware/rateLimit');
const requestId = require('./src/middleware/requestId');
const errorHandler = require('./src/middleware/error');

const publicRoutes = require('./src/routes/public');
const salesRoutes = require('./src/routes/sales');
const partnersRoutes = require('./src/routes/partners');

const app = express();
// Безопасная настройка trust proxy: не допускаем boolean true.
// Значения: 'false'|'0' -> false; 'loopback' (по умолчанию) или любой список подсетей/IP.
(() => {
  const raw = (process.env.TRUST_PROXY || 'loopback').toLowerCase().trim();
  if (raw === 'false' || raw === '0' || raw === 'off') {
    app.set('trust proxy', false);
  } else if (raw === 'true' || raw === '1' || raw === 'on') {
    app.set('trust proxy', 'loopback');
  } else {
    app.set('trust proxy', raw);
  }
})();

const allowedOrigins = (process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

app.use(helmet());
app.use(hpp());
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error('CORS not allowed'), false);
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: false,
  })
);
app.use(express.json({ limit: '1mb' }));

app.use(requestId);

morgan.token('traceId', (req, res) => res.locals.traceId || '-');
app.use(morgan(':method :url :status :res[content-length] - :response-time ms traceId=:traceId'));

app.use(rateLimiter);

// Basic health and root checks
app.get('/', (req, res) => {
  res.json({ ok: true, service: 'bus-ticket-api-gateway' });
});
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api', publicRoutes);
app.use('/api', salesRoutes);
app.use('/api', partnersRoutes);

app.use((req, res) => {
  res.status(404).json({ error: { message: 'Not Found', code: 404 }, traceId: res.locals.traceId });
});

app.use(errorHandler);

const port = Number(process.env.PORT) || 3001;
app.listen(port, () => {
  // Человекочитаемый лог без секретов
  console.log(`API-gateway listening on http://localhost:${port}`);
});
