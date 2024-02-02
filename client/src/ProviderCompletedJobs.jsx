// client/src/ProviderViewCompletedJobs.jsx

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import { Link } from "react-router-dom";

function ProviderViewCompletedJobs() {
    const [providerName, setProviderName] = useState("Provider");
    const [providerId, setProviderId] = useState("Provider");
    const [completedPostedJobs, setCompletedPostedJobs] = useState([]);
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
                            <h2 className="card-title">Welcome, {providerName}!</h2>
                            <h3>Provider ID: {providerId}</h3>
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

                    <button onClick={handleSignOut} className="btn btn-danger">Sign Out</button>
                </div>
            </div>
        </div>
    );
}

export default ProviderViewCompletedJobs;
