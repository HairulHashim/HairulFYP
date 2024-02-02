// client/src/ViewCompletedBookedWorker.jsx

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useParams } from 'react-router-dom';
import { Link } from "react-router-dom";
import axios from 'axios';
import Modal from "react-modal";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser } from '@fortawesome/free-solid-svg-icons';
import ProviderNavBar from './ProviderNavBar';

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

// Worker Rating Modal component
const RatingModal = ({ isOpen, onCancel, onSubmit, onRatingChange }) => {
    const [rating, setRating] = useState(0);

    const handleRatingChange = (event) => {
        onRatingChange(Number(event.target.value));
        console.log('Rating changed:', Number(event.target.value));
    };

    const handleRatingSubmit = () => {
        onSubmit(rating);
        // Reset the rating after submission
        setRating(0);
    };

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onCancel}
            contentLabel="Rate Worker Modal"
            style={modalStyles}
        >
            <h2>Rate Worker</h2>
            <label>Select Rating:</label>
            <select onChange={handleRatingChange}>
            <option value="0" disabled>Select a rating</option>
            {[1, 2, 3, 4, 5].map(value => (
                <option key={value} value={value}>
                    {value}
                </option>
            ))}
        </select>
            <button onClick={handleRatingSubmit}>Submit Rating</button>
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

