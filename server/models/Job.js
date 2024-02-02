//server/models/Job.js

const mongoose = require('mongoose');

const JobSchema = new mongoose.Schema({
    title: String,
    description: String,
    link_location: String,
    required_worker: Number, // Total number of workers needed for the job
    start_date: Date,
    end_date: Date,
    start_time: String,
    end_time: String,
    job_rate: Number,
    job_hours: Number,
    address: String,
    location: String,
    job_status: {
        type: String,
        enum: ['Pending', 'Open', 'Cancelled', 'Rejected', 'Fulled', 'Running', 'Completed'], // Define possible job statuses
        default: 'Pending', // Default status is 'Pending'
    },
    booked_worker: [
        {
            worker_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Worker' }, // Reference to the Worker model
            book_status: {
                type: String,
                enum: ['Pending', 'Confirmed', 'Rejected', 'Cancelled', 'Missing', 'Attended', 'Started', 'Completed'], // Define possible booking statuses
                default: 'Pending', // Default booking status is 'Pending'
            },
            cancel_reason: {
                type: String,
                enum: ['Health', 'Transportation', 'Urgency', 'Safety'], // Define possible cancel reason
            },
            clock_in_time:String,
            clock_in_date: Date,
            clock_out_time:String,
            clock_out_date: Date,
            cancel_date:Date,
            cancel_time:String,
            worker_hours:Number,
            payment_total:Number,
            worker_rating:Number,
            payment_status:{
                type: String,
                enum: ['Waiting', 'Pending', 'Rejected','Validated'], // Define possible payment statuses
            },
            payment_proof: String,
        },
    ],
    provider_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Provider' }, // Reference to the Provider model
});

const JobModel = mongoose.model("jobs", JobSchema);
module.exports = JobModel;
