// server/routes/providerRoutes.js
const express = require("express");
const ProviderModel = require('../models/Provider');
const multer = require('multer');
const path = require('path');
const jwt = require('jsonwebtoken');
const authenticateJWT = require('./protectedRoutes'); // Import the middleware
const fs = require('fs');

const router = express.Router();

// Set up storage for multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/images/providers');  // Specify the directory to store uploaded files
    },
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname);
        const uniqueFilename = 'profile_' + `${Date.now()}${ext}`;
        cb(null, uniqueFilename);
    },
});

const upload = multer({ storage: storage });

// Protected route example
router.get('/protectedRoute', authenticateJWT, async (req, res) => {
    try {
        // Access the authenticated provider's information using req.user
        const provider = await ProviderModel.findById(req.user.providerId);
        res.json({ message: 'You accessed a protected route!', provider });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 'Internal Server Error' });
    }
});

// Provider SignUp with Image Upload
router.post('/signUp', upload.single('image'), async (req, res) => {
    const { ssm_number, name, email, password, doe, no_tel, address, owner_name } = req.body;
    const imagePath = req.file ? req.file.filename : null;

    try {
        const existingProvider = await ProviderModel.findOne({ email });

        if (existingProvider) {
            // Delete the uploaded image if the email is already registered
            if (imagePath) {
                const imagePathToDelete = path.join('public/images/providers', imagePath);
                fs.unlinkSync(imagePathToDelete);
            }

            return res.status(400).json({ message: 'Email is already registered.' });
        }

        const newProviderData = {
            ssm_number,
            name,
            email,
            owner_name,
            password,
            doe,
            no_tel,
            address,
            status: 'Pending' ,
            image: imagePath,
        };

        const newProvider = await ProviderModel.create(newProviderData);
        res.json(newProvider);
    } catch (error) {
        if (error.code === 11000 && error.keyPattern && error.keyPattern.email) {
            // Duplicate key error for the email field
            // Delete the uploaded image if the email is already registered
            if (imagePath) {
                const imagePathToDelete = path.join('public/images/providers', imagePath);
                fs.unlinkSync(imagePathToDelete);
            }
            return res.status(400).json({ message: 'Email is already registered.' });
        }
        // Other errors
        // Delete the uploaded image if an error occurs
        if (imagePath) {
            const imagePathToDelete = path.join('public/images/providers', imagePath);
            fs.unlinkSync(imagePathToDelete);
        }
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Provider SignIn
router.post('/signIn', (req, res) => {
    const { email, password } = req.body;
    ProviderModel.findOne({ email: email })
        .then(user => {
            if (user) {
                if (user.password === password) {
                    res.json({ status: 'Success', provider: user });
                } else {
                    res.json({ status: 'Incorrect password' });
                }
            } else {
                res.json({ status: 'Email not found' });
            }
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({ status: 'Internal Server Error' });
        });
});


module.exports = router;