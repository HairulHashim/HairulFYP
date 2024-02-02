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
                            <h5>Manage Worker</h5><br></br>
                            <h5>Worker Status : Pending</h5>
                            </div>
                        </div><br></br>
                        <div>
                        <a>FIlter Status By: </a>
                            <select >
                            <option value="">Pending</option>
                            </select></div><br></br>
                        <div className="card">
                            <div className="card-body" style={{display:"Flex"}}>
                            <FontAwesomeIcon icon={faUser} 
                                            style={{ fontSize: '100px', color: '#6c757d',  width: '50px', 
                                            height: '50px', borderRadius: '50%', objectFit: 'covern' }} />
                                <strong style={{marginLeft:"10px"}}>Worker Name: </strong> Firdaus Bin Syahmi<br></br><br></br>
                                <button style={{marginLeft:"10px"}}>Worker Details</button><br></br>
                                <button style={{marginLeft:"10px"}}>Worker Job History</button>
                                <input style={{marginLeft:"10px"}} type="checkbox" />
                            </div>
                        </div><br></br>
                    </div>
                </div>
            </div>
      </div>
    );

}

export default AdminManageJob;