// client/src/ViewPendingBookedWorker.jsx

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useParams } from 'react-router-dom';
import { Link } from "react-router-dom";
import axios from 'axios';

function ViewPendingBookedWorker() {
    const { jobId } = useParams();
    const [bookedWorkers, setBookedWorkers] = useState([]);
    const [selectedWorkers, setSelectedWorkers] = useState([]);
    const [sortOption, setSortOption] = useState(null); // Add state for sorting option
    const navigate = useNavigate();

    useEffect(() => {
        const storedProviderDetails = sessionStorage.getItem('providerDetails');
        if (!storedProviderDetails) {
            // If provider details are not posted, navigate to sign-in
            navigate('/ProviderSignIn');
        } else {
            // Fetch booked workers for the specific job ID
            axios.get(`http://localhost:3001/jobs/pendingBookedWorkers/${jobId}`)
                .then(async response => {
                    // Fetch additional data for each worker
                    const workersWithStats = await Promise.all(response.data.map(async worker => {
                        const statsResponse = await axios.get(`http://localhost:3001/jobs/workerJobStats/${worker.worker_id.worker_id}`);
                        return { ...worker, ...statsResponse.data };
                    }));

                    // Sort workers based on the selected option
                    if (sortOption) {
                        const sortedWorkers = [...workersWithStats];
                        sortedWorkers.sort((a, b) => {
                            switch (sortOption) {
                                case 'rating':
                                    return b.averageRatingCompletedJobs - a.averageRatingCompletedJobs;
                                case 'cancelled':
                                    return a.totalCancelled - b.totalCancelled;
                                case 'missing':
                                    return a.totalMissing - b.totalMissing;
                                case 'completed':
                                    return b.totalCompleted - a.totalCompleted;
                                default:
                                    return 0;
                            }
                        });
                        setBookedWorkers(sortedWorkers);
                    } else {
                        setBookedWorkers(workersWithStats);
                    }
                })
                .catch(error => {
                    console.error('Error fetching booked workers:', error);
                });
        }
    }, [navigate, jobId, sortOption]);

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
                    <div className="card">
                        <div className="card-body">
                            <h2>Manage Confirmed Booked Workers for Job ID: {jobId}</h2>
                            {/* Add dropdown for sorting */}
                            <div>
                                <label>Sort By:</label>
                                <select onChange={(e) => setSortOption(e.target.value)}>
                                    <option value="">Select Option</option>
                                    <option value="rating">Highest Star Rating</option>
                                    <option value="completed">Highest Completed Jobs</option>
                                    <option value="cancelled"> Least Cancelled Jobs</option>
                                    <option value="missing">Least Missing Jobs</option>
                                </select>
                            </div>
                            {bookedWorkers.length > 0 ? (
                                <ul>
                                    {bookedWorkers.map(worker => (
                                        <li key={worker._id}>
                                            <strong>Worker Name: </strong>{worker.worker_id && worker.worker_id.name}<br />
                                            <strong>Email: </strong>{worker.worker_id && worker.worker_id.email}<br />
                                            <strong>Booking Status: </strong>{worker.book_status}<br />
                                            <strong>Total Cancelled Jobs: </strong>{worker.totalCancelled}<br />
                                            <strong>Total Completed Jobs: </strong>{worker.totalCompleted}<br />
                                            <strong>Total Missing Jobs: </strong>{worker.totalMissing}<br />
                                            <strong>Average Star Rating for Completed Jobs: </strong>{worker.averageRatingCompletedJobs.toFixed(2)}<br />
                                            <br />
                                            {worker.book_status === 'Attended' && (
                                                <>
                                                    <button>
                                                    Clock In
                                                    </button><br></br>
                                                </>
                                            )}
                                            {worker.book_status === 'Started' && (
                                                <>
                                                    <button>
                                                    Clock Out
                                                    </button><br></br>
                                                </>
                                            )}
                                            {worker.totalCompleted > 0 ? (
                                                <Link to={`/ViewWorkerHistory/${worker.worker_id && worker.worker_id.worker_id}`}>
                                                    View Worker History
                                                </Link>
                                            ) : (
                                                <p>This worker has never been approved after booking a job.</p>
                                            )}
                                            
                                            <br /><br />
                                        </li>
                                    ))}
                                    <br></br><br />
                                </ul>
                                
                            ) : (
                                <p>No booked workers for this job</p>
                            )}
                            <div>
                                <button onClick={handleApprove} className="btn btn-success">Approve</button>
                                <button onClick={handleReject} className="btn btn-danger">Reject</button>
                                <br></br>
                                <button className="btn btn-danger">End Job</button>
                                <br></br>
                                <br></br><br></br>
                                <button onClick={handleSignOut} className="btn btn-danger">Sign Out</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ViewPendingBookedWorker;
