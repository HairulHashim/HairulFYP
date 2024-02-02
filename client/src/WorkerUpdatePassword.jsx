// client/src/WorkerUpdatePassword.jsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from 'axios';
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import WorkerNavBar from './WorkerNavBar';

function WorkerUpdatePassword() {
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const [workerId, setWorkerId] = useState("");
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [gender, setGender] = useState("");
    const [no_tel, setNoTel] = useState("");
    const [home, setHome] = useState("");
    const [dob, setDob] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        // Fetch worker details when the component mounts
        const storedWorkerDetails = sessionStorage.getItem('workerDetails');
        if (storedWorkerDetails) {
            const worker = JSON.parse(storedWorkerDetails);
            setWorkerId(worker._id); // Set the workerId from the retrieved worker details
            setName(worker.name);
            setEmail(worker.email);
            setGender(worker.gender); // Added this line
            setNoTel(worker.no_tel); // Added this line
            setHome(worker.home); // Added this line
            setDob(worker.dob); // Added this line
        }
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        const workerId = JSON.parse(sessionStorage.getItem('workerDetails'))._id;

        // Log the data being sent to the server
        console.log('Data to be sent:', { name, email });
        
        // Send a request to update worker details
        axios.post(`http://localhost:3001/workers/editDetails/${workerId}`, { name, email })
            .then(response => {
                console.log(response.data.message);
                toast.success(response.data.message);
                // Redirect to WorkerHomePage after successful update
                navigate('/WorkerHomePage');
            })
            .catch(error => {
                console.error('Error updating worker details:', error);
                toast.error('Error updating worker details');
            });
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
        <div className="containers" style={{ backgroundColor: "#f0f8ff", minHeight: "100vh"}}>
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
                            <h2 className="card-title">Updated Password Account</h2>
                            <form onSubmit={handleSubmit}>
                                <div className="mb-3">
                                    <label htmlFor="name" className="form-label"><strong>Old Password</strong></label>
                                    <input type="text" className="form-control" id="name" value={name} onChange={(e) => setName(e.target.value)} required />
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="email" className="form-label"><strong>New Password</strong></label>
                                    <input type="text" className="form-control" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="gender" className="form-label"><strong>New Confirm Password</strong></label>
                                    <input type="text" className="form-control" id="gender" value={gender} onChange={(e) => setGender(e.target.value)}required />
                                </div>
                                <button type="submit" className="btn btn-primary">Update</button>
                            </form>
                            <div className="mt-3">
                                <Link to="/WorkerHomePage">Cancel</Link>
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

export default WorkerUpdatePassword;
