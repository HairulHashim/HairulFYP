// client/src/ViewWorkerHistory.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser } from '@fortawesome/free-solid-svg-icons';
import ProviderNavBar from './ProviderNavBar';

function ViewWorkerHistory() {
    const navigate = useNavigate();
    const { workerId } = useParams();
    const [workerHistory, setWorkerHistory] = useState([]);
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedProviderDetails = sessionStorage.getItem('providerDetails');
        if (!storedProviderDetails) {
            // If provider details are not posted, navigate to sign-in
            navigate('/ProviderSignIn');
        } else {
            // Fetch worker history for the specific worker ID
            axios.get(`http://localhost:3001/jobs/workerHistory/${workerId}`)
                .then(response => {
                    setWorkerHistory(response.data);
                })
                .catch(error => {
                    console.error('Error fetching worker history:', error);
                })
                .finally(() => {
                    setLoading(false);
                });
        }
    }, [navigate, workerId]);

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

    if (loading) {
        return <p>Loading...</p>;
    }

    // Filter completed and cancelled jobs
    const completedJobs = workerHistory.filter(job => job.book_status === 'Completed');
    const cancelledJobs = workerHistory.filter(job => job.book_status === 'Cancelled');

    // Calculate the average star rating for completed jobs
    const averageRatingCompletedJobs =
        completedJobs.length > 0
            ? completedJobs.reduce((sum, job) => sum + job.worker_rating, 0) / completedJobs.length
            : 0;

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
                        <h2>View Worker History</h2>
                            </div></div>
                           <br></br>
                            <div className="card">
                        <div className="card-body">
                            <p>Average Star Rating: {averageRatingCompletedJobs.toFixed(2)}</p>
                            <p>Total Cancelled Jobs: {cancelledJobs.length}</p>
                            <p>Total Completed Jobs: {completedJobs.length}</p>
                            </div></div><br></br><div className="card">
                        <div className="card-body">
                            {workerHistory && workerHistory.length > 0 ? (
                                <div>
                                    {workerHistory.map((job, index) => (
                                        <div key={index}>
                                            <strong>Title: </strong> {job.title}<br />
                                            <strong>Description: </strong> {job.description}<br />
                                            <strong>Job Status: </strong> {job.book_status}<br />

                                            {job.book_status === 'Completed' && (
                                                <>
                                                    <strong>Total of Payment RM: </strong> {job.payment_total}<br />
                                                    <strong>Total Number of Working Hours: </strong> {job.worker_hours}<br />
                                                    <strong>Star Rating of Worker: </strong> {job.worker_rating} Out of 5<br />
                                                    <strong>Payment Status: </strong> {job.payment_status}<br />
                                                </>
                                            )}

                                            {job.book_status === 'Cancelled' && (
                                                <>
                                                    <strong>Cancel Date: </strong> {job.cancel_date}<br />
                                                    <strong>Cancel Time: </strong> {job.cancel_time}<br />
                                                    <strong>Cancel Reason: </strong> {job.cancel_reason}<br />
                                                </>
                                            )}

                                            <br /> <br />
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p>No worker history available.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
        </div>
    );
}

export default ViewWorkerHistory;
