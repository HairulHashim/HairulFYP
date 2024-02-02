// client/src/CreateJobPost.jsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from 'axios';
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ProviderNavBar from './ProviderNavBar';

function CreateJobPost() {
    const [providerId, setProviderId] = useState("");
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [location, setLocation] = useState("");
    const [address, setAddress] = useState("");
    const [linkLocation, setLinkLocation] = useState("");
    const [startDate, setStartDate] = useState("");
    const [startHours, setStartHours] = useState("");
    const [startMinutes, setStartMinutes] = useState("");
    const [endDate, setEndDate] = useState("");
    const [endHours, setEndHours] = useState("");
    const [endMinutes, setEndMinutes] = useState("");
    const [jobHours, setJobHours] = useState("");
    const [jobRate, setJobRate] = useState("");
    const [dressCode, setDressCode] = useState("");
    const [requiredWorker, setRequiredWorker] = useState("");
    const [isSidebarOpen, setSidebarOpen] = useState(false);;
    const navigate = useNavigate();

    useEffect(() => {
        // Fetch provider details when the component mounts
        const storedProviderDetails = sessionStorage.getItem('providerDetails');
        if (storedProviderDetails) {
            const provider = JSON.parse(storedProviderDetails);
            setProviderId(provider._id); // Set the providerId from the retrieved provider details
        }
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
    
        const providerId = JSON.parse(sessionStorage.getItem('providerDetails'))._id;
        
        /* let startHours24 = parseInt(startHours, 10);
        let endHours24 = parseInt(endHours, 10);
        
        Adjust to 24-hour format based on AM/PM for starting time
        if (startAmPm === "PM" && startHours24 !== 12) {
            startHours24 += 12;
        } else if (startAmPm === "AM" && startHours24 === 12) {
            startHours24 = 0; // Convert 12 AM to 0 hours
        }
        
        // Adjust to 24-hour format based on AM/PM for closing time
        if (endAmPm === "PM" && endHours24 !== 12) {
            endHours24 += 12;
        } else if (endAmPm === "AM" && endHours24 === 12) {
            endHours24 = 0; // Convert 12 AM to 0 hours
        }*/
        
        const startTime = `${startHours.toString().padStart(2, '0')}:${startMinutes.toString().padStart(2, '0')}:00`;
        const endTime = `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}:00`;

        // Parse start and end dates
        const parsedStartDate = new Date(startDate);
        const parsedEndDate = new Date(endDate);

        // Parse start and end times
        const parsedStartTime = new Date(`2000-01-01T${startTime}`);
        const parsedEndTime = new Date(`2000-01-01T${endTime}`);

        // Check if endDate is before startDate
        if (parsedEndDate < parsedStartDate) {
            toast.error('Closing date cannot be before the starting date');
            return;
        }

        // Check if endDate is the same as startDate and endTime is before startTime
        if (parsedEndDate.getTime() === parsedStartDate.getTime() && parsedEndTime <= parsedStartTime) {
            toast.error('Closing time cannot be the same as or before the starting time on the same day');
            return;
        }

        // Calculate job hours
        let timeDifference = parsedEndTime - parsedStartTime;

        // Check if end time is on the next day
        if (parsedEndTime < parsedStartTime) {
            const millisecondsInDay = 1000 * 60 * 60 * 24;
            timeDifference += millisecondsInDay;
        }

        const millisecondsInHour = 1000 * 60 * 60;
        const jobHours = timeDifference / millisecondsInHour;
    
        axios.post(`http://localhost:3001/jobs/createJobPost/${providerId}`, {
            title,
            description,
            address,
            location,
            linkLocation,
            startDate,
            startTime,
            endDate,
            endTime,
            jobHours,
            jobRate,
            requiredWorker
        })
        .then(response => {
            console.log(response.data);
            toast.success(response.data.message);
            navigate('/providerHomePage'); // Redirect to the provider home page
        })
        .catch(error => {
            console.error('Error creating job post:', error);
            toast.error('Error creating job post');
        });
    };

    const getCurrentDate = () => {
        const currentDate = new Date();
        const year = currentDate.getFullYear();
        let month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
        let day = currentDate.getDate().toString().padStart(2, '0');
        return `${year}-${month}-${day}`;
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
          case 5:
            // Handle button 5 click
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
        <div className="container mt-5">
            <div className="row justify-content-center">
                <div className="col-md-6">
                    <div className="card">
                        <div className="card-body">
                            <h2 className="card-title">Create Job Post</h2>
                            <form onSubmit={handleSubmit}>
                            <div className="mb-3">
                                <label htmlFor="title" className="form-label"><strong>Title</strong></label>
                                <select className="form-select" id="title" value={title} onChange={(e) => setTitle(e.target.value)} required >
                                    <option value="" disabled>Select a job title</option>
                                    <option value="Kitchen Helper">Kitchen Helper</option>
                                    <option value="Steward Cleaner">Steward Cleaner</option>
                                    <option value="Banquet Server">Banquet Server</option>
                                    <option value="Event Crew">Event Crew</option>
                                </select>
                            </div>
                                <div className="mb-3">
                                    <label htmlFor="description" className="form-label"><strong>Description</strong></label>
                                    <textarea
                                        className="form-control"
                                        id="description"
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="address" className="form-label"><strong>Full Address</strong></label>
                                    <input type="text" className="form-control" id="address" value={address} onChange={(e) => setAddress(e.target.value)} required />
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="location" className="form-label"><strong>Location</strong></label>
                                    <select className="form-select" id="location" value={location} onChange={(e) => setLocation(e.target.value)}>
                                        <option value={"Selangor"}>Selangor</option>
                                        <option value={"Kuala Lumpur"}>Kuala Lumpur</option>
                                    </select>
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="linkLocation" className="form-label"><strong>Link location on map</strong></label>
                                    <input type="text" className="form-control" id="linkLocation" value={linkLocation} onChange={(e) => setLinkLocation(e.target.value)} required />
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="startDate" className="form-label"><strong>Starting Date</strong></label>
                                    <input type="date" className="form-control" id="startDate" value={startDate} min={getCurrentDate()} onChange={(e) => setStartDate(e.target.value)} required /><br />
                                    <div className="mb-3" style={{ display: "flex" }}>
                                        <div style={{ width: "50%" }}>
                                            <label htmlFor="startHours" className="form-label"><strong>Starting Hours</strong></label>
                                            <input type="number" className="form-control" id="startHours" value={startHours} onChange={(e) => setStartHours(e.target.value)} min="0" max="23" required />
                                        </div>
                                        <div style={{ width: "50%" }}>
                                            <label htmlFor="startMinutes" className="form-label"><strong>Starting Minute</strong></label>
                                            <select className="form-select" id="startMinutes" value={startMinutes} onChange={(e) => setStartMinutes(Number(e.target.value))}>
                                                <option value={0}>00</option>
                                                <option value={30}>30</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="endDate" className="form-label"><strong>Closing Date</strong></label>
                                    <input type="date" className="form-control" id="endDate" value={endDate} min={getCurrentDate()} onChange={(e) => setEndDate(e.target.value)} required /><br />
                                    <div className="mb-3" style={{ display: "flex" }}>
                                        <div style={{ width: "50%" }}>
                                            <label htmlFor="endHours" className="form-label"><strong>Closing Hours</strong></label>
                                            <input type="number" className="form-control" id="endHours" value={endHours} onChange={(e) => setEndHours(e.target.value)} min="0" max="23" required />
                                        </div>
                                        <div style={{ width: "50%" }}>
                                            <label htmlFor="endMinutes" className="form-label"><strong>Closing Minute</strong></label>
                                            <select className="form-select" id="endMinutes" value={endMinutes} onChange={(e) => setEndMinutes(Number(e.target.value))}>
                                                <option value={0}>00</option>
                                                <option value={30}>30</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                                <div className="mb-3">
                                <label htmlFor="jobRate" className="form-label"><strong>Job Rate in RM</strong></label>
                                    <input type="number" className="form-control" id="jobRate" value={jobRate} onChange={(e) => setJobRate(e.target.value)} min="1" max="50" required />
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="requiredWorker" className="form-label"><strong>Required Worker</strong></label>
                                    <input type="number" className="form-control" id="requiredWorker" value={requiredWorker} onChange={(e) => setRequiredWorker(e.target.value)} required />
                                </div>
                                <button type="submit" className="btn btn-primary">Create Job Post</button>
                            </form>
                            <div className="mt-3">
                                {/* Add additional UI elements as needed */}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <ToastContainer position="bottom-right" autoClose={5000} />
        </div>
        </div>
    );
}

export default CreateJobPost;
