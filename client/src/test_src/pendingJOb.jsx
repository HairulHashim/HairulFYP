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
                            <h5>Job Post Status : Pending</h5>
                            </div>
                        </div><br></br>
                        <div>
                        <a>FIlter Status By: </a>
                            <select >
                            <option value="">Pending</option>
                            </select></div><br></br>
                        <div className="card">
                            <div className="card-body" style={{display:"Flex"}}>
                                <div style={{width : "100%", marginLeft : "10px"}}>
                                    <div style={{width : "80%"}}>
                                    <strong style={{marginLeft:"10px"}}>Job TItle: </strong> Event crew
                                    </div>
                                    <strong style={{marginLeft:"10px"}}>Job Date: </strong> 2024:01:23<br></br>
                                    
                                </div>
                                <button style={{marginRight:"50px"}}>Job Post Details</button>
                                <input style={{marginRight:"50px"}} type="checkbox" />
                            </div>
                        </div><br></br>
                        <button className="btn btn-success">Approve</button>
                                <button className="btn btn-danger">Reject</button>
                    </div>
                </div>
            </div>
      </div>
    );

}

export default AdminManageJob;