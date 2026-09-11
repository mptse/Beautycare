const express = require('express');
const router = express.Router();
const { login } = require('../controllers/authController');
const { limiteLogin } = require('../middleware/rateLimiter');

router.post('/login', limiteLogin, login);

module.exports = router;