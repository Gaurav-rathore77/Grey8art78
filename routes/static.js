// routes/static.js

const express = require('express');
const path = require('path');
const router = express.Router();

// Serve static files
router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'views', 'index.html'));
});

router.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'views', 'login.html'));
});

router.get('/signup', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'views', 'signup.html'));
});

module.exports = router;
