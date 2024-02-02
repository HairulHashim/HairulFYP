// client/src/WorkerCompletedJob.jsx
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

// WorkerCompletedJob component
function WorkerCompletedJob() {
  const [workerName, setWorkerName] = useState("Worker");
  const [workerId, setWorkerId] = useState("Worker");
  const [availableJobs, setAvailableJobs] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState(null);
  const [cancelModalOpen, setCancelModalOpen] = useState(false)
  const [file, setFile] = useState(null);
  const [fileViewerPath, setFileViewerPath] = useState(null);
  const [isFileViewerModalOpen, setIsFileViewerModalOpen] = useState(false);
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
                const response = await axios.get(`http://localhost:3001/jobs/completedJobs/${worker._id}`, {
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
      const response = await axios.get(`http://localhost:3001/jobs/completedJobs/${workerId}`, {
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

  const calculateAverageRating = () => {
    const completedBookings = availableJobs.flatMap(job => (
      job.booked_worker.filter(booking => (
        booking.worker_id === workerId &&
        booking.book_status === 'Completed' &&
        booking.worker_rating !== undefined
      ))
    ));

    const totalRatings = completedBookings.reduce((sum, booking) => sum + booking.worker_rating, 0);
    const averageRating = totalRatings / completedBookings.length;

    return isNaN(averageRating) ? 0 : averageRating; // Handle the case when there are no ratings
  };

  
  const calculateTotalJobHours = (job) => {
    const completedBooking = job.booked_worker.find(booking => (
      booking.worker_id === workerId &&
      booking.book_status === 'Completed'
    ));

    if (completedBooking) {
      // Parse start and end times
      const parsedClockInTime = new Date(`2000-01-01T${completedBooking.clock_in_time}`);
      const parsedClockOutTime = new Date(`2000-01-01T${completedBooking.clock_out_time}`);

      let timeDifference = parsedClockOutTime - parsedClockInTime;

      // Adjust the clockOutTime to the next day if it is after the clockInTime
      if (parsedClockOutTime < parsedClockInTime) {
        const millisecondsInDay = 1000 * 60 * 60 * 24;
        timeDifference += millisecondsInDay;
      }

      const millisecondsInHour = 1000 * 60 * 60;
      const workHours = Math.floor(timeDifference / millisecondsInHour);

      return workHours;
    }

    return 0;
  };

  const calculateTotalHoursWorked = () => {
    const totalHoursWorked = availableJobs.reduce((sum, job) => {
      return sum + calculateTotalJobHours(job);
    }, 0);

    return totalHoursWorked;
  };


  const calculateTotalJobSalary = (job) => {
    const completedBooking = job.booked_worker.find(booking => (
      booking.worker_id === workerId &&
      booking.book_status === 'Completed'
    ));

    if (completedBooking) {
      // Parse start and end times
      const parsedClockInTime = new Date(`2000-01-01T${completedBooking.clock_in_time}`);
      const parsedClockOutTime = new Date(`2000-01-01T${completedBooking.clock_out_time}`);

      let timeDifference = parsedClockOutTime - parsedClockInTime;

      // Adjust the clockOutTime to the next day if it is after the clockInTime
      if (parsedClockOutTime < parsedClockInTime) {
        const millisecondsInDay = 1000 * 60 * 60 * 24;
        timeDifference += millisecondsInDay;
      }

      const millisecondsInHour = 1000 * 60 * 60;
      const workHours = Math.floor(timeDifference / millisecondsInHour);

      // Calculate payment for the job
      const workPayment = Math.floor(workHours) * job.job_rate;

      return workPayment;
    }

    return 0;
  };

  const calculateTotalSalary = () => {
    const totalSalary = availableJobs.reduce((sum, job) => {
      return sum + calculateTotalJobSalary(job);
    }, 0);

    return totalSalary;
  };

  const calculateTotalCompletedJobs = () => {
    const totalCompletedJobs = availableJobs.reduce((sum, job) => {
      const completedBooking = job.booked_worker.find(booking => (
        booking.worker_id === workerId &&
        booking.book_status === 'Completed'
      ));

      return sum + (completedBooking ? 1 : 0);
    }, 0);

    return totalCompletedJobs;
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
      case 'highestTotalHours': // Add this case for highest total hours
        return [...availableJobs].sort((a, b) => calculateTotalJobHours(b) - calculateTotalJobHours(a));
      default:
        return availableJobs;
    }
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
              <h3>Your Completed Job</h3>
            </div>
          </div>
          <div><br></br>
          <div className="card">
            <div className="card-body">
                <h5><strong>Average Stars Rating: </strong>{calculateAverageRating().toFixed(1)} / 5 stars</h5>
                <h5><strong>Total Salary:</strong> RM {calculateTotalSalary()}</h5>
                <h5><strong>Total Hours Worked:</strong> {calculateTotalHoursWorked()} hours</h5>
                <h5><strong>Total Completed Jobs:</strong> {calculateTotalCompletedJobs()} jobs</h5>
            </div>
          </div><br></br>
            <label>Filter By:</label>
            <select onChange={(e) => handleFilterChange(e.target.value)}>
              <option value="">None</option>
              <option value="highestRate">Highest Rate</option>
              <option value="highestPayment">Highest Payment</option>
              <option value="highestTotalHours">Highest Total Hours</option> {/* Add this line */}
            </select>
          </div>
          <ul>
            {filteredJobs().map(job => (
              <div className="card" key={job._id}>
                <div className="card-body">
                  <li>
                    <strong>Job Title: </strong> {job.title}<br />
                    <strong>Job Rate: RM </strong> {job.job_rate}<br />
                    <strong>Clock In Time: </strong>{job.booked_worker.find(booking => booking.worker_id === workerId && booking.book_status === 'Completed').clock_in_time}<br />
                    <strong>Clock In Date: </strong>{job.booked_worker.find(booking => booking.worker_id === workerId && booking.book_status === 'Completed').clock_in_date}<br />
                    <strong>Clock Out Time: </strong>{job.booked_worker.find(booking => booking.worker_id === workerId && booking.book_status === 'Completed').clock_out_time}<br />
                    <strong>Clock Out Date: </strong>{job.booked_worker.find(booking => booking.worker_id === workerId && booking.book_status === 'Completed').clock_out_date}<br /><br />
                    <strong>Total Working Hours: </strong>{job.workHours} hours<br />
                    <strong>Total Working Payment:</strong> RM {job.workPayment}<br />
                    <strong>Worker Star Rating: </strong>
                    {job.booked_worker.find(booking => booking.worker_id === workerId && booking.book_status === 'Completed').worker_rating !== undefined
                      ? `${job.booked_worker.find(booking => booking.worker_id === workerId && booking.book_status === 'Completed').worker_rating}/5 Stars`
                      : 'Not rated by job provider yet'}
                    <br />
                    <strong>Payment Status: </strong>{job.booked_worker.find(booking => booking.worker_id === workerId && booking.book_status === 'Completed').payment_status}<br /><br />
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

export default WorkerCompletedJob;
