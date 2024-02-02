// client/src/WorkerProfileDetails.jsx
import React, { useEffect, useState } from "react";
import axios from 'axios';
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser } from '@fortawesome/free-solid-svg-icons';
import Modal from "react-modal";
import WorkerNavBar from './WorkerNavBar';


function WorkerProfileDetails() {
  const [workerId, setWorkerId] = useState("Worker");
  const [workerProfileDetails, setWorkerProfileDetails] = useState([]);
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [file, setFile] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedWorkerDetails = sessionStorage.getItem('workerDetails');
    if (!storedWorkerDetails) {
      navigate('/WorkerSignIn');
    } else {
      const worker = JSON.parse(storedWorkerDetails);
      setWorkerId(worker._id);

      // Include JWT token in headers for authenticated requests
      const jwtToken = sessionStorage.getItem('jwtToken');

      const fetchWorker = async () => {
        try {
          const response = await axios.get(`http://localhost:3001/workers/workerDetails/${workerId}`, {
            headers: {
              Authorization: `Bearer ${jwtToken}`,
            },
          });
          setWorkerProfileDetails(response.data);
        } catch (error) {
          console.error('Error fetching worker details:', error);
        }
      };

      // Fetch worker details initially when the component mounts
      fetchWorker();

      // Set up an interval to fetch worker details every 5 minutes (adjust as needed)
      const fetchInterval = setInterval(fetchWorker, 5000); // 5 seconds

      // Clean up the interval on component unmount
      return () => clearInterval(fetchInterval);
    }
  }, [navigate, workerId]);

  const fetchWorker = async () => {
    const jwtToken = sessionStorage.getItem('jwtToken');

    try {
      const response = await axios.get(`http://localhost:3001/workers/workerDetails/${workerId}`, {
        headers: {
          Authorization: `Bearer ${jwtToken}`,
        },
      });
      setWorkerProfileDetails(response.data);
    } catch (error) {
      console.error('Error fetching worker details:', error);
    }
  };

  // Function to handle file selection
  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    setFile(selectedFile);
  };

  const handleUpdateImage = async () => {
      try {
      if (!file) {
          console.log('No file selected.');
          return;
      }

      const formData = new FormData();
      formData.append('file', file);

      const jwtToken = sessionStorage.getItem('jwtToken');

      // Make a request to update the worker's profile image
      const response = await axios.post(`http://localhost:3001/workers/uploadProfilePicture/${workerId}`, formData, {
          headers: {
          Authorization: `Bearer ${jwtToken}`,
          'Content-Type': 'multipart/form-data',
          },
      });

      console.log('Image updated successfully:', response.data);
      setFile(null);
      
      // Refresh worker details after updating the image
      fetchWorker();
      } catch (error) {
      console.error('Error updating image:', error);
      }
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
      default:
        break;
    }
  };

  const handleSignOut = () => {
    sessionStorage.removeItem('jwtToken');
    sessionStorage.removeItem('workerDetails');
    navigate('/WorkerSignIn');
  };

  return (
    <div className="containers" style={{ backgroundColor: "#f0f8ff", height: "100%"}}>
      <WorkerNavBar
        isOpen={isSidebarOpen}
        onToggle={handleSidebarToggle}
        onButtonClick={handleSidebarButtonClick}
      />
      <div className="container pt-5">
        <div className="row justify-content-center">
          <div className="col-md-6">
            <div className="card">
                {/* Display worker profile details here */}
                <div className="card-title" ><h2>Worker Profile Details</h2></div>
                </div><br></br>
                <div className="card">
                <div className="card-body" style={{ textAlign: 'center' }}>
                {/* Display worker profile details here */}
                <div style={{ marginBottom: '20px' }}>
                {workerProfileDetails.image ? (
                    <>
                      <img
                        src={`http://localhost:3001/workers/displayProfileImage/${workerId}`}
                        alt="Worker Profile"
                        style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover' }}
                      />
                    </>
                  ) : (
                    <FontAwesomeIcon icon={faUser} style={{ fontSize: '100px', color: '#6c757d',  width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover' }} />
                  )}
                  <br /><br />
                  <input type="file" onChange={handleFileChange} />
                    <button onClick={handleUpdateImage}>Update Image</button><br></br><br></br>
                    <button>View Image</button>
                </div></div></div><br></br>
                <div className="card">
                <div className="card-body" style={{ textAlign: 'center' }}>
                <div style={{ display: 'flex' }}>
                  <button style={{ marginRight: '10px' }} className="btn btn-secondary">Edit Profile</button>
                  <button className="btn btn-secondary">Update Password</button>
                </div>
                <strong>Worker ID: <br /></strong>{workerProfileDetails._id}<br /><br />
                <strong>IC Number: <br /></strong>{workerProfileDetails.no_ic}<br /><br />
                <strong>Name: <br /></strong>{workerProfileDetails.name}<br /><br />
                <strong>Email: <br /></strong>{workerProfileDetails.email}<br /><br />
                <strong>Gender: <br /></strong>{workerProfileDetails.gender}<br /><br />
                <strong>No Telephone: <br /></strong>{workerProfileDetails.no_tel}<br /><br />
                <strong>Home Address: <br /></strong>{workerProfileDetails.home}<br /><br />
                <strong>Date of Birth: <br /></strong>{workerProfileDetails.dob}<br /><br />
                {/* Add more details as needed */}
              </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}

export default WorkerProfileDetails;
