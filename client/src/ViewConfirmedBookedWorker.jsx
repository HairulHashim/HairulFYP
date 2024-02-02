// client/src/ViewConfirmedBookedWorker.jsx

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useParams } from 'react-router-dom';
import { Link } from "react-router-dom";
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser } from '@fortawesome/free-solid-svg-icons';
import ProviderNavBar from './ProviderNavBar';

function ViewConfirmedBookedWorker() {
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
            axios.get(`http://localhost:3001/jobs/confirmedBookedWorkers/${jobId}`)
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

    const handleClockIn = () => {
        // Check if all selected workers have book_status "Attended"
        if (selectedWorkers.every(workerId => bookedWorkers.find(worker => worker._id === workerId)?.book_status === "Attended")) {
            // Make an Axios POST request to the clockIn endpoint
            axios.post(`http://localhost:3001/jobs/clockIn/${jobId}`, { selectedWorkers })
                .then(response => {
                    console.log(response.data.message);
                    // You can update the UI or perform any other actions after clock-in
                })
                .catch(error => {
                    console.error('Error clockIn workers:', error);
                    // Handle error scenarios
                });
        } else {
            // Display a pop-up message indicating that not all workers have the correct book_status for clock-in
            alert("Only workers with 'Attended' status can be clocked in.");
        }
    };
    
    const handleClockOut = () => {
        // Check if all selected workers have book_status "Started"
        if (selectedWorkers.every(workerId => bookedWorkers.find(worker => worker._id === workerId)?.book_status === "Started")) {
            // Make an Axios POST request to the clockOut endpoint
            axios.post(`http://localhost:3001/jobs/clockOut/${jobId}`, { selectedWorkers })
                .then(response => {
                    console.log(response.data.message);
                    // You can update the UI or perform any other actions after clock-out
                })
                .catch(error => {
                    console.error('Error clockOut workers:', error);
                    // Handle error scenarios
                });
        } else {
            // Display a pop-up message indicating that not all workers have the correct book_status for clock-out
            alert("Only workers with 'Started' status can be clocked out.");
        }
    };

    const handleEndJob = (jobId) => {
        axios.post(`http://localhost:3001/jobs/endJob/${jobId}`)
          .then(response => {
            console.log(response.data.message);
            // You can update the UI or perform any other actions after ending the job
          })
          .catch(error => {
            console.error('Error ending job:', error);
            // Handle error scenarios
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
                            <h2>Manage On Going Workers</h2>
                            </div></div><br></br>
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
                        <div className="card">
                        <div className="card-body">
                            {bookedWorkers.length > 0 ? (
                                <ul>
                                    {bookedWorkers.map(worker => (
                                        <li key={worker._id}>
                                            <strong>Worker Name: </strong>{worker.worker_id && worker.worker_id.name}<br />
                                            <strong>Email: </strong>{worker.worker_id && worker.worker_id.email}<br />
                                            <strong>Booking Status: </strong>Starting<br />
                                            <strong>Total Cancelled Jobs: </strong>{worker.totalCancelled}<br />
                                            <strong>Total Completed Jobs: </strong>{worker.totalCompleted}<br />
                                            <strong>Total Missing Jobs: </strong>{worker.totalMissing}<br />
                                            <strong>Average Star Rating for Completed Jobs: </strong>{worker.averageRatingCompletedJobs ? worker.averageRatingCompletedJobs.toFixed(2) : 'N/A'}<br />
                                            {worker.clock_in_time && (
                                                <><strong>Clock-In Time: </strong>{worker.clock_in_time}<br /></>
                                            )}
                                            {worker.clock_out_time && (
                                                <><strong>Clock-Out Time: </strong>{worker.clock_out_time}<br /></>
                                            )}
                                            <br />
                                            {worker.book_status !== 'Completed' && (
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
                                </ul>

                            ) : (
                                <p>No booked workers for this job</p>
                            )}
                            <div>
                                <button onClick={handleClockIn} className="btn btn-success">Clock In</button>
                                <button onClick={handleClockOut} className="btn btn-danger">Clock Out</button>
                            </div>
                        </div>
                    </div><button onClick={() => handleEndJob(jobId)} className="btn btn-success">End Job</button>
                </div>
            </div>
        </div>
        </div>
    );
}

export default ViewConfirmedBookedWorker;
