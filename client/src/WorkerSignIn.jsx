// client/src/WorkerSignIn.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function WorkerSignIn() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:3001/workers/signIn', { email, password });
            if (response.data.status === "Success") {
                // Save JWT token and worker details to session storage
                sessionStorage.setItem('jwtToken', response.data.token);
                sessionStorage.setItem('workerDetails', JSON.stringify(response.data.worker));

                navigate('/WorkerHomePage', { replace: true });
            } else if (response.data.status === "Incorrect password") {
                toast.error("Incorrect password. Please try again.");
            } else if (response.data.status === "Email not found") {
                toast.error("Email not found. Please check your email or sign up.");
            }
        } catch (error) {
            console.error('Error signing in:', error);
            toast.error("Error signing in. Please try again.");
        }
    }

    return (
        <div>
            <div className="row">
                <div className="col-md-6 text-center text-md-start d-flex flex-column justify-content-center" style={{ backgroundColor: '#92A8D1', height: '100vh' }}>
                    <h1 className="my-5 display-3 fw-bold ls-tight px-3" style={{ color: '#FFFFFF' }}>
                    <span style={{ backgroundColor: '#FFFFFF', color: '#92A8D1', borderRadius: '25px' }}>Welcome to</span> <br />
                    <span style={{ backgroundColor: '#FFFFFF', color: '#92A8D1', borderRadius: '25px'  }}>Crowdworker</span><br />
                    <span style={{ backgroundColor: '#FFFFFF', color: '#92A8D1', borderRadius: '25px'  }}>Recruitment Platform</span>
                    </h1>
                    <p className='px-3' style={{ color: '#FFFFFF' }}>
                        By Hairul Hashim
                    </p>
                </div>
                <div className="col-md-6 position-relative">
                    <div className='my-5 bg-glass'>
                        <div style={{ textAlign: 'center'}} className='p-5'>
                        <div >
                            <span style={{
                                fontFamily: 'cursive',
                                fontWeight: 'bold',
                                fontSize: '2.9em',
                                color: '#3498db',
                                background: '#fff',
                                padding: '5px 10px',
                                borderRadius: '70px',
                                border: '10px solid #92A8D1',
                                display: 'inline-block',
                            }}>
                                Event<span style={{ color: '#20B2AA' }}>Recruit</span>
                            </span>
                        </div><br></br>
                        <h3><span >Worker Sign In</span></h3>
                            <div className="card">
                            <div className="card-title"></div>
                                <div className="card-body">
                                    {/* Form Inputs */}
                                    <form onSubmit={handleSubmit}>
                                        <div className="mb-4">
                                            <label htmlFor="email" className="form-label"><strong>Email</strong></label>
                                            <input type="email" className="form-control" id="email" onChange={(e) => setEmail(e.target.value)} required />
                                        </div>
                                        <div className="mb-4">
                                            <label htmlFor="password" className="form-label"><strong>Password</strong></label>
                                            <input type="password" className="form-control" id="password" onChange={(e) => setPassword(e.target.value)} required />
                                        </div>

                                        {/* Sign In Button */}
                                        <button type="submit" className="btn btn-primary w-100 mb-4">Sign In</button>

                                        {/* Social Media Buttons */}
                                        <div className="text-center">
                                            <p>Do not have Account. <Link to="/WorkerSignUp">Sign Up Here</Link></p>

                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <ToastContainer position="bottom-right" autoClose={5000} />
        </div>
    );
}

export default WorkerSignIn;
