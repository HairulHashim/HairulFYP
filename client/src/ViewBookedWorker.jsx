// client/src/ViewBookedWorker.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useParams } from 'react-router-dom';
import { Link } from "react-router-dom";
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser } from '@fortawesome/free-solid-svg-icons';
import ProviderNavBar from './ProviderNavBar';

function ViewBookedWorker() {
    const { jobId } = useParams();
    const [bookedWorkers, setBookedWorkers] = useState([]);
    const [selectedWorkers, setSelectedWorkers] = useState([]);
    const [sortOption, setSortOption] = useState(null); // Add state for sorting option
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const storedProviderDetails = sessionStorage.getItem('providerDetails');
        if (!storedProviderDetails) {
            // If provider details are not posted, navigate to sign-in
            navigate('/ProviderSignIn');
        } else {
            // Fetch booked workers for the specific job ID
            axios.get(`http://localhost:3001/jobs/bookedWorkers/${jobId}`)
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
        axios.post(`http://localhost:3001/jobs/approveWorkers/${jobId}`, { selectedWorkers })
            .then(response => {
                console.log(response.data.message);
                // Reload the page after approval
                window.location.reload();
            })
            .catch(error => {
                console.error('Error approving workers:', error);
                // Handle error scenarios
                window.location.reload();
            });
    };
    
    const handleReject = () => {
        axios.post(`http://localhost:3001/jobs/rejectWorkers/${jobId}`, { selectedWorkers })
            .then(response => {
                console.log(response.data.message);
                // Reload the page after rejection
                window.location.reload();
            })
            .catch(error => {
                console.error('Error rejecting workers:', error);
                // Handle error scenarios
                window.location.reload();
            });
    };

    const handleSidebarToggle = () => {
        setSidebarOpen(!isSidebarOpen);
    };
    
    const handleSidebarButtonClick = (buttonIndex) => {
    // Handle the button click based on the index
    switch (buttonIndex) {
        case 1:
        // Handle button 1 click
        break;
        case 2:
        // Handle button 2 click
        break;
        case 3:
        // Handle button 3 click
        break;
        case 4:
        // Handle button 4 click
        break;
        default:
        break;
    }
    };

    const handleSignOut = () => {
        sessionStorage.removeItem('providerDetails');
        navigate('/ProviderSignIn');
    };

    return (
        <div style={{backgroundColor : "#f0f8ff",  minHeight: "100vh"}}>
        <ProviderNavBar
          isOpen={isSidebarOpen}
          onToggle={handleSidebarToggle}
          onButtonClick={handleSidebarButtonClick}
        />
        <div className="container pt-5">
            <div className="row justify-content-center">
                <div className="col-md-6">
                    <div className="card">
                        <div className="card-body">
                        <h2>Manage Pending Workers</h2><br></br>
                            {/* <h2>Manage Booked Workers for Job ID: {jobId}</h2>*/}
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
                            </div><br></br>
                            {bookedWorkers.length > 0 ? (
                                <ul>
                                    {bookedWorkers.map(worker => (
                                        <li key={worker._id}>
                                            <FontAwesomeIcon icon={faUser} 
                                            style={{ fontSize: '100px', color: '#6c757d',  width: '50px', 
                                            height: '50px', borderRadius: '50%', objectFit: 'covern', marginLeft: '100px' }} /><br /><br />
                                            <strong>Booked Worker  ID: </strong>{worker._id}<br />
                                            <strong>Worker ID: </strong>{worker.worker_id && worker.worker_id.worker_id}<br />
                                            <strong>Worker Name: </strong>{worker.worker_id && worker.worker_id.name}<br />
                                            <strong>Email: </strong>{worker.worker_id && worker.worker_id.email}<br />
                                            <strong>Booking Status: </strong>{worker.book_status}<br />
                                            <strong>Total Cancelled Jobs: </strong>{worker.totalCancelled}<br />
                                            <strong>Total Completed Jobs: </strong>{worker.totalCompleted}<br />
                                            <strong>Total Missing Jobs: </strong>{worker.totalMissing}<br />
                                            <strong>Total Completed Jobs: </strong>{worker.totalCompleted}<br />
                                            
                                            {/* Fetch the additional data for each worker using workerJobStats endpoint */}
                                            {worker.totalCompleted > 0 ? (
                                                <>
                                                    <strong>Average Star Rating for Completed Jobs: </strong>
                                                    {worker.averageRatingCompletedJobs || 'N/A'}<br />
                                                </>
                                            ) : null}
                                            <br />
                                            <br />
                                            {worker.book_status === 'Pending' && (
                                                <>
                                                    <input
                                                        type="checkbox"
                                                        onChange={() => handleCheckboxChange(worker._id)}
                                                        checked={selectedWorkers.includes(worker._id)}
                                                    />
                                                    <br />
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
                                <br></br><br></br>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        </div>
    );
}

export default ViewBookedWorker;
