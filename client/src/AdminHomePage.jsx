// client/src/AdminHomePage.jsx
import React, { useEffect, useState } from "react";
import axios from 'axios';
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import Modal from "react-modal";
import AdminNavBar from './AdminNavBar';
import { Doughnut } from 'react-chartjs-2';
import Chart from 'chart.js/auto'; // Import Chart.js with the 'auto' bundle
import { faDisplay } from "@fortawesome/free-solid-svg-icons";

// AdminHomePage component
function AdminHomePage() {

    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const [workerStats, setWorkerStats] = useState({ total: 5, pending: 1 });
    const [jobPostStats, setJobPostStats] = useState({ total: 3, ongoing: 1 });
    const [jobProviderStats, setJobProviderStats] = useState({ total: 3, pending: 1 });

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
        sessionStorage.removeItem('adminDetails');
        navigate('/AdminSignIn');
    };

    const workerData = {
        labels: ['Completed', 'Pending'],
        datasets: [
            {
                data: [workerStats.total - workerStats.pending, workerStats.pending],
                backgroundColor: ['#36A2EB', '#FFCE56'],
            },
        ],
    };
    
    const jobPostData = {
        labels: ['Completed', 'Ongoing'],
        datasets: [
            {
                data: [jobPostStats.total - jobPostStats.ongoing, jobPostStats.ongoing],
                backgroundColor: ['#FF6384', '#36A2EB'],
            },
        ],
    };
    
    const jobProviderData = {
        labels: ['Completed', 'Pending'],
        datasets: [
            {
                data: [jobProviderStats.total - jobProviderStats.pending, jobProviderStats.pending],
                backgroundColor: ['#4CAF50', '#FFCE56'],
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        width: 250,  // Set the width
        height: 250, // Set the height
    };

    
    return (
        <div style={{ backgroundColor: "#f0f8ff", minHeight: "100vh" }}>
            <AdminNavBar
                isOpen={isSidebarOpen}
                onToggle={handleSidebarToggle}
                onButtonClick={handleSidebarButtonClick}
            />
            <div className="container pt-5">
                <div className="row justify-content-center">
                    <div className="col-md-6">
                        <div className="card">
                            <div className="card-body">
                                <h2 className="card-title">Welcome, admin!</h2>
                            </div>
                        </div><br></br>
                        <div className="card">
                            <div className="card-body">
                                <div style={{display: "flex"}}>
                                    <div style={{marginTop: "100px"}}>
                                    <strong>Total Worker</strong>{workerStats.total} Worker ({workerStats.pending} Pending)</div>
                                    <div style={chartOptions}>
                                    <Doughnut data={workerData} /></div>
                                </div>
                            </div>
                        </div><br></br>
                        <div className="card">
                            <div className="card-body">
                                <div style={{display: "flex"}}>
                                    <div style={{marginTop: "100px"}}>
                                    <strong>Total Job Post</strong> {jobPostStats.total} Job Post ({jobPostStats.ongoing} On Going)</div>
                                    <div style={chartOptions}>
                                    <Doughnut data={jobPostData} /></div>
                                </div>
                                </div>
                            </div><br></br>
                        <div className="card">
                            <div className="card-body">
                                <div style={{display: "flex"}}>
                                    <div style={{marginTop: "100px"}}>
                                    <strong>Total Job Provider</strong></div><br></br>
                                    <div style={{marginTop: "100px"}}> {jobProviderStats.total} Job Provider ({jobProviderStats.pending} Pending)</div>
                                    <div style={chartOptions}>
                                    <Doughnut data={jobProviderData} /></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AdminHomePage;
