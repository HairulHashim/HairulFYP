// client/src/WorkerSignUp.jsx
import { useState } from "react";
import { Link } from "react-router-dom";
import axios from 'axios';
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useDropzone } from 'react-dropzone';

function WorkerSignUp() {
    const [noIc, setNoIc] = useState("");
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [gender, setGender] = useState("");
    const [dob, setDob] = useState("");
    const [no_tel, setNoTel] = useState("");
    const [image, setImage] = useState(null);  // Updated to store image data
    const [home_address, setHomeAddress] = useState("");
    const navigate = useNavigate();

    const { getRootProps, getInputProps } = useDropzone({
        accept: 'image/*',
        onDrop: acceptedFiles => {
            // Update state with the accepted file
            setImage(acceptedFiles[0]);
        },
    });

    const handleSubmit = async (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append('no_ic', noIc);
        formData.append('name', name);
        formData.append('email', email);
        formData.append('password', password);
        formData.append('gender', gender);
        formData.append('dob', dob);
        formData.append('no_tel', no_tel);
        formData.append('home_address', home_address);
        formData.append('image', image);  // Append the image data

        try {
            const response = await axios.post('http://localhost:3001/workers/signUp', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            console.log(response);
            navigate('/WorkerSignIn');
        } catch (error) {
            console.error(error);
            if (error.response && error.response.status === 400) {
                // Check if the error is due to the email being already registered
                toast.error("Email is already registered.");
            }
        }
    }

    return (
        <div>
            <div className="row">
                <div className="col-md-6 text-center text-md-start d-flex flex-column justify-content-center" style={{ backgroundColor: '#92A8D1', minHeight: '100vh' }}>
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
                        <div style={{ textAlign: 'center' }} className='p-5'>
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
                            <h3 >Worker Sign Up</h3>
                            <div className="card">
                                <div className="card-body">
                                    <h2 className="card-title"></h2>
                                    <form onSubmit={handleSubmit}>
                                        <div className="mb-3">
                                            <label htmlFor="noIc" className="form-label"><strong>IC Number</strong></label>
                                            <input type="text" className="form-control" id="noIc" value={noIc} maxLength="12" 
                                            onChange={(e) => { const numericValue = e.target.value.replace(/[^0-9]/g, ''); setNoIc(numericValue); }} 
                                            required />  
                                        </div>
                                        <div className="mb-3">
                                            <label htmlFor="name" className="form-label"><strong>Name</strong></label>
                                            <input type="text" className="form-control" id="name" onChange={(e) => setName(e.target.value)} required />
                                        </div>
                                        <div className="mb-3">
                                            <label htmlFor="email" className="form-label"><strong>Email</strong></label>
                                            <input type="email" className="form-control" id="email" onChange={(e) => setEmail(e.target.value)} required />
                                        </div>
                                        <div className="mb-3">
                                            <label htmlFor="password" className="form-label"><strong>Password</strong></label>
                                            <input type="password" className="form-control" id="password" onChange={(e) => setPassword(e.target.value)} required />
                                        </div>
                                        <div className="mb-3">
                                            <label htmlFor="gender" className="form-label"><strong>Gender</strong></label>
                                            <select className="form-select" id="gender" onChange={(e) => setGender(e.target.value)} required>
                                                <option value="">Select Gender</option>
                                                <option value="Male">Male</option>
                                                <option value="Female">Female</option>
                                            </select>
                                        </div>
                                        <div className="mb-3">
                                            <label htmlFor="dob" className="form-label"><strong>Date of Birth</strong></label>
                                            <input type="date" className="form-control" id="dob" onChange={(e) => setDob(e.target.value)} />
                                        </div>
                                        <div className="mb-3">
                                            <label htmlFor="no_tel" className="form-label"><strong>Phone Number</strong></label>
                                            <input type="tel" className="form-control" id="no_tel" onChange={(e) => setNoTel(e.target.value)} />
                                        </div>
                                        <div className="mb-3">
                                            <label htmlFor="image" className="form-label"><strong>Profile Image</strong></label>
                                            <div {...getRootProps()} className="dropzone">
                                                <input {...getInputProps()} />
                                                <p>Drag 'n' drop an image here, or click to select an image</p>
                                            </div>
                                        </div>
                                        <div className="mb-3">
                                            <label htmlFor="home_address" className="form-label"><strong>Home Address</strong></label>
                                            <textarea className="form-control" id="home_address" onChange={(e) => setHomeAddress(e.target.value)} />
                                        </div>
                                        <button type="submit" className="btn btn-primary">Register</button>
                                    </form>
                                    <div className="mt-3">
                                        <p>Already have an account. <Link to="/WorkerSignIn">Sign In Here</Link></p>
                                    </div>
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

export default WorkerSignUp;
