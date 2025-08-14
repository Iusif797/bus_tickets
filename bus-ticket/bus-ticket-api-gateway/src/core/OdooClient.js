'use strict';

const axios = require('axios');

class OdooClient {
    constructor() {
        this.sessionCookie = null;
        this.lastAuthAt = 0;
    }

    getConfig() {
        // Dev-friendly defaults to avoid terminal edits for .env during local testing
        const ODOO_URL = process.env.ODOO_URL || 'http://localhost:8069';
        const ODOO_DB = process.env.ODOO_DB || 'odoo';
        const ODOO_LOGIN = process.env.ODOO_LOGIN || 'test@test.cz';
        return { ODOO_URL, ODOO_DB, ODOO_LOGIN };
    }

    getPassword() {
        const { ODOO_API_KEY, ODOO_PASSWORD } = process.env;
        // Fall back to 'test' for local dev if neither API key nor password provided
        const password = ODOO_API_KEY || ODOO_PASSWORD || 'test';
        return password;
    }

    async ensureSession() {
        const { ODOO_URL, ODOO_DB, ODOO_LOGIN } = this.getConfig();
        const password = this.getPassword();

        if (this.sessionCookie && Date.now() - this.lastAuthAt < 10 * 60 * 1000) {
            return this.sessionCookie;
        }

        const url = new URL('/web/session/authenticate', ODOO_URL).toString();
        const payload = { jsonrpc: '2.0', params: { db: ODOO_DB, login: ODOO_LOGIN, password } };
        const resp = await axios.post(url, payload, {
            headers: { 'Content-Type': 'application/json' },
            validateStatus: (s) => s < 500,
        });
        const setCookie = resp.headers['set-cookie'];
        if (!setCookie || !setCookie.length) {
            const e = new Error('Failed to get Odoo session cookie');
            e.status = 401;
            throw e;
        }
        if (resp.data && resp.data.error) {
            const e = new Error(JSON.stringify(resp.data.error));
            e.status = 401;
            throw e;
        }
        this.sessionCookie = setCookie.map((c) => c.split(';')[0]).join('; ');
        this.lastAuthAt = Date.now();
        return this.sessionCookie;
    }

    async callKw({ model, method, args = [], kwargs = {} }) {
        const { ODOO_URL } = this.getConfig();
        const url = new URL('/web/dataset/call_kw', ODOO_URL).toString();
        let cookie = await this.ensureSession();
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
                cookie = await this.ensureSession();
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
}

module.exports = { OdooClient };


