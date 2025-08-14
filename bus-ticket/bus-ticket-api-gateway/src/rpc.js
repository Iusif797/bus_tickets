'use strict';

const { OdooClient } = require('./core/OdooClient');

const singleton = new OdooClient();

async function odooAuth() {
    return singleton.ensureSession();
}

async function callKw(params) {
    return singleton.callKw(params);
}

module.exports = { odooAuth, callKw };
