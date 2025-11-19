const express = require('express');
const { makeAdminLoginHandler, makeAddAdminHandler } = require('../controllers/admin/auth.controller');

module.exports = function buildAdminAuthRouter(pool, JWT_SECRET) {
    const router = express.Router();

    router.post('/login', makeAdminLoginHandler(pool, JWT_SECRET));
    router.post('/add', makeAddAdminHandler(pool));

    return router;
};
