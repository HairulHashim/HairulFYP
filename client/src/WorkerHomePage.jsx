// client/src/WorkerHomePage.jsx
import React, { useEffect, useState } from "react";
import axios from 'axios';
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
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


// WorkerHomePage component
function WorkerHomePage() {
  const [workerName, setWorkerName] = useState("Worker");
  const [workerId, setWorkerId] = useState("Worker");
  const [availableJobs, setAvailableJobs] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState(null);
  const [cancelModalOpen, setCancelModalOpen] = useState(false)
  const [isSidebarOpen, setSidebarOpen] = useState(false);;
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [selectedLocations, setSelectedLocations] = useState(["Kuala Lumpur", "Selangor"]);
  const [selectedJobTitles, setSelectedJobTitles] = useState(["Kitchen Helper", "Steward Cleaner", "Banquet Server", "Event Crew"]);
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
          const response = await axios.get('http://localhost:3001/jobs/availableJobs', {
            headers: {
              Authorization: `Bearer ${jwtToken}`,
            },
          });
          setAvailableJobs(response.data);
        } catch (error) {
          console.error('Error fetching available jobs:', error);
        }
      };
  
      // Fetch available jobs initially when the component mounts
      fetchJobs();
  
      // Set up an interval to fetch jobs every 5 minutes (adjust as needed)
      const fetchInterval = setInterval(fetchJobs, 5000); // 5 seconds
  
      // Clean up the interval on component unmount
      return () => clearInterval(fetchInterval);
    }
  }, [navigate]);

  const fetchJobs = async () => {
    try {
      const jwtToken = sessionStorage.getItem('jwtToken');
      const response = await axios.get('http://localhost:3001/jobs/availableJobs', {
        headers: {
          Authorization: `Bearer ${jwtToken}`,
        },
      });
      setAvailableJobs(response.data);
    } catch (error) {
      console.error('Error fetching available jobs:', error);
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

  const handleLocationCheckboxChange = (location) => {
    const updatedLocations = [...selectedLocations];
    if (updatedLocations.includes(location)) {
      // Remove location if already selected
      updatedLocations.splice(updatedLocations.indexOf(location), 1);
    } else {
      // Add location if not selected
      updatedLocations.push(location);
    }
    console.log('Updated Locations:', updatedLocations);
    setSelectedLocations(updatedLocations);
  };
  
  const handleJobTitleCheckboxChange = (jobTitle) => {
    const updatedJobTitles = [...selectedJobTitles];
    if (updatedJobTitles.includes(jobTitle)) {
      // Remove job title if already selected
      updatedJobTitles.splice(updatedJobTitles.indexOf(jobTitle), 1);
    } else {
      // Add job title if not selected
      updatedJobTitles.push(jobTitle);
    }
    console.log('Updated Job Titles:', updatedJobTitles);
    setSelectedJobTitles(updatedJobTitles);
  };


  const handleFilterChange = (filter) => {
    setSelectedFilter(filter);
    // Do not reset selectedLocations and selectedJobTitles here
  };

  const filteredJobs = () => {
    let filteredJobs = availableJobs;
  
    if (selectedLocations.length > 0 && selectedJobTitles.length > 0) {
      // Filter by selected locations and job titles
      filteredJobs = filteredJobs.filter(
        (job) =>
          (!selectedLocations.length || selectedLocations.includes(job.location)) &&
          (!selectedJobTitles.length || selectedJobTitles.includes(job.title))
      );
    } else {
      // If either location or job title is all unchecked, return an empty array
      return [];
    }
  
    if (selectedFilter) {
      // Apply additional sorting/filtering based on the selected filter
      switch (selectedFilter) {
        case 'startTime':
          filteredJobs = [...filteredJobs].sort((a, b) => {
            const dateTimeA = new Date(`${a.start_date} ${a.start_time}`);
            const dateTimeB = new Date(`${b.start_date} ${b.start_time}`);
            return dateTimeA - dateTimeB;
          });
          break;
        case 'highestRate':
          filteredJobs = [...filteredJobs].sort((a, b) => b.job_rate - a.job_rate);
          break;
        case 'highestPayment':
          filteredJobs = [...filteredJobs].sort((a, b) => (b.job_rate * b.job_hours) - (a.job_rate * a.job_hours));
          break;
        default:
          break;
      }
    }
  
    return filteredJobs.length > 0 ? filteredJobs : [];
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
            <h2 className="card-title">Welcome, {workerName}!</h2>
              <h3>Available Jobs</h3>
            </div>
          </div><br></br>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div style={{ width: "30%" }}>
              {/* New location checkboxes */}
              <label>Filter Location:</label>
              <div>
                <input
                  type="checkbox"
                  id="kualaLumpur"
                  checked={selectedLocations.includes("Kuala Lumpur")}
                  onChange={() => handleLocationCheckboxChange("Kuala Lumpur")}
                />
                <label htmlFor="kualaLumpur">Kuala Lumpur</label>
              </div>
              <div>
                <input
                  type="checkbox"
                  id="selangor"
                  checked={selectedLocations.includes("Selangor")}
                  onChange={() => handleLocationCheckboxChange("Selangor")}
                />
                <label htmlFor="selangor">Selangor</label>
              </div>
            </div>
            <div style={{ width: "70%" }}>
              {/* Job Title checkboxes */}
              <label>Filter Job Title:</label>
              <div>
                <input
                  type="checkbox"
                  id="kitchenHelper"
                  checked={selectedJobTitles.includes("Kitchen Helper")}
                  onChange={() => handleJobTitleCheckboxChange("Kitchen Helper")}
                />
                <label htmlFor="kitchenHelper">Kitchen Helper</label>
              </div>
              <div>
                <input
                  type="checkbox"
                  id="stewardCleaner"
                  checked={selectedJobTitles.includes("Steward Cleaner")}
                  onChange={() => handleJobTitleCheckboxChange("Steward Cleaner")}
                />
                <label htmlFor="stewardCleaner">Steward Cleaner</label>
              </div>
              <div>
                <input
                  type="checkbox"
                  id="banquetServer"
                  checked={selectedJobTitles.includes("Banquet Server")}
                  onChange={() => handleJobTitleCheckboxChange("Banquet Server")}
                />
                <label htmlFor="banquetServer">Banquet Server</label>
              </div>
              <div>
                <input
                  type="checkbox"
                  id="eventCrew"
                  checked={selectedJobTitles.includes("Event Crew")}
                  onChange={() => handleJobTitleCheckboxChange("Event Crew")}
                />
                <label htmlFor="eventCrew">Event Crew</label>
              </div>
            </div>
          </div><br></br>
          <div>
            <label>Filter By:</label>
            <select onChange={(e) => handleFilterChange(e.target.value)}>
              <option value="">None</option>
              <option value="startTime">Closest Start Time</option>
              <option value="highestRate">Highest Rate</option>
              <option value="highestPayment">Highest Payment</option>
            </select>
          </div> <br></br>
          <ul>
            {filteredJobs().map(job => (
              <div className="card" key={job._id}>
                <div className="card-body">
                  <li>
                    <strong>Job Title:</strong> {job.title}<br />
                    <strong>Location:</strong> {job.location}<br />
                    <strong>Start Date:</strong> {job.start_date}<br />
                    <strong>Start Time:</strong> {job.start_time}<br />
                    <strong>Total Hours:</strong> {job.job_hours} hours<br />
                    <strong>Rate:</strong> RM {job.job_rate}<br />
                    <strong>Estimated Total Payment</strong> RM {job.job_rate * job.job_hours}<br />
                    <strong>Required Worker:</strong> {job.required_worker}<br /><br />
                    {job.booked_worker.filter(booking => (
                        booking.book_status === 'Confirmed' || booking.book_status === 'Attended' || booking.book_status === 'Completed'
                    )).length === job.required_worker && !job.booked_worker.some(booking => (
                        booking.worker_id === workerId &&
                        (booking.book_status === 'Confirmed' || booking.book_status === 'Attended' || booking.book_status === 'Completed')
                    )) ? (
                        <p>This job is fully booked.</p>
                    ) : (
                        // Render the "Book Job" button only if the job is not fully booked
                        <>
                            {job.booked_worker.some(booking => (
                                booking.worker_id === workerId &&
                                (booking.book_status === 'Pending' || booking.book_status === 'Confirmed') &&
                                booking.book_status !== 'Cancelled'
                            )) ? (
                                <>
                                    <button onClick={() => handleJobBooking(job._id, true)}>
                                        Cancel Booking
                                    </button>
                                    {job.booked_worker.find(booking => (
                                        booking.worker_id === workerId &&
                                        booking.book_status === 'Confirmed'
                                    )) && (
                                        <button onClick={() => handleAttendJob(job._id)}>
                                            Attend
                                        </button>
                                    )}
                                </>
                            ) : (
                                job.booked_worker.some(booking => (
                                    booking.worker_id === workerId &&
                                    booking.book_status === 'Attended'
                                )) ? (
                                    <p>Waiting for the job provider to set as clock in</p>
                                ) : (
                                    job.booked_worker.some(booking => (
                                        booking.worker_id === workerId &&
                                        booking.book_status === 'Started'
                                    )) ? (
                                        <p>Your job is starting</p>
                                    ) : (
                                      // Check if the job is completed to show "View Payment" button
                                      job.booked_worker.some(booking => (
                                          booking.worker_id === workerId &&
                                          (booking.book_status === 'Completed' || booking.book_status === 'Pending')
                                      )) ? (
                                          <button onClick={() => openFileViewerModal(job.booked_worker.find(booking => booking.worker_id === workerId && (booking.book_status === 'Completed'  || booking.book_status === 'Pending')).payment_proof)}>
                                              View Payment
                                          </button>
                                      ) : (
                                          <button onClick={() => handleJobBooking(job._id, false)}>
                                              Book Job
                                          </button>
                                      )
                                  )
                                )
                            )}
                        </>
                    )}
                    <br></br><br></br>
                    <button onClick={() => navigate(`/WorkerJobDetails/${job._id}`)}>
                        View Job Details
                    </button>
                  </li>
                </div>
              </div>
            ))}
          </ul>
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

export default WorkerHomePage;
