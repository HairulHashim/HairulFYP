// client/src/app.jsx

import { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import WorkerSideBar from './WorkerNavBar';
import WorkerSignUp from './WorkerSignUp';
import WorkerSignIn from './WorkerSignIn';
import WorkerHomePage from './WorkerHomePage';
import WorkerPendingJob from './WorkerPendingJob';
import WorkerConfirmedJob from './WorkerConfirmedJob';
import WorkerOnGoingJob from './WorkerOnGoingJob';
import WorkerCompletedJob from './WorkerCompletedJob';
import WorkerPastJob from './WorkerPastJob';
import WorkerJobDetails from './WorkerJobDetails';
import WorkerEditDetails from './WorkerEditDetails';
import WorkerUpdatePassword from './WorkerUpdatePassword';
import ProviderSignIn from './ProviderSignIn';
import ProviderSignUp from './ProviderSignUp.jsx';
import ProviderHomePage from './ProviderHomePage';
import CreateJobPost from './CreateJobPost';
import ViewBookedWorker from './ViewBookedWorker';
import ViewConfirmedBookedWorker from './ViewConfirmedBookedWorker';
import ViewPendingBookedWorker from './ViewPendingBookedWorker';
import ViewCompletedBookedWorker from './ViewCompletedBookedWorker';
import ViewWorkerHistory from './ViewWorkerHistory';
import ViewCompletedJobs from './ViewCompletedJobs';
import WorkerProfileDetails from './WorkerProfileDetails';
import AdminSignIn from './AdminSignIn';
import AdminHomePage from './AdminHomePage';
import AdminManageJob from './AdminManageJob';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '@fortawesome/fontawesome-free/css/all.css'; // Import Font Awesome CSS

function App() {
  

  return (
    <div>
      <BrowserRouter>
    {/* Include the Navbar component */}
        <Routes>
          <Route path='/workerSignUp' element={<WorkerSignUp />} />
          <Route path='/workerSignIn' element={<WorkerSignIn />} />
          <Route path='/workerHomePage' element={<WorkerHomePage />} />
          <Route path='/workerPendingJob' element={<WorkerPendingJob />} />
          <Route path='/workerConfirmedJob' element={<WorkerConfirmedJob />} />
          <Route path='/workerOnGoingJob' element={<WorkerOnGoingJob />} />
          <Route path='/workerCompletedJob' element={<WorkerCompletedJob />} />
          <Route path='/workerJobDetails/:jobId' element={<WorkerJobDetails />} />
          <Route path='/workerEditDetails' element={<WorkerEditDetails />} />
          <Route path='/workerUpdatePassword' element={<WorkerUpdatePassword />} />
          <Route path='/workerPastJob' element={<WorkerPastJob />} />
          <Route path='/workerProfileDetails' element={<WorkerProfileDetails />} />
          <Route path='/providerSignIn' element={<ProviderSignIn />} />
          <Route path='/providerSignUp' element={<ProviderSignUp />} />
          <Route path='/providerHomePage' element={<ProviderHomePage />} />
          <Route path='/createJobPost' element={<CreateJobPost />} />
          <Route path='/viewBookedWorker/:jobId' element={<ViewBookedWorker />} />
          <Route path='/viewConfirmedBookedWorker/:jobId' element={<ViewConfirmedBookedWorker />} />
          <Route path='/viewPendingBookedWorker/:jobId' element={<ViewPendingBookedWorker />} />
          <Route path='/viewCompletedBookedWorker/:jobId' element={<ViewCompletedBookedWorker />} />
          <Route path='/viewWorkerHistory/:workerId' element={<ViewWorkerHistory />} />
          <Route path='/viewCompletedJobs' element={<ViewCompletedJobs />} />
          <Route path='/adminSignIn' element={<AdminSignIn />} />
          <Route path='/adminHomePage' element={<AdminHomePage />} />
          <Route path='/adminManageJob' element={<AdminManageJob />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