// ViewCompletedBookedWorker component
function ViewCompletedBookedWorker() {
    const { jobId } = useParams();
    const [bookedWorkers, setBookedWorkers] = useState([]);
    const [selectedWorkers, setSelectedWorkers] = useState([]);
    const [sortOption, setSortOption] = useState(null);
    const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
    const [selectedWorkerId, setSelectedWorkerId] = useState(null);
    const [rating, setRating] = useState(0);
    const [file, setFile] = useState(null);
    const [fileViewerPath, setFileViewerPath] = useState(null);
    const [isFileViewerModalOpen, setIsFileViewerModalOpen] = useState(false);
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const storedProviderDetails = sessionStorage.getItem('providerDetails');
        if (!storedProviderDetails) {
            navigate('/ProviderSignIn');
        } else {
            axios.get(`http://localhost:3001/jobs/completedBookedWorkers/${jobId}`)
                .then(async response => {
                    const workersWithStats = await Promise.all(response.data.map(async worker => {
                        const statsResponse = await axios.get(`http://localhost:3001/jobs/workerJobStats/${worker.worker_id.worker_id}`);
                        return { ...worker, ...statsResponse.data };
                    }));

                    if (sortOption) {
                        const sortedWorkers = [...workersWithStats];
                        sortedWorkers.sort((a, b) => {
                            switch (sortOption) {
                                case 'rating':
                                    return b.averageRatingCompletedJobs - a.averageRatingCompletedJobs;
                                case 'cancelled':
                                    return a.totalCancelled - b.totalCancelled;
                                case 'missing':
                                    return a.totalMissing - b.totalMissing;
                                case 'completed':
                                    return b.totalCompleted - a.totalCompleted;
                                default:
                                    return 0;
                            }
                        });
                        setBookedWorkers(sortedWorkers);
                    } else {
                        setBookedWorkers(workersWithStats);
                    }
                })
                .catch(error => {
                    console.error('Error fetching booked workers:', error);
                });
        }
    }, [navigate, jobId, sortOption]);

    const handleCheckboxChange = (workerId) => {
        setSelectedWorkers(prevSelected => {
            if (prevSelected.includes(workerId)) {
                return prevSelected.filter(id => id !== workerId);
            } else {
                return [...prevSelected, workerId];
            }
        });
    };

    const openRatingModal = (workerId) => {
        setSelectedWorkerId(workerId);
        setIsRatingModalOpen(true);
    };

    // Function to close the rating modal
    const closeRatingModal = () => {
        setSelectedWorkerId(null);
        setRating(0);
        setIsRatingModalOpen(false);
    };

    // Function to submit the worker rating
    const handleRatingSubmit = async () => {
        try {
            console.log('Rating to be submitted:', rating);
            // Make an Axios POST request to the rateWorker endpoint
            await axios.post(`http://localhost:3001/jobs/rateWorker/${jobId}/${selectedWorkerId}`, { rating });
            console.log('Rating submitted successfully');

            // Refresh the worker list after file submission
            const response = await axios.get(`http://localhost:3001/jobs/completedBookedWorkers/${jobId}`);
            const workersWithStats = await Promise.all(response.data.map(async worker => {
                const statsResponse = await axios.get(`http://localhost:3001/jobs/workerJobStats/${worker.worker_id.worker_id}`);
                return { ...worker, ...statsResponse.data };
            }));
            setBookedWorkers(workersWithStats);

            // Close the rating modal
            closeRatingModal();
        } catch (error) {
            console.error('Error submitting rating:', error);
            // Handle error scenarios
        }
    };

    // Function to handle file selection
    const handleFileChange = (event) => {
        const selectedFile = event.target.files[0];
        setFile(selectedFile);
    };

    // Function to submit the file
    const handleFileSubmit = async (workerId) => {
        try {
            // Set the selected worker ID
            setSelectedWorkerId(workerId);
    
            if (!workerId) {
                console.error('Selected worker ID is null');
                return;
            }
    
            // Create a FormData object and append the file
            const formData = new FormData();
            formData.append('file', file);
    
            // Make an Axios POST request to the uploadFile endpoint
            await axios.post(`http://localhost:3001/jobs/uploadPaymentProof/${jobId}/${workerId}`, formData);
    
            // Refresh the worker list after file submission
            const response = await axios.get(`http://localhost:3001/jobs/completedBookedWorkers/${jobId}`);
            const workersWithStats = await Promise.all(response.data.map(async worker => {
                const statsResponse = await axios.get(`http://localhost:3001/jobs/workerJobStats/${worker.worker_id.worker_id}`);
                return { ...worker, ...statsResponse.data };
            }));
            setBookedWorkers(workersWithStats);
    
            // Close the file upload modal
            setFile(null);
        } catch (error) {
            console.error('Error submitting file:', error);
            // Handle error scenarios
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
        case 4:
        // Handle button 4 click
        break;
        default:
        break;
    }
    };

    const handleSignOut = () => {
        sessionStorage.removeItem('providerDetails');
        navigate('/ProviderSignIn');
    };

    return (
        <div style={{backgroundColor : "#f0f8ff",  minHeight: "100vh"}}>
        <ProviderNavBar
          isOpen={isSidebarOpen}
          onToggle={handleSidebarToggle}
          onButtonClick={handleSidebarButtonClick}
        />
        <div className="container pt-5">
            <div className="row justify-content-center">
                <div className="col-md-6">
                    <div className="card">
                        <div className="card-body">
                            <h2>Manage Completed Booked Workers</h2></div>
                            </div>
                            <div>
                                <label>Sort By:</label>
                                <select onChange={(e) => setSortOption(e.target.value)}>
                                    <option value="">Select Option</option>
                                    <option value="rating">Highest Star Rating</option>
                                    <option value="completed">Highest Completed Jobs</option>
                                    <option value="cancelled">Least Cancelled Jobs</option>
                                    <option value="missing">Least Missing Jobs</option>
                                </select>
                            </div><br></br>
                            {bookedWorkers.length > 0 ? (
                                <ul>
                                    {bookedWorkers.map(worker => (<div className="card">
                        <div className="card-body">
                                        <li key={worker._id}>
                                            <strong>Worker Name: </strong>{worker.worker_id && worker.worker_id.name}<br />
                                            <strong>Email: </strong>{worker.worker_id && worker.worker_id.email}<br />
                                            <strong>Booking Status: </strong>{worker.book_status}<br />
                                            <strong>Total Cancelled Jobs: </strong>{worker.totalCancelled}<br />
                                            <strong>Total Completed Jobs: </strong>{worker.totalCompleted}<br />
                                            <strong>Total Missing Jobs: </strong>{worker.totalMissing}<br />
                                            <strong>Average Star Rating for Completed Jobs: </strong>{worker.averageRatingCompletedJobs ? worker.averageRatingCompletedJobs.toFixed(2) : 'N/A'}<br />
                                            {worker.clock_in_time && (
                                                <><strong>Clock-In Time: </strong>{worker.clock_in_time}<br /></>
                                            )}
                                            {worker.clock_out_time && (
                                                <><strong>Clock-Out Time: </strong>{worker.clock_out_time}<br /></>
                                            )}
                                            {worker.book_status !== 'Completed' && (
                                                <>
                                                    <input
                                                        type="checkbox"
                                                        onChange={() => handleCheckboxChange(worker._id)}
                                                        checked={selectedWorkers.includes(worker._id)}
                                                    />
                                                    <br />
                                                </>
                                            )}
                                            {worker.worker_rating ? (
                                                <p><strong>Worker Rating: </strong>{worker.worker_rating.toFixed(2)}</p>
                                            ) : (
                                                <button onClick={() => openRatingModal(worker._id)}>Rate Worker</button>
                                            )}
                                            {worker.payment_status === 'Waiting' ? (
                                                <>
                                                    <p><strong>Payment Status: </strong>{worker.payment_status}</p>
                                                    <input type="file" onChange={handleFileChange} />
                                                    <button onClick={() => { handleFileSubmit(worker._id); }}>Upload File</button>
                                                </>
                                            ) : (
                                                <>
                                                    <p><strong>Payment Status: </strong>{worker.payment_status}</p>
                                                    {worker.payment_status === 'Pending' || worker.payment_status === 'Rejected' ? (
                                                        <>
                                                            <p><strong>Payment File: </strong>{worker.payment_proof}</p>
                                                            <p><button onClick={() => openFileViewerModal(worker.payment_proof)}>View File</button></p>
                                                            <input type="file" onChange={handleFileChange} />
                                                            <button onClick={() => { handleFileSubmit(worker._id); }}>Change File</button>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <p><strong>Payment File: </strong>{worker.payment_proof}</p>
                                                            <p><button onClick={() => openFileViewerModal(worker.payment_proof)}>View File</button></p>
                                                        </>
                                                    )}
                                                </>
                                            )}<br></br><br></br>
                                            {worker.totalCompleted > 0 ? (
                                                <Link to={`/ViewWorkerHistory/${worker.worker_id && worker.worker_id.worker_id}`}>
                                                    View Worker History
                                                </Link>
                                            ) : (
                                                <p>This worker has never been approved after booking a job.</p>
                                            )}<br></br>
                                            <Link >
                                                    View Worker Profile
                                                </Link>
                                        </li></div></div>
                                    ))}
                                    <br></br><br />
                                </ul>
                            ) : (
                                <p>No booked workers for this job</p>
                            )}
                       <button onClick={handleSignOut} className="btn btn-danger">Sign Out</button>
                </div>
            </div>
            {/* Render the rating modal */}
            <RatingModal
                isOpen={isRatingModalOpen}
                onCancel={closeRatingModal}
                onSubmit={handleRatingSubmit}
                onRatingChange={setRating}
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

export default ViewCompletedBookedWorker;