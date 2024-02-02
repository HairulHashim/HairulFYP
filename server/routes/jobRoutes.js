// server/routes/jobRoutes.js
const express = require("express");
const multer = require('multer');
const path = require('path');
const router = express.Router();
const http = require('http');
const socketIo = require('socket.io');


const JobModel = require('../models/Job');
const WorkerModel = require('../models/Worker');
const ProviderModel = require('../models/Provider');

// Set up storage for multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/payments');  // Specify the directory to store uploaded files
    },
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname);
        const uniqueFilename = 'payment_' + `${Date.now()}${ext}`;
        cb(null, uniqueFilename);
    },
});

const upload = multer({ storage: storage });


// Fetch available jobs
router.get('/availableJobs', async (req, res) => {
    try {
        const jobs = await JobModel.find({ job_status: { $in: ['Open', 'Running', 'Fulled'] } });
        res.json(jobs);
    } catch (error) {
        console.error('Error fetching available jobs:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Fetch pending jobs
router.get('/pendingJobs/:workerId', async (req, res) => {
    try {
        const workerId = req.params.workerId;

        const jobs = await JobModel.find({
            job_status: { $in: ['Open', 'Running', 'Fulled'] },
            booked_worker: {
                $elemMatch: {
                    worker_id: workerId,
                    book_status: 'Pending'
                }
            }
        });

        res.json(jobs);
    } catch (error) {
        console.error('Error fetching available jobs:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Fetch confirmed jobs
router.get('/confirmedJobs/:workerId', async (req, res) => {
    try {
        const workerId = req.params.workerId;

        const jobs = await JobModel.find({
            job_status: { $in: ['Open', 'Running', 'Fulled'] },
            booked_worker: {
                $elemMatch: {
                    worker_id: workerId,
                    book_status: { $in: ['Confirmed'] }
                }
            }
        });

        res.json(jobs);
    } catch (error) {
        console.error('Error fetching available jobs:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Fetch attended jobs
router.get('/onGoingJobs/:workerId', async (req, res) => {
    try {
        const workerId = req.params.workerId;

        const jobs = await JobModel.find({
            job_status: { $in: ['Open', 'Running', 'Fulled'] },
            booked_worker: {
                $elemMatch: {
                    worker_id: workerId,
                    book_status: { $in: ['Attended', 'Started', 'Completed'] }
                }
            }
        });

        res.json(jobs);
    } catch (error) {
        console.error('Error fetching available jobs:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Fetch completed jobs
router.get('/completedJobs/:workerId', async (req, res) => {
    try {
        const workerId = req.params.workerId;

        const jobs = await JobModel.find({
            job_status: { $in: ['Completed']},
            booked_worker: {
                $elemMatch: {
                    worker_id: workerId,
                    book_status: { $in: ['Completed', 'Cancelled', 'Rejected', 'Missing'] },
                    clock_in_time: { $exists: true },
                    clock_out_time: { $exists: true },
                    clock_in_date: { $exists: true },
                    clock_out_date: { $exists: true }
                }
            }
        });

        // Calculate work hours and payment for each job
        const jobsWithWorkAndPayment = jobs.map(job => {
            const completedBookedWorker = job.booked_worker.find(worker => (
                worker.worker_id.toString() === workerId &&
                worker.book_status === 'Completed'
            ));

            if (completedBookedWorker) {
                // Parse start and end times
                const parsedClockInTime = new Date(`2000-01-01T${completedBookedWorker.clock_in_time}`);
                const parsedClockOutTime = new Date(`2000-01-01T${completedBookedWorker.clock_out_time}`);
                
                let timeDifference = parsedClockOutTime - parsedClockInTime;

                // Adjust the clockOutTime to the next day if it is after the clockInTime
                if (parsedClockOutTime < parsedClockInTime) {
                    const millisecondsInDay = 1000 * 60 * 60 * 24;
                    timeDifference += millisecondsInDay;
                }

                const millisecondsInHour = 1000 * 60 * 60;
                const workHours = Math.floor(timeDifference / millisecondsInHour);

                // Calculate payment for the job
                const workPayment = Math.floor(workHours) * job.job_rate;

                // Add the calculated work hours and payment to the job object
                return {
                    ...job.toObject(),
                    workHours: workHours,
                    workPayment: workPayment
                };
            } else {
                // If no "Completed" entry found, return the job without workHours and payment
                return job.toObject();
            }
        });

        res.json(jobsWithWorkAndPayment);
    } catch (error) {
        console.error('Error fetching completed jobs with work hours and payment:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});


// Fetch past jobs
router.get('/pastJobs/:workerId', async (req, res) => {
    try {
        const workerId = req.params.workerId;

        const jobs = await JobModel.find({
            job_status: { $in: ['Completed'] },
            booked_worker: {
                $elemMatch: {
                    worker_id: workerId,
                    book_status: { $in: ['Cancelled', 'Missing'] }
                }
            }
        });

        res.json(jobs);
    } catch (error) {
        console.error('Error fetching available jobs:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Endpoint to get  job details
router.get('/jobDetails/:jobId', async (req, res) => {
    try {
        const jobId = req.params.jobId;

        // Find all job details
        const jobDetails = await JobModel.findById(jobId);

        // Check if there are any jobs
        if (!jobDetails ) {
            return res.status(404).json({ message: 'No jobs found' });
        }

        // Send the job details in the response
        res.status(200).json(jobDetails);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Book/Cancel a job
router.post('/bookJob/:jobId/:workerId', async (req, res) => {
    const { jobId, workerId } = req.params;

    try {
        const job = await JobModel.findById(jobId);

        // Check if the worker is already booked for the job
        const isWorkerAlreadyBooked = job.booked_worker.some(worker => worker.worker_id.equals(workerId) && worker.book_status === 'Pending');

        // Count the length of confirmed worker
        const confirmedWorkersCount = job.booked_worker.filter(worker => worker.book_status === 'Confirmed').length;


        if (isWorkerAlreadyBooked) {
            return res.status(400).json({ message: 'Worker is already booked for the job.' });
        }

        // Check if there are available slots
        if (confirmedWorkersCount < job.required_worker) {
            // Book the job for the worker
            job.booked_worker.push({ worker_id: workerId, book_status: 'Pending' });
            await job.save();

            // Add the job to the worker's booked jobs
            await WorkerModel.findByIdAndUpdate(workerId, { $push: { bookedJobs: jobId } });

            return res.json({ message: 'Job booked successfully' });
        } else {
            return res.status(400).json({ message: 'Job is fully booked.' });
        }
    } catch (error) {
        console.error('Error booking job:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Define the route for canceling a job
router.post('/cancelJob/:jobId/:workerId', async (req, res) => {
    const { jobId, workerId } = req.params;
    const { cancelReason } = req.body;

    try {
        // Find the job with the given jobId
        const job = await JobModel.findById(jobId);

        // Find the booked worker entry for the given workerId
        const bookedWorkerIndex = job.booked_worker.findIndex(booking => booking.worker_id.equals(workerId) && (booking.book_status === 'Pending' || booking.book_status === 'Confirmed'));

        if (bookedWorkerIndex === -1) {
            return res.status(404).json({ message: 'Booking not found.' });
        }

        // Get the booked worker entry
        const bookedWorker = job.booked_worker[bookedWorkerIndex];

        // If the book_status is "Confirmed", mark it as "Cancelled" and set cancellation details
        if (bookedWorker.book_status === 'Confirmed') {
            bookedWorker.book_status = 'Cancelled';

            // Get the current time and format it in 24-hour format
            const currentDateTime = new Date();
            const currentCancelTime = currentDateTime.toLocaleTimeString('en-US', { hour12: false });

            // Get the current date and format it
            const currentDate = currentDateTime.toISOString().split('T')[0];

            // Set the cancel_time and cancel_date in the bookedWorker
            bookedWorker.cancel_time = currentCancelTime;
            bookedWorker.cancel_date = currentDate;
            bookedWorker.cancel_reason = cancelReason;

        } else if (bookedWorker.book_status === 'Pending') {
            // If the book_status is "Pending", remove the booking from the array
            job.booked_worker.splice(bookedWorkerIndex, 1);
        }

        // Save the changes to the job document
        await job.save();

        res.json({ message: 'Booking successfully cancelled.' });
    } catch (error) {
        console.error('Error cancelling job:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Define the route for clock in a job
router.post('/clockIn/:jobId', async (req, res) => {
    const { jobId } = req.params;
    const { selectedWorkers } = req.body;

    try {
        console.log('Updating workers for job ID:', jobId, 'Selected Workers:', selectedWorkers);

        const currentTime = new Date().toLocaleTimeString('en-US', { hour12: false });
        const currentDate = new Date().toISOString(); // Get current date and time in ISO format

        // Update the book_status and add clock_in_time for each selected worker in the database using arrayFilters
        await JobModel.updateMany(
            { _id: jobId },
            {
                $set: {
                    'booked_worker.$[elem].book_status': 'Started',
                    'booked_worker.$[elem].clock_in_time': currentTime,
                    'booked_worker.$[elem].clock_in_date': currentDate
                }
            },
            {
                arrayFilters: [
                    { 'elem._id': { $in: selectedWorkers } }
                ]
            }
        );

        // Fetch the updated job
        const updatedJob = await JobModel.findById(jobId);

        console.log('Job after update:', updatedJob);

        res.json({ message: 'Selected workers updated successfully' });
    } catch (error) {
        console.error('Error updating workers:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Define the route for clock out a job
router.post('/clockOut/:jobId', async (req, res) => {
    const { jobId } = req.params;
    const { selectedWorkers } = req.body;

    try {
        console.log('Updating workers for job ID:', jobId, 'Selected Workers:', selectedWorkers);

        const currentTime = new Date().toLocaleTimeString('en-US', { hour12: false });
        const currentDate = new Date().toISOString(); // Get current date and time in ISO format

        // Update the book_status and add clock_out_time for each selected worker in the database using arrayFilters
        await JobModel.updateMany(
            { _id: jobId },
            {
                $set: {
                    'booked_worker.$[elem].book_status': 'Completed',
                    'booked_worker.$[elem].clock_out_time': currentTime,
                    'booked_worker.$[elem].clock_out_date': currentDate,
                    'booked_worker.$[elem].payment_status': 'Waiting'
                }
            },
            {
                arrayFilters: [
                    { 'elem._id': { $in: selectedWorkers } }
                ]
            }
        );

        // Fetch the updated job
        const updatedJob = await JobModel.findById(jobId);

        console.log('Job after update:', updatedJob);

        res.json({ message: 'Selected workers updated successfully' });
    } catch (error) {
        console.error('Error updating workers:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Fetch Open Posted Jobs From Provider
router.get('/openPostedJobs/:providerId', async (req, res) => {
    const { providerId } = req.params;
    
    try {
        const jobs = await JobModel.find({ job_status: 'Open', provider_id: providerId });
        
        if (!jobs || jobs.length === 0) {
            return res.status(404).json({ message: 'Job not found' });
        }
        
        res.json(jobs);
    } catch (error) {
        console.error('Error fetching open posted jobs:', error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
});

// Fetch Completed Posted Jobs From Provider
router.get('/completedPostedJobs/:providerId', async (req, res) => {
    const { providerId } = req.params;
    
    try {
        const jobs = await JobModel.find({ job_status: 'Completed', provider_id: providerId });
        
        if (!jobs || jobs.length === 0) {
            return res.status(404).json({ message: 'Job not found' });
        }
        
        res.json(jobs);
    } catch (error) {
        console.error('Error fetching completed posted jobs:', error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
});

// Fetch posted jobs
router.get('/pendingPostedJobs', async (req, res) => {
    try {
        const jobs = await JobModel.find({ job_status: 'Pending' });
        res.json(jobs);
    } catch (error) {
        console.error('Error fetching posted jobs:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Create a job post
router.post('/createJobPost/:providerId', async (req, res) => {
    const providerId = req.params.providerId;
    const { title, description, address, location, linkLocation, startDate, startTime, endDate, endTime, jobHours, jobRate, requiredWorker } = req.body;
    try {
        // Check if the provider exists
        const provider = await ProviderModel.findById(providerId);
        if (!provider) {
            return res.status(404).json({ message: 'Provider not found' });
        }

        // Create a new job post
        const newJob = await JobModel.create({
            title,
            description,
            address,
            location,
            link_location: linkLocation,
            start_date: startDate,
            start_time: startTime,
            end_date: endDate,
            end_time: endTime,
            job_hours: jobHours,
            job_rate: jobRate,
            required_worker: requiredWorker,
            job_status: 'Open', // Set the initial job status to 'Open'
            booked_worker: [], // Initialize the booked_worker array as an empty array
            provider_id: providerId,
        });

        // Add the job to the provider's posted jobs
        await ProviderModel.findByIdAndUpdate(providerId, { $push: { postedJobs: newJob._id } });

        res.json({ message: 'Job post created successfully', job: newJob });
    } catch (error) {
        console.error('Error creating job post:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Endpoint to get booked workers for a job
router.get('/bookedWorkers/:jobId', async (req, res) => {
    const { jobId } = req.params;
    console.log('Received request for jobId:', jobId);

    try {
        console.log('Fetching booked workers for job ID:', jobId);

        const job = await JobModel.findById(jobId);

        if (!job) {
            console.log('Job not found');
            return res.status(404).json({ message: 'Job not found' });
        }

        const bookedWorkers = await Promise.all(job.booked_worker.map(async (booking) => {
            const worker = await WorkerModel.findById(booking.worker_id);

            // Calculate additional information
            const completedJobs = job.booked_worker.filter((job) => job.book_status === 'Completed').length;
            const cancelledJobs = job.booked_worker.filter((job) => job.book_status === 'Cancelled').length;
            const missingJobs = job.booked_worker.filter((job) => job.book_status === 'Missing').length;

            return {
                _id: booking._id,
                worker_id: {
                    worker_id: worker._id,
                    name: worker.name,
                    email: worker.email,
                    // Add other worker details as needed
                },
                book_status: booking.book_status,
            
            };
        }));

        console.log('Fetched booked workers:', bookedWorkers);

        res.status(200).json(bookedWorkers);
    } catch (error) {
        console.error('Error fetching booked workers:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Endpoint to get pending booked workers for a job
router.get('/pendingBookedWorkers/:jobId', async (req, res) => {
    const { jobId } = req.params;
    console.log('Received request for jobId:', jobId);

    try {
        console.log('Fetching booked workers for job ID:', jobId);

        const job = await JobModel.findById(jobId);

        if (!job) {
            console.log('Job not found');
            return res.status(404).json({ message: 'Job not found' });
        }

        const filteredBookedWorkers = job.booked_worker.filter(
            booking => booking.book_status === 'Pending'
        );

        const bookedWorkers = await Promise.all(filteredBookedWorkers.map(async (booking) => {
            const worker = await WorkerModel.findById(booking.worker_id);


            // Calculate additional information
            const completedJobs = job.booked_worker.filter((job) => job.book_status === 'Completed').length;
            const cancelledJobs = job.booked_worker.filter((job) => job.book_status === 'Cancelled').length;
            const missingJobs = job.booked_worker.filter((job) => job.book_status === 'Missing').length;

            return {
                _id: booking._id,
                worker_id: {
                    worker_id: worker._id,
                    name: worker.name,
                    email: worker.email,
                    // Add other worker details as needed
                },
                book_status: booking.book_status,
                totalCompleted: completedJobs,
                totalCancelled: cancelledJobs,
                totalMissing: missingJobs,
                averageRatingCompletedJobs: completedJobs > 0
                    ? job.booked_worker.reduce((sum, job) => sum + job.worker_rating, 0) / completedJobs
                    : 0,
            };
        }));

        console.log('Fetched booked workers:', bookedWorkers);

        res.status(200).json(bookedWorkers);
    } catch (error) {
        console.error('Error fetching booked workers:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Endpoint to get confirmed booked workers for a job
router.get('/confirmedBookedWorkers/:jobId', async (req, res) => {
    const { jobId } = req.params;
    console.log('Received request for jobId:', jobId);

    try {
        console.log('Fetching booked workers for job ID:', jobId);

        const job = await JobModel.findById(jobId);

        if (!job) {
            console.log('Job not found');
            return res.status(404).json({ message: 'Job not found' });
        }

        const filteredBookedWorkers = job.booked_worker.filter(
            booking => booking.book_status === 'Confirmed' || booking.book_status === 'Attended' || booking.book_status === 'Started' || booking.book_status === 'Completed'
        );

        const bookedWorkers = await Promise.all(filteredBookedWorkers.map(async (booking) => {
            const worker = await WorkerModel.findById(booking.worker_id);

            // Calculate additional information
            const completedJobs = filteredBookedWorkers.filter((job) => job.book_status === 'Completed').length;
            const cancelledJobs = filteredBookedWorkers.filter((job) => job.book_status === 'Cancelled').length;
            const missingJobs = filteredBookedWorkers.filter((job) => job.book_status === 'Missing').length;

            return {
                _id: booking._id,
                worker_id: {
                    worker_id: worker._id,
                    name: worker.name,
                    email: worker.email,
                    // Add other worker details as needed
                },
                book_status: booking.book_status,
                clock_in_time: booking.clock_in_time,
                clock_out_time: booking.clock_out_time,
                totalCompleted: completedJobs,
                totalCancelled: cancelledJobs,
                totalMissing: missingJobs,
                averageRatingCompletedJobs: completedJobs > 0
                    ? filteredBookedWorkers.reduce((sum, job) => sum + job.worker_rating, 0) / completedJobs
                    : 0,
            };
        }));

        console.log('Fetched booked workers:', bookedWorkers);

        res.status(200).json(bookedWorkers);
    } catch (error) {
        console.error('Error fetching booked workers:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Endpoint to get completed booked workers for a job
router.get('/completedBookedWorkers/:jobId', async (req, res) => {
    const { jobId } = req.params;
    console.log('Received request for jobId:', jobId);

    try {
        console.log('Fetching booked workers for job ID:', jobId);

        const job = await JobModel.findById(jobId);

        if (!job) {
            console.log('Job not found');
            return res.status(404).json({ message: 'Job not found' });
        }

        const filteredBookedWorkers = job.booked_worker.filter(
            booking => booking.book_status === 'Completed'
        );

        const bookedWorkers = await Promise.all(filteredBookedWorkers.map(async (booking) => {
            const worker = await WorkerModel.findById(booking.worker_id);

            // Calculate additional information
            const completedJobs = filteredBookedWorkers.filter((job) => job.book_status === 'Completed').length;
            const cancelledJobs = filteredBookedWorkers.filter((job) => job.book_status === 'Cancelled').length;
            const missingJobs = filteredBookedWorkers.filter((job) => job.book_status === 'Missing').length;

            return {
                _id: booking._id,
                worker_id: {
                    worker_id: worker._id,
                    name: worker.name,
                    email: worker.email,
                    // Add other worker details as needed
                },
                book_status: booking.book_status,
                clock_in_time: booking.clock_in_time,
                clock_out_time: booking.clock_out_time,
                worker_rating: booking.worker_rating,
                payment_status: booking.payment_status,
                payment_proof: booking.payment_proof,
                totalCompleted: completedJobs,
                totalCancelled: cancelledJobs,
                totalMissing: missingJobs,
                averageRatingCompletedJobs: completedJobs > 0
                    ? filteredBookedWorkers.reduce((sum, job) => sum + job.worker_rating, 0) / completedJobs
                    : 0,
            };
        }));

        console.log('Fetched booked workers:', bookedWorkers);

        res.status(200).json(bookedWorkers);
    } catch (error) {
        console.error('Error fetching booked workers:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Endpoint to get job statistics for a worker
router.get('/workerJobStats/:workerId', async (req, res) => {
    const { workerId } = req.params;

    try {
        // Fetch completed jobs for the worker
        const completedJobs = await JobModel.find({
            'booked_worker.worker_id': workerId,
            'booked_worker.book_status': 'Completed',
        });

        const totalCancelled = await JobModel.countDocuments({
            'booked_worker.worker_id': workerId,
            'booked_worker.book_status': 'Cancelled',
        });
        
        const totalMissing = await JobModel.countDocuments({
            'booked_worker.worker_id': workerId,
            'booked_worker.book_status': 'Missing',
        });
        
        const totalCompleted = completedJobs.length;
        ;
        // Calculate the average star rating for completed jobs
        const averageRatingCompletedJobs =
            totalCompleted > 0
                ? completedJobs.reduce((sum, job) => sum + job.booked_worker[0].worker_rating, 0) / totalCompleted
                : 0;

        res.status(200).json({
            totalCompleted,
            totalCancelled,
            totalMissing,
            averageRatingCompletedJobs,
        });

    } catch (error) {
        console.error('Error fetching job statistics:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Endpoint to get worker history for a worker
router.get('/workerHistory/:workerId', async (req, res) => {
    const { workerId } = req.params;
    console.log('Received request for workerId:', workerId);

    try {
        console.log('Fetching worker history for worker ID:', workerId);

        // Find jobs where the specified worker has a book_status of 'Completed'
        const workerHistory = await JobModel.find({
            'booked_worker.worker_id': workerId
        });

        if (workerHistory.length === 0) {
            console.log('No worker history found');
            return res.status(404).json({ message: 'No worker history found' });
        }

        const formattedWorkerHistory = workerHistory.map(job => ({
            _id: job._id,
            title: job.title,
            description: job.description,
            book_status: job.booked_worker[0].book_status,
            worker_hours: job.booked_worker[0].worker_hours,
            payment_total: job.booked_worker[0].payment_total,
            worker_rating: job.booked_worker[0].worker_rating,
            payment_status: job.booked_worker[0].payment_status,
            cancel_reason: job.booked_worker[0].cancel_reason,
            cancel_date: job.booked_worker[0].cancel_date,
            cancel_time: job.booked_worker[0].cancel_time,
            // Add other job details as needed
        }));

        console.log('Fetched worker history:', formattedWorkerHistory);

        res.status(200).json(formattedWorkerHistory);
    } catch (error) {
        console.error('Error fetching worker history:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Endpoint to reject selected workers
router.post('/approveWorkers/:jobId', async (req, res) => {
    const { jobId } = req.params;
    const { selectedWorkers } = req.body;

    try {
        console.log('Updating workers for job ID:', jobId, 'Selected Workers:', selectedWorkers);

        // Update the book_status for each selected worker in the database using arrayFilters
        await JobModel.updateMany(
            { _id: jobId },
            {
                $set: {
                    'booked_worker.$[elem].book_status': 'Confirmed'
                }
            },
            {
                arrayFilters: [
                    { 'elem._id': { $in: selectedWorkers } }
                ]
            }
        );

        // Fetch the updated job
        const updatedJob = await JobModel.findById(jobId);

        console.log('Job after update:', updatedJob);

        res.json({ message: 'Selected workers updated successfully' });
    } catch (error) {
        console.error('Error updating workers:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Endpoint to reject selected workers
router.post('/rejectWorkers/:jobId', async (req, res) => {
    const { jobId } = req.params;
    const { selectedWorkers } = req.body;

    try {
        console.log('Updating workers for job ID:', jobId, 'Selected Workers:', selectedWorkers);

        // Update the book_status for each selected worker in the database using arrayFilters
        await JobModel.updateMany(
            { _id: jobId },
            {
                $set: {
                    'booked_worker.$[elem].book_status': 'Rejected'
                }
            },
            {
                arrayFilters: [
                    { 'elem._id': { $in: selectedWorkers } }
                ]
            }
        );

        // Fetch the updated job
        const updatedJob = await JobModel.findById(jobId);

        console.log('Job after update:', updatedJob);

        res.json({ message: 'Selected workers updated successfully' });
    } catch (error) {
        console.error('Error updating workers:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Route to mark a job as attended by the worker
router.post('/attendJob/:jobId/:workerId', async (req, res) => {
    const { jobId, workerId } = req.params;

    try {
        const job = await JobModel.findById(jobId);

        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }

        // Find the booked worker for the specified workerId
        const bookedWorker = job.booked_worker.find(booking => booking.worker_id.equals(workerId) && booking.book_status === "Confirmed");

        if (!bookedWorker) {
            return res.status(404).json({ message: 'Worker not found for this job' });
        }

        // Update the book_status to 'Attended'
        bookedWorker.book_status = 'Attended';

        // Save the changes
        await job.save();

        res.json({ message: 'Job marked as attended' });
    } catch (error) {
        console.error('Error attending job:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Define the route for ending a job
router.post('/endJob/:jobId', async (req, res) => {
    const { jobId } = req.params;

    try {
        console.log('Ending job for job ID:', jobId);

        const currentTime = new Date().toLocaleTimeString('en-US', { hour12: false });
        const currentDate = new Date().toISOString();

        // Update the book_status for each worker based on their current status
        await JobModel.updateMany(
            { _id: jobId },
            {
                $set: {
                    'booked_worker.$[elem].book_status': 'Completed',
                    'booked_worker.$[elem].clock_out_time': currentTime,
                    'booked_worker.$[elem].clock_out_date': currentDate,
                    'booked_worker.$[elem].payment_status': 'Waiting'
                }
            },
            {
                arrayFilters: [
                    { 'elem.book_status': { $in: ['Attended', 'Started'] } }
                ]
            }
        );

        // Update the book_status for workers with 'Pending' or 'Confirmed' status to 'Rejected'
        await JobModel.updateMany(
            { _id: jobId },
            {
                $set: {
                    'booked_worker.$[elem].book_status': 'Rejected'
                }
            },
            {
                arrayFilters: [
                    { 'elem.book_status': { $in: ['Pending', 'Confirmed'] } }
                ]
            }
        );

        // Update the job_status to 'Completed'
        await JobModel.updateOne(
            { _id: jobId },
            { $set: { job_status: 'Completed' } }
        );

        // Fetch the updated job
        const updatedJob = await JobModel.findById(jobId);

        console.log('Job after update:', updatedJob);

        res.json({ message: 'Job ended successfully' });
    } catch (error) {
        console.error('Error ending job:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Update the worker rating for a specific job and worker
router.post('/rateWorker/:jobId/:workerId', async (req, res) => {
    const { jobId, workerId } = req.params;
    const { rating } = req.body;

    try {
        console.log(`Received rating ${rating} for worker ${workerId} on job ${jobId}`);

        // Assume you have a WorkerModel for worker details
        // Update the worker_rating field for the specified worker in the booked_worker array
        const result = await JobModel.updateOne(
            { _id: jobId, 'booked_worker._id': workerId },
            { $set: { 'booked_worker.$.worker_rating': rating } }
        );

        console.log('MongoDB Update Result:', result);

        const updatedJob = await JobModel.findById(jobId);
        console.log('Updated Job Document:', updatedJob);

        res.json({ message: 'Worker rated successfully' });
    } catch (error) {
        console.error('Error rating worker:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Update the worker payment proof for a specific job and worker
router.post('/uploadPaymentProof/:jobId/:workerId', upload.single('file'), async (req, res) => {
    const { jobId, workerId } = req.params;
    const filePath = req.file.path;

    try {
        console.log(`Received payment proof upload for worker ${workerId} on job ${jobId}`);
        console.log('File Path:', filePath);

        // Check if 'payment_proof' exists in the specified worker
        const existingJob = await JobModel.findById(jobId);
        const existingWorker = existingJob.booked_worker.find(worker => worker._id == workerId);
        
        if (existingWorker && existingWorker.payment_proof) {
            // Remove only the existing 'payment_proof'
            const removedProof = await JobModel.findByIdAndUpdate(
                jobId,
                { $unset: { 'booked_worker.$[element].payment_proof': 1 } },
                { arrayFilters: [{ 'element._id': workerId }] }
            );
            console.log('Removed existing payment proof:', removedProof);
        }

        // Update the payment_proof field for the specified worker in the booked_worker array
        const result = await JobModel.findByIdAndUpdate(
            jobId,
            { $set: { 'booked_worker.$[element].payment_proof': path.basename(filePath), 'booked_worker.$[element].payment_status': 'Pending'} },
            { arrayFilters: [{ 'element._id': workerId }] }
        );        

        console.log('MongoDB Update Result:', result);

        const updatedJob = await JobModel.findById(jobId);
        console.log('Updated Job Document:', updatedJob);
        res.json({ message: 'Payment proof uploaded successfully' });

    } catch (error) {
        console.error('Error uploading payment proof:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Define a route to view payment proof files
router.get('/viewPaymentProof/:filePath', (req, res) => {
    const { filePath } = req.params;
    const fullPath = path.join(__dirname, '../public/payments', filePath);

    // Use res.sendFile to send the file to the client
    res.sendFile(fullPath);
});

// Add more job-related routes as needed

module.exports = router;
