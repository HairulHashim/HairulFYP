// client/src/AdminNavBar.jsx
import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { Link } from 'react-router-dom';
import './NavBar.css';

const AdminNavBar = ({ isOpen, onToggle, onButtonClick }) => {
  const navigate = useNavigate();
  const [showJobCategories, setShowJobCategories] = useState(false);

  const handleButtonClick = (buttonIndex) => {
    switch (buttonIndex) {
      case 1:
        window.location.href = "/AdminHomePage";
        break;
      case 2:
        window.location.href = "/CreateJobPost";
        break;
      case 3:
        // Toggle visibility of job categories
        setShowJobCategories(!showJobCategories);
        break;
      case 4:
        window.location.href = "/WorkerProfileDetails";
        break;
      default:
        break;
    }
  };

  const handleSubcategoryClick = (subcategory) => {
    // Perform navigation based on the subcategory
    switch (subcategory) {
      case 'RequestBookJob':
        window.location.href = "/WorkerPendingJob";
        break;
      case 'UpcomingJob':
        window.location.href = "/WorkerConfirmedJob";
        break;
      case 'OnGoingJob':
        window.location.href = "/WorkerOnGoingJob";
        break;
      case 'CompletedJob':
        window.location.href = "/ViewCompletedJobs";
        break;
      case 'PastJob':
        window.location.href = "/WorkerPastJob";
        break;
      default:
        break;
    }
  };

  const handleSignOut = () => {
    sessionStorage.removeItem('jwtToken');
    sessionStorage.removeItem('providerDetails');
    navigate('/AdminSignIn');
  };

  return (
    <div>
    {/* Top Bar */}
    <div className={`top-bar ${isOpen ? 'pushed' : ''}`}>
      <span style={{
        fontFamily: 'cursive',
        fontWeight: 'bold',
        fontSize: '1.2em',
        color: '#3498db',
        background: '#fff',
        padding: '5px 10px',
        borderRadius: '20px',
        display: 'inline-block',
      }}>
        Event<span style={{ color: '#20B2AA' }}>Recruit</span>
      </span>
    </div>
      {/* SignOut Link */}
      <div style={{ position: 'fixed', top: '10px', right: '10px', zIndex: '3' }}>
        <button onClick={handleSignOut} className="btn btn-danger">Sign Out</button><br></br>
      </div>

      {/* Sidebar */}
      <div className={`sidebar ${isOpen ? 'open' : ''}`}>
        {/* Sidebar Toggle Button */}
        <button className="sidebar-toggle" onClick={onToggle}>
          <i className={`fas ${isOpen ? 'fa-times' : 'fa-bars'}`}></i>
        </button>
        <div>
          <button onClick={() => handleButtonClick(1)}>
            <i className="fas fa-home" style={{ marginRight: '5px' }}></i>
            {isOpen ? <span>Home</span> : null}
          </button>
          <button onClick={() => handleButtonClick(2)}>
            <i className="fas fa-person-booth" style={{ marginRight: '5px' }}></i>
            {isOpen ? <span>Manage Worker</span> : null}
        </button>
          <button onClick={() => handleButtonClick(3)}>
            <i className="fas fa-building" style={{ marginRight: '5px' }}></i>
            {isOpen ? <span>Manage Job Provider</span> : null}
          </button>
          <button onClick={() => handleButtonClick(4)}>
            <i className="fas fa-briefcase" style={{ marginRight: '5px' }}></i>
            {isOpen ? <span>Manage Job Post</span> : null}
          </button>
          <button onClick={() => handleButtonClick(4)}>
            <i className="fas fa-money-bill" style={{ marginRight: '5px' }}></i>
            {isOpen ? <span>Manage Worker Payment</span> : null}
          </button>
          {/* Display job categories when "Your Job" is clicked 
          {showJobCategories && (
            <div className="job-categories">
              <button onClick={() => handleSubcategoryClick('RequestBookJob')}>
                <i className="fas fa-spinner" style={{ marginLeft: '10px' }}></i>
                {isOpen ? <span>Request Job Post</span> : null}
              </button>
              <button onClick={() => handleSubcategoryClick('UpcomingJob')}>
                <i className="fas fa-clock" style={{ marginLeft: '10px' }}></i>
                {isOpen ? <span>Open Job Post</span> : null}
              </button>
              <button onClick={() => handleSubcategoryClick('OnGoingJob')}>
                <i className="fas fa-running" style={{ marginLeft: '10px' }}></i>
                {isOpen ? <span>OnGoing Job Post</span> : null}
              </button>
              <button onClick={() => handleSubcategoryClick('CompletedJob')}>
                <i className="fas fa-check-circle" style={{ marginLeft: '10px' }}></i>
                {isOpen ? <span>Completed Job Post</span> : null}
              </button>
              <button onClick={() => handleSubcategoryClick('PastJob')}>
                <i className="fas fa-history" style={{ marginLeft: '10px' }}></i>
                {isOpen ? <span>Past Job Post</span> : null}
              </button>
            </div>
          )}*/}
          {/* Add other buttons here */}
        </div>
      </div>
      <br></br>
    </div>
  );
};

export default AdminNavBar;
