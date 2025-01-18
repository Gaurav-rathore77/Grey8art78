// routes/auth.js

const express = require('express');
const router = express.Router();
const authController = require('../controller/authController');

// Signup Route
router.post('/signup', authController.signup);

// Login Route
router.post('/login', authController.login);

module.exports = router;
