//server/models/Worker.js

const mongoose = require('mongoose');

const WorkerSchema = new mongoose.Schema({
    no_ic: String,
    name: String,
    email: String,
    password: String,
    gender: {
        type: String,
        enum: ['Male', 'Female']
    },
    dob: Date,
    no_tel: String,
    status: String,
    image: String,
    home_address: String,
    status: {
        type: String,
        enum: ['Pending', 'Approve', 'Blocked', 'Rejected']
    },
    designation: String, // Add any additional fields here
});

const WorkerModel = mongoose.model("workers", WorkerSchema);
module.exports = WorkerModel;
