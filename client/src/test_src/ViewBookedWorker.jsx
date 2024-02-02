// client/src/ViewBookedWorker.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useParams } from 'react-router-dom';
import axios from 'axios';

function ViewBookedWorker() {
    const { jobId } = useParams();
    const [bookedWorkers, setBookedWorkers] = useState([]);
    const [jobDetails, setJobDetails] = useState([]);
    const [selectedWorkers, setSelectedWorkers] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const storedProviderDetails = sessionStorage.getItem('providerDetails');
        if (!storedProviderDetails) {
            // If provider details are not posted, navigate to sign-in
            navigate('/ProviderSignIn');
        } else {
            // Fetch booked workers and worker details for the specific job ID
            axios.get(`http://localhost:3001/jobs/jobDetails`)
                .then(response => {
                    setJobDetails(response.data);
                    // Fetch worker details for each booked worker
                    const workerIds = response.data
                        .filter(job => job._id === jobId)
                        .map(job => job.booked_worker.map(bookedWorker => bookedWorker.worker_id));
                    
                    // Flatten the array of workerIds
                    const flattenedWorkerIds = workerIds.flat();
                    
                    // Fetch worker details for each workerId
                    Promise.all(flattenedWorkerIds.map(workerId =>
                        axios.get(`http://localhost:3001/workers/workerDetails/${workerId}`)
                            .then(response => response.data)
                            .catch(error => {
                                console.error(`Error fetching worker details for workerId ${workerId}:`, error);
                                return null;
                            })
                    ))
                    .then(workerDetails => setBookedWorkers(workerDetails.filter(worker => worker !== null)))
                    .catch(error => console.error('Error fetching worker details:', error));
                })
                .catch(error => {
                    console.error('Error fetching booked workers:', error);
                });
        }
    }, [navigate, jobId]);

    const handleCheckboxChange = (workerId) => {
        // Toggle the selected status of the worker
        setSelectedWorkers(prevSelected => {
            if (prevSelected.includes(workerId)) {
                return prevSelected.filter(id => id !== workerId);
            } else {
                return [...prevSelected, workerId];
            }
        });
    };

    const handleApprove = () => {
        // Make an Axios POST request to the approveWorkers endpoint
        axios.post(`http://localhost:3001/jobs/approveWorkers/${jobId}`, { selectedWorkers })
            .then(response => {
                console.log(response.data.message);
                // You can update the UI or perform any other actions after approval
            })
            .catch(error => {
                console.error('Error approving workers:', error);
                // Handle error scenarios
            });
    };
    
    const handleReject = () => {
        // Make an Axios POST request to the rejectWorkers endpoint
        axios.post(`http://localhost:3001/jobs/rejectWorkers/${jobId}`, { selectedWorkers })
            .then(response => {
                console.log(response.data.message);
                // You can update the UI or perform any other actions after rejection
            })
            .catch(error => {
                console.error('Error rejecting workers:', error);
                // Handle error scenarios
            });
    };

    const handleSignOut = () => {
        sessionStorage.removeItem('providerDetails');
        navigate('/ProviderSignIn');
    };

    return (
        <div className="container mt-5">
            <div className="row justify-content-center">
                <div className="col-md-6">
                    <h2>View Booked Workers for Job ID: {jobId}</h2>
                    {jobDetails
                        .filter(job => job._id === jobId)
                        .map(job => (
                            <div key={job._id}>
                                <div className="card">
                                    <div className="card-body">
                                        <strong>Job Title: </strong>{job.title}<br />
                                        <strong>Description: </strong>{job.description}<br />
                                        <strong>Date: </strong>{job.date}<br />
                                        <strong>Time: </strong>{job.time}<br />
                                        <strong>Location: </strong>{job.location}<br />
                                        <strong>Dress Code: </strong>{job.dress_code}<br />
                                        <strong>Job Status: </strong>{job.job_status}<br /><br />
                                    </div>
                                </div> <br />   
                                <h3>Booked Workers</h3>
                                <ul>
                                    {job.booked_worker.map(booked_worker => (
                                        <div key={booked_worker._id}>
                                            <div className="card">
                                                <div className="card-body">
                                                    <strong>Booking Status: </strong>{booked_worker.book_status}<br />
                                                    {/* Display other worker information as needed */}
                                                    {bookedWorkers
                                                        .filter(bookedWorker => bookedWorker._id === booked_worker.worker_id)
                                                        .map(bookedWorker => (
                                                            <div key={bookedWorker._id}>
                                                                <strong>Worker Name: </strong>{bookedWorker.name}<br />
                                                                <br />
                                                                <strong>Worker Email: </strong>{bookedWorker.email}<br />
                                                                {/* Add more worker details as needed */}
                                                            </div>
                                                        ))}
                                                    <input
                                                        type="checkbox"
                                                        onChange={() => handleCheckboxChange(booked_worker._id)}
                                                        checked={selectedWorkers.includes(booked_worker._id)}
                                                    />
                                                    <br />
                                                </div>
                                            </div> <br />   
                                        </div>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    <br /><br />
                    <div>
                        <button onClick={handleApprove} className="btn btn-success">Approve</button>
                        <button onClick={handleReject} className="btn btn-danger">Reject</button>
                        <br /><br />
                        <button onClick={handleSignOut} className="btn btn-danger">Sign Out</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ViewBookedWorker;