// server/routes/adminRoutes.js
const express = require("express");
const AdminModel = require('../models/Admin');
const multer = require('multer');
const path = require('path');
const jwt = require('jsonwebtoken');
const authenticateJWT = require('./protectedRoutes'); // Import the middleware
const fs = require('fs');

const router = express.Router();

// Admin SignIn
router.post('/signIn', (req, res) => {
    const { username, password } = req.body;
    AdminModel.findOne({ username: username })
        .then(user => {
            if (user) {
                if (user.password === password) {
                    res.json({ status: 'Success', admin: user });
                } else {
                    res.json({ status: 'Incorrect password' });
                }
            } else {
                res.json({ status: 'Username not found' });
            }
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({ status: 'Internal Server Error' });
        });
});

module.exports = router;