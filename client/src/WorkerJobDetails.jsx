// client/src/WorkerJobDetails.jsx
import React, { useEffect, useState } from "react";
import axios from 'axios';
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { useParams } from 'react-router-dom';
import Modal from "react-modal";
import WorkerNavBar from './WorkerNavBar';

// Modal Styles (you can customize this based on your design)
const modalStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
  },
};

// CancelModal component
const CancelModal = ({ isOpen, onCancel, onConfirmCancel }) => {
  const [cancelReason, setCancelReason] = useState("");

  const handleExitCancel = () => {
    onCancel();
    fetchJobs();
  };

  const handleConfirmCancel = () => {
    // Show confirmation dialog before confirming cancellation
    const userConfirmed = window.confirm("Are you sure you want to cancel this booking?");
    if (userConfirmed && cancelReason) {
      onConfirmCancel(cancelReason);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={handleExitCancel}
      contentLabel="Cancel Booking Modal"
      style={modalStyles}
    >
      <h2>Cancel Booking</h2>
      <label>Select Cancel Reason:</label>
      <select onChange={(e) => setCancelReason(e.target.value)}>
        <option value="" disabled>Select a reason</option>
        <option value="Health">Health</option>
        <option value="Transportation">Transportation</option>
        <option value="Urgency">Urgency</option>
        <option value="Safety">Safety</option>
      </select>
      <div>
        <button onClick={handleConfirmCancel}>Confirm Cancel</button><br></br>
        <button onClick={handleExitCancel}>Exit</button>
      </div>
    </Modal>
  );
};

// FileViewerModal component
const FileViewerModal = ({ isOpen, filePath, onClose }) => {
  return (
      <Modal
          isOpen={isOpen}
          onRequestClose={onClose}
          contentLabel="File Viewer Modal"
          style={modalStyles}
      >
          <h2>File Viewer</h2>
          {filePath && <iframe src={`http://localhost:3001/jobs/viewPaymentProof/${filePath}`} title="File Viewer" width="100%" height="500px" />}
          <button onClick={onClose}>Close</button>
      </Modal>
  );
};

// WorkerJobDetails component
function WorkerJobDetails() {
  const { jobId } = useParams();
  const [workerName, setWorkerName] = useState("Worker");
  const [workerId, setWorkerId] = useState("Worker");
  const [jobDetails, setJobDetails] = useState([]);
  const [cancelModalOpen, setCancelModalOpen] = useState(false)
  const [isSidebarOpen, setSidebarOpen] = useState(false);;
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [file, setFile] = useState(null);
  const [fileViewerPath, setFileViewerPath] = useState(null);
  const [isFileViewerModalOpen, setIsFileViewerModalOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const storedWorkerDetails = sessionStorage.getItem('workerDetails');
    if (!storedWorkerDetails) {
      navigate('/WorkerSignIn');
    } else {
      const worker = JSON.parse(storedWorkerDetails);
      setWorkerName(worker.name);
      setWorkerId(worker._id);
  
      // Include JWT token in headers for authenticated requests
      const jwtToken = sessionStorage.getItem('jwtToken');
  
      const fetchJobs = async () => {
        try {
          const response = await axios.get(`http://localhost:3001/jobs/jobDetails/${jobId}`, {
            headers: {
              Authorization: `Bearer ${jwtToken}`,
            },
          });
          setJobDetails(response.data);
        } catch (error) {
          console.error('Error fetching job details:', error);
        }
      };
  
      // Fetch job details initially when the component mounts
      fetchJobs();
  
      // Set up an interval to fetch jobs every 5 minutes (adjust as needed)
      const fetchInterval = setInterval(fetchJobs, 5000); // 5 seconds
  
      // Clean up the interval on component unmount
      return () => clearInterval(fetchInterval);
    }
  }, [navigate, jobId]);

// Inside the fetchJobs function
const fetchJobs = async () => {
    try {
      const jwtToken = sessionStorage.getItem('jwtToken');
      const response = await axios.get(`http://localhost:3001/jobs/jobDetails/${jobId}`, {
        headers: {
          Authorization: `Bearer ${jwtToken}`,
        },
      });
      console.log('Job Details Response:', response.data);
      setJobDetails(response.data);
    } catch (error) {
      console.error('Error fetching job details:', error);
    }
  };


  const handleJobBooking = (jobId, isBooked) => {
    if (isBooked) {
        setCancelModalOpen(true);
        setSelectedJobId(jobId);
    } else {
      const userConfirmed = window.confirm("Are you sure you want to book this job?");
      if (userConfirmed) {
        // Send a request to the server to toggle the job booking status
        axios.post(`http://localhost:3001/jobs/bookJob/${jobId}/${workerId}`)
          .then(response => {
            console.log(response.data.message);
            // Reload the page after successful booking
          })
          .catch(error => {
            console.error('Error booking job:', error);
          });
          fetchJobs();
      }
    }
  };  

  const handleAttendJob = (jobId) => {
    const userConfirmed = window.confirm("Are you sure you want to attend this job?");
    if (userConfirmed) {
      axios.post(`http://localhost:3001/jobs/attendJob/${jobId}/${workerId}`)
        .then(response => {
          console.log(response.data.message);
          // Reload the page after successful attendance
        })
        .catch(error => {
          console.error('Error attending job:', error);
        });
        fetchJobs();
    }
  };

  const handleCancelBooking = (cancelReason) => {
    axios.post(`http://localhost:3001/jobs/cancelJob/${selectedJobId}/${workerId}`, { cancelReason })
      .then(response => {
        console.log(response.data.message);
      })
      .catch(error => {
        console.error('Error canceling job:', error);
      })
      .finally(() => {
        setCancelModalOpen(false);
        setSelectedJobId(null);
      });
      fetchJobs();
  };

  // Function to open the file viewer modal
  const openFileViewerModal = (filePath) => {
    console.log('File path:', filePath);
    setFileViewerPath(filePath);
    setIsFileViewerModalOpen(true);
};

  // Function to close the file viewer modal
  const closeFileViewerModal = () => {
      setIsFileViewerModalOpen(false);
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
    <div style={{backgroundColor : "#f0f8ff",  minHeight: "100vh"}}>
      <WorkerNavBar
        isOpen={isSidebarOpen}
        onToggle={handleSidebarToggle}
        onButtonClick={handleSidebarButtonClick}
      />
      <div className="container pt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card">
            <div className="card-body">
              <h3>Job Details</h3>
            </div>
          </div><br></br>
              <div className="card">
                <div className="card-body">
                    <strong>Job Title:</strong> {jobDetails.title}<br />
                    <strong>Job Description:</strong>
                    <p style={{ whiteSpace: 'pre-line' }}>{jobDetails.description}</p><br />
                    <strong>Job Address:</strong> {jobDetails.address}<br />
                    <strong>Location on Map (link):</strong> {jobDetails.link_location}<br /><br />
                    <strong>Start Date:</strong> {jobDetails.start_date}<br />
                    <strong>Start Time:</strong> {jobDetails.start_time}<br />
                    <strong>Total Hours:</strong> {jobDetails.job_hours} hours<br />
                    <strong>Start Date:</strong> {jobDetails.end_date}<br />
                    <strong>Start Time:</strong> {jobDetails.start_time}<br /><br />
                    <strong>Rate:</strong> RM {jobDetails.job_rate}<br />
                    <strong>Estimated Total Payment</strong> RM {jobDetails.job_rate * jobDetails.job_hours}<br />
                    <strong>Job Status:</strong> {jobDetails.job_status}<br />
                    <strong>Required Worker:</strong> {jobDetails.required_worker}<br /><br />
                </div>
              </div>
        </div>
      </div>
        {/* Render the cancel modal */}
            <CancelModal
        isOpen={cancelModalOpen}
        onCancel={() => setCancelModalOpen(false)}
        onConfirmCancel={handleCancelBooking}
      />
       {/* Render the file viewer modal */}
       <FileViewerModal
          isOpen={isFileViewerModalOpen}
          filePath={fileViewerPath}
          onClose={closeFileViewerModal}
        />
    </div>
    </div>
  );
}

export default WorkerJobDetails;
