// client/src/AdminManageJob.jsx
import React, { useEffect, useState } from "react";
import axios from 'axios';
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import Modal from "react-modal";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser } from '@fortawesome/free-solid-svg-icons';
import AdminNavBar from './AdminNavBar';

// AdminManageJob component
function AdminManageJob() {
    
    const [isSidebarOpen, setSidebarOpen] = useState(false);

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

    return(
        <div style={{backgroundColor : "#f0f8ff",  minHeight: "100vh"}}>
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
                            <h5>Manage Job Post</h5><br></br>
                            <h5>Job Post Status : Completed</h5>
                            </div>
                        </div><br></br>
                        <div>
                        <a>FIlter Status By: </a>
                            <select >
                            <option value="">Completed</option>
                            </select></div><br></br>
                        <div className="card">
                            <div className="card-body" style={{display:"Flex"}}>
                                <div style={{width : "100%", marginLeft : "10px"}}>
                                    <div style={{width : "100%"}}>
                                    <strong style={{marginLeft:"10px"}}>Job TItle: </strong> Steward Cleaner
                                    </div>
                                    <strong style={{marginLeft:"10px"}}>Job Date: </strong> 2024:01:10<br></br>
                                    
                                </div>
                                <strong style={{marginLeft:"10px"}}>The job is completed</strong>
                                <button style={{marginLeft:"10px"}}>Manage Worker Payment</button>
                                <button style={{marginLeft:"10px"}}>Job Post Details</button>
                            </div>
                        </div><br></br>
                        <div className="card">
                            <div className="card-body" style={{display:"Flex"}}>
                                <div style={{width : "100%", marginLeft : "10px"}}>
                                    <div style={{width : "100%"}}>
                                    <strong style={{marginLeft:"10px"}}>Job TItle: </strong> Banquet Server
                                    </div>
                                    <strong style={{marginLeft:"10px"}}>Job Date: </strong> 2024:01:7
                                </div>
                                <strong style={{marginLeft:"10px"}}>The job is completed</strong>
                                <button style={{marginLeft:"10px"}}>Manage Worker Payment</button>
                                <button style={{marginLeft:"10px"}}>Job Post Details</button>
                            </div>
                        </div><br></br>
                        <div className="card">
                            <div className="card-body" style={{display:"Flex"}}>
                                <div style={{width : "100%", marginLeft : "10px"}}>
                                    <div style={{width : "100%"}}>
                                    <strong style={{marginLeft:"10px"}}>Job TItle: </strong> Banquet Server
                                    </div>
                                    <strong style={{marginLeft:"10px"}}>Job Date: </strong> 2024:01:06
                                </div>
                                <strong style={{marginLeft:"10px"}}>The job is completed</strong>
                                <button style={{marginLeft:"10px"}}>Manage Worker Payment</button>
                                <button style={{marginLeft:"10px"}}>Job Post Details</button>
                            </div>
                        </div><br></br>
                    </div>
                </div>
            </div>
      </div>
    );

}

export default AdminManageJob;