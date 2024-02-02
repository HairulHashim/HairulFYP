// client/src/WorkerOnGoingJob.jsx
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


// WorkerOnGoingJob component
function WorkerOnGoingJob() {
  const [workerName, setWorkerName] = useState("Worker");
  const [workerId, setWorkerId] = useState("Worker");
  const [availableJobs, setAvailableJobs] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState(null);
  const [cancelModalOpen, setCancelModalOpen] = useState(false)
  const [isSidebarOpen, setSidebarOpen] = useState(false);;
  const [selectedJobId, setSelectedJobId] = useState(null);
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
                const response = await axios.get(`http://localhost:3001/jobs/onGoingJobs/${worker._id}`, {
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
      const response = await axios.get(`http://localhost:3001/jobs/onGoingJobs/${workerId}`, {
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
          fetchJobs();
        })
        .catch(error => {
          console.error('Error attending job:', error);
        });
    }
  };

  const handleCancelBooking = (cancelReason) => {
    axios.post(`http://localhost:3001/jobs/cancelJob/${selectedJobId}/${workerId}`, { cancelReason })
      .then(response => {
        console.log(response.data.message);
        fetchJobs();
      })
      .catch(error => {
        console.error('Error canceling job:', error);
      })
      .finally(() => {
        setCancelModalOpen(false);
        setSelectedJobId(null);
      });
  };

  const handleFilterChange = (filter) => {
    setSelectedFilter(filter);
  };

  const filteredJobs = () => {
    if (!selectedFilter) {
      return availableJobs;
    }

    switch (selectedFilter) {
      case 'startTime':
        return [...availableJobs].sort((a, b) => {
          const dateTimeA = new Date(`${a.date} ${a.time}`);
          const dateTimeB = new Date(`${b.date} ${b.time}`);
          return dateTimeA - dateTimeB;
        });
      case 'highestRate':
        return [...availableJobs].sort((a, b) => b.job_rate - a.job_rate);
      case 'highestPayment':
        return [...availableJobs].sort((a, b) => (b.job_rate * b.job_hours) - (a.job_rate * a.job_hours));
      default:
        return availableJobs;
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
              <h3>Your On Going Job</h3>
            </div>
          </div>
          <div>
            <label>Filter By:</label>
            <select onChange={(e) => handleFilterChange(e.target.value)}>
              <option value="">None</option>
              <option value="startTime">Closest Start Time</option>
              <option value="highestRate">Highest Rate</option>
              <option value="highestPayment">Highest Payment</option>
            </select>
          </div>
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
                    <strong>Clock In Time: </strong>{job.booked_worker.find(booking => booking.worker_id === workerId && (booking.book_status === 'Attended' || booking.book_status === 'Started' || booking.book_status === 'Completed')).clock_in_time}<br />
                    <strong>Clock In Date: </strong>{job.booked_worker.find(booking => booking.worker_id === workerId && (booking.book_status === 'Attended' || booking.book_status === 'Started' || booking.book_status === 'Completed')).clock_in_date}<br /><br />
                    <strong>Clock Out Time: </strong>{job.booked_worker.find(booking => booking.worker_id === workerId && (booking.book_status === 'Attended' || booking.book_status === 'Started' || booking.book_status === 'Completed')).clock_out_time}<br />
                    <strong>Clock Out Date: </strong>{job.booked_worker.find(booking => booking.worker_id === workerId && (booking.book_status === 'Attended' || booking.book_status === 'Started' || booking.book_status === 'Completed')).clock_out_date}<br /><br />
                    {job.booked_worker.filter(booking => (
                        booking.book_status === 'Confirmed' || booking.book_status === 'Attended' || booking.book_status === 'Completed'
                    )).length === job.required_worker && !job.booked_worker.some(booking => (
                        booking.worker_id === workerId &&
                        (booking.book_status === 'Confirmed' || booking.book_status === 'Attended' || booking.book_status === 'Completed')
                    )) ? (
                        <p>This job is fully booked.</p>
                    ) : (
                        // Render the "Book Job" or "View Payment" button based on the job status
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
                                          (booking.book_status === 'Completed')
                                        )) ? (
                                            <button onClick={() => openFileViewerModal(job.booked_worker.find(booking => booking.worker_id === workerId && (booking.book_status === 'Completed')).payment_proof)}>
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
          <button onClick={handleSignOut} className="btn btn-danger">Sign Out</button><br></br>
          <Link to="/WorkerEditDetails">Edit Your Account</Link>
        </div>
      </div>
      {/* Render the cancel modal */}
      <CancelModal
        isOpen={cancelModalOpen}
        onCancel={() => setCancelModalOpen(false)}
        onConfirmCancel={handleCancelBooking}
      />
    </div>
    </div>
  );
}

export default WorkerOnGoingJob;
