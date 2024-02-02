// client/src/ProviderSignUp.jsx
import { useState } from "react";
import { Link } from "react-router-dom";
import axios from 'axios';
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useDropzone } from 'react-dropzone';

function ProviderSignUp() {
    const [ssm_num, setSsmNum] = useState("");
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [owner_name, setOwnerName] = useState("");
    const [password, setPassword] = useState("");
    const [doe, setDoe] = useState("");
    const [no_tel, setNoTel] = useState("");
    const [image, setImage] = useState(null);  // Updated to store image data
    const [address, setAddress] = useState("");
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
        formData.append('ssm_num', ssm_num);
        formData.append('name', name);
        formData.append('email', email);
        formData.append('owner_name', owner_name);
        formData.append('password', password);
        formData.append('doe', doe);
        formData.append('no_tel', no_tel);
        formData.append('address', address);
        formData.append('image', image);  // Append the image data

        try {
            const response = await axios.post('http://localhost:3001/providers/signUp', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            console.log(response);
            navigate('/ProviderSignIn');
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
                            <h3 >Job Provider Sign Up</h3>
                            <div className="card">
                                <div className="card-body">
                                    <h2 className="card-title"></h2>
                                    <form onSubmit={handleSubmit}>
                                        <div className="mb-3">
                                            <label htmlFor="ssm_num" className="form-label"><strong>SSM Number</strong></label>
                                            <input type="text" className="form-control" id="ssm_num" value={ssm_num} maxLength="12" 
                                            onChange={(e) => { const numericValue = e.target.value.replace(/[^0-9]/g, ''); setSsmNum(numericValue); }} 
                                            required />  
                                        </div>
                                        <div className="mb-3">
                                            <label htmlFor="name" className="form-label"><strong>Business Name</strong></label>
                                            <input type="text" className="form-control" id="name" onChange={(e) => setName(e.target.value)} required />
                                        </div>
                                        <div className="mb-3">
                                            <label htmlFor="email" className="form-label"><strong>Business Email</strong></label>
                                            <input type="email" className="form-control" id="email" onChange={(e) => setEmail(e.target.value)} required />
                                        </div>
                                        <div className="mb-3">
                                            <label htmlFor="owner_name" className="form-label"><strong>Owner Name</strong></label>
                                            <input type="text" className="form-control" id="owner_name" onChange={(e) => setOwnerName(e.target.value)} required />
                                        </div>
                                        <div className="mb-3">
                                            <label htmlFor="password" className="form-label"><strong>Password</strong></label>
                                            <input type="password" className="form-control" id="password" onChange={(e) => setPassword(e.target.value)} required />
                                        </div>
                                        <div className="mb-3">
                                            <label htmlFor="doe" className="form-label"><strong>Date of Establishment</strong></label>
                                            <input type="date" className="form-control" id="doe" onChange={(e) => setDoe(e.target.value)} />
                                        </div>
                                        <div className="mb-3">
                                            <label htmlFor="no_tel" className="form-label"><strong>Business Contact Number</strong></label>
                                            <input type="tel" className="form-control" id="no_tel" onChange={(e) => setNoTel(e.target.value)} />
                                        </div>
                                        <div className="mb-3">
                                            <label htmlFor="image" className="form-label"><strong>Business Image</strong></label>
                                            <div {...getRootProps()} className="dropzone">
                                                <input {...getInputProps()} />
                                                <p>Drag 'n' drop an image here, or click to select an image</p>
                                            </div>
                                        </div>
                                        <div className="mb-3">
                                            <label htmlFor="address" className="form-label"><strong>Business Address</strong></label>
                                            <textarea className="form-control" id="address" onChange={(e) => setAddress(e.target.value)} />
                                        </div>
                                        <button type="submit" className="btn btn-primary">Register</button>
                                    </form>
                                    <div className="mt-3">
                                        <p>Already have an account. <Link to="/ProviderSignIn">Sign In Here</Link></p>
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

export default ProviderSignUp;
