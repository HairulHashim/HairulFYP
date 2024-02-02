// server/routes/logoRoutes.js

const express = require("express");
const router = express.Router();
const path = require('path');

router.get('/logo', async (req, res) => {
    try {
        // Send the worker's profile image
        res.sendFile(path.resolve('public/images/logo/EventRecruit.png'));
    } catch (error) {
        console.error('Error getting worker profile image:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
