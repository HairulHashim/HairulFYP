// server/routes/workerRoutes.js
const express = require("express");
const multer = require('multer');
const path = require('path'); // Add this line to import the 'path' module
const WorkerModel = require('../models/Worker');
const jwt = require('jsonwebtoken');
const authenticateJWT = require('./protectedRoutes'); // Import the middleware
const fs = require('fs');

const router = express.Router();

// Set up storage for multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/images/workers');  // Specify the directory to store uploaded files
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
        // Access the authenticated worker's information using req.user
        const worker = await WorkerModel.findById(req.user.workerId);
        res.json({ message: 'You accessed a protected route!', worker });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 'Internal Server Error' });
    }
});

// Worker SignIn
router.post('/signIn', async (req, res) => {
    const { email, password } = req.body;

    try {
        const worker = await WorkerModel.findOne({ email });

        if (worker && worker.password === password) {
            // Generate and send JWT upon successful login
            const token = jwt.sign({ workerId: worker._id }, 'your-secret-key');
            res.json({ status: 'Success', worker, token });
        } else {
            res.json({ status: 'Incorrect email or password' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 'Internal Server Error' });
    }
});

// Worker SignUp with Image Upload
router.post('/signUp', upload.single('image'), async (req, res) => {
    const { name, email, password, gender, dob, no_tel, home_address, status, designation } = req.body;
    const imagePath = req.file ? req.file.filename : null;

    try {
        const existingWorker = await WorkerModel.findOne({ email });

        if (existingWorker) {
            // Delete the uploaded image if the email is already registered
            if (imagePath) {
                const imagePathToDelete = path.join('public/images/workers', imagePath);
                fs.unlinkSync(imagePathToDelete);
            }

            return res.status(400).json({ message: 'Email is already registered.' });
        }

        const newWorkerData = {
            name,
            email,
            password,
            gender,
            dob,
            no_tel,
            home_address,
            status,
            designation,
            image: imagePath,
        };

        const newWorker = await WorkerModel.create(newWorkerData);
        res.json(newWorker);
    } catch (error) {
        if (error.code === 11000 && error.keyPattern && error.keyPattern.email) {
            // Duplicate key error for the email field
            // Delete the uploaded image if the email is already registered
            if (imagePath) {
                const imagePathToDelete = path.join('public/images/workers', imagePath);
                fs.unlinkSync(imagePathToDelete);
            }
            return res.status(400).json({ message: 'Email is already registered.' });
        }
        // Other errors
        // Delete the uploaded image if an error occurs
        if (imagePath) {
            const imagePathToDelete = path.join('public/images/workers', imagePath);
            fs.unlinkSync(imagePathToDelete);
        }
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Update worker details
router.post('/editDetails/:workerId', async (req, res) => {
    const workerId = req.params.workerId;
    const { name, email } = req.body;

    try {
        // Update worker details in the database
        const updatedWorker = await WorkerModel.findByIdAndUpdate(
            workerId,
            { $set: { name, email } },
            { new: true }
        );

        if (updatedWorker) {
            console.log('Updated Worker:', updatedWorker);
            res.json({ message: 'Worker details updated successfully', worker: updatedWorker });
        } else {
            console.log('Worker not found');
            res.status(404).json({ message: 'Worker not found' });
        }
    } catch (error) {
        console.error('Error updating worker details:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Endpoint to get worker details
router.get('/workerDetails/:workerId', async (req, res) => {
    try {
      const workerId = req.params.workerId;
  
      // Validate if workerId is a valid ObjectId
    //  if (!mongoose.Types.ObjectId.isValid(workerId)) {
    //    return res.status(400).json({ error: 'Invalid workerId' });
    //  }
  
      // Find the worker in the database by ID
      const worker = await WorkerModel.findById(workerId);
  
      // Check if the worker exists
      if (!worker) {
        return res.status(404).json({ error: 'Worker not found' });
      }
  
      // Send the worker details as a response
      res.json(worker);
    } catch (error) {
      console.error('Error getting worker details:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
});

// Update the worker profile picture
router.post('/uploadProfilePicture/:workerId', upload.single('file'), async (req, res) => {
    const workerId = req.params.workerId;
    const filePath = req.file.path;
  
    try {
      console.log(`Received profile image for worker ${workerId}`);
      console.log('File Path:', filePath);

      // Check if the worker already has an image
      const existingWorker = await WorkerModel.findById(workerId);
      if (existingWorker.image) {
          // Remove the existing image file
          const existingImagePath = path.join('public/images/workers', existingWorker.image);
          fs.unlinkSync(existingImagePath);
      }
  
      // Update the profile picture
      const result = await WorkerModel.findByIdAndUpdate(
        workerId,
        { $set: { 'image': path.basename(filePath) } },
      );
  
      console.log('MongoDB Update Result:', result);
  
      res.json({ message: 'Profile picture uploaded successfully' });
  
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
});

// Add a new route to serve worker profile images
router.get('/displayProfileImage/:workerId', async (req, res) => {
    try {
        const workerId = req.params.workerId;
        const worker = await WorkerModel.findById(workerId);

        if (!worker || !worker.image) {
            // If the worker or image doesn't exist, or the worker doesn't have an image, send a default image or handle it as needed
            return res.sendFile(path.resolve('public/default-profile-image.png'));
        }

        // Send the worker's profile image
        res.sendFile(path.resolve(`public/images/workers/${worker.image}`));
    } catch (error) {
        console.error('Error getting worker profile image:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
  
  module.exports = router;