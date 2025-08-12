'use strict';

const axios = require('axios');

let sessionCookie = null;
let lastAuthAt = 0;

function ensureEnv() {
    const { ODOO_URL, ODOO_DB, ODOO_LOGIN, ODOO_API_KEY } = process.env;
    if (!ODOO_URL || !ODOO_DB || !ODOO_LOGIN || !ODOO_API_KEY) {
        const err = new Error('Odoo credentials are not configured');
        err.status = 500;
        throw err;
    }
    return { ODOO_URL, ODOO_DB, ODOO_LOGIN, ODOO_API_KEY };
}

async function odooAuth() {
    const { ODOO_URL, ODOO_DB, ODOO_LOGIN, ODOO_API_KEY } = ensureEnv();
    if (sessionCookie && Date.now() - lastAuthAt < 10 * 60 * 1000) {
        return sessionCookie;
    }
    const url = new URL('/web/session/authenticate', ODOO_URL).toString();
    try {
        const payload = {
            jsonrpc: '2.0',
            params: { db: ODOO_DB, login: ODOO_LOGIN, password: ODOO_API_KEY },
        };
        const resp = await axios.post(url, payload, {
            headers: { 'Content-Type': 'application/json' },
        });
        const setCookie = resp.headers['set-cookie'];
        if (!setCookie || !setCookie.length) {
            const e = new Error('Failed to authenticate to Odoo');
            e.status = 401;
            throw e;
        }
        sessionCookie = setCookie.map((c) => c.split(';')[0]).join('; ');
        lastAuthAt = Date.now();
        return sessionCookie;
    } catch (err) {
        const e = new Error('Odoo authentication failed');
        e.status = 401;
        throw e;
    }
}

async function callKw({ model, method, args = [], kwargs = {} }) {
    const { ODOO_URL } = ensureEnv();
    const url = new URL('/web/dataset/call_kw', ODOO_URL).toString();
    let cookie = await odooAuth();
    const payload = { jsonrpc: '2.0', params: { model, method, args, kwargs } };
    try {
        const resp = await axios.post(url, payload, {
            headers: { 'Content-Type': 'application/json', Cookie: cookie },
            timeout: 15000,
        });
        const data = resp.data;
        if (data && typeof data === 'object' && 'result' in data) return data.result;
        if (data && data.error) {
            const e = new Error(data.error?.data?.message || 'Odoo error');
            e.status = 502;
            throw e;
        }
        return data;
    } catch (err) {
        const msg =
            (err.response && err.response.data && err.response.data.error && err.response.data.error.data && err.response.data.error.data.message) ||
            err.message ||
            'Odoo call failed';
        if (String(msg).toLowerCase().includes('session') || (err.response && err.response.status === 401)) {
            cookie = await odooAuth();
            const resp2 = await axios.post(url, payload, {
                headers: { 'Content-Type': 'application/json', Cookie: cookie },
            });
            const data2 = resp2.data;
            if (data2 && typeof data2 === 'object' && 'result' in data2) return data2.result;
            const e2 = new Error(data2?.error?.data?.message || 'Odoo error');
            e2.status = 502;
            throw e2;
        }
        const e = new Error(msg);
        e.status = err.response?.status || 502;
        throw e;
    }
}

module.exports = { odooAuth, callKw };
