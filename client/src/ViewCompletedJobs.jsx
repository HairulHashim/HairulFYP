// client/src/ViewCompletedJobs.jsx

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import { Link } from "react-router-dom";
import ProviderNavBar from './ProviderNavBar';

function ViewCompletedJobs() {
    const [providerName, setProviderName] = useState("Provider");
    const [providerId, setProviderId] = useState("Provider");
    const [completedPostedJobs, setCompletedPostedJobs] = useState([]);
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const storedProviderDetails = sessionStorage.getItem('providerDetails');

        if (!storedProviderDetails) {
            navigate('/ProviderSignIn');
        } else {
            const provider = JSON.parse(storedProviderDetails);
            setProviderName(provider.name);
            setProviderId(provider._id);

            // Fetch all jobs from the server
            axios.get(`http://localhost:3001/jobs/completedPostedJobs/${providerId}`)
                .then(response => {
                    setCompletedPostedJobs(response.data);
                })
                .catch(error => {
                    console.error('Error fetching posted jobs:', error);
                });
        }
    }, [navigate, providerId]);

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
                            <h2 className="card-title">Welcome, {providerName}!</h2>
                            <h3>Posted Jobs: Completed</h3>
                        </div>
                    </div>
                    {completedPostedJobs.map(job => (
                        <div key={job._id}>
                            <div className="card">
                                <div className="card-body">
                                    <strong>Title: </strong> {job.title}<br />
                                    <strong>Description: </strong> {job.description}<br />
                                    <strong>Location: </strong> {job.location}<br />
                                    <strong>Required Worker:</strong> {job.required_worker}<br /><br />
                                    <strong>Completed Booked Workers:</strong>{job.booked_worker.filter(worker => worker.book_status === 'Completed').length}
                                    {job.job_status === 'Completed' && (
                                        <button onClick={() => navigate(`/ViewCompletedBookedWorker/${job._id}`)}>
                                            Manage Completed Booked Workers
                                        </button>
                                    )}
                                    <br /><br />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
        </div>
    );
}

export default ViewCompletedJobs;
