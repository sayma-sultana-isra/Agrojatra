import 'bootstrap/dist/css/bootstrap.min.css';
import {useState} from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import GetStarted from './pages/auth/GetStarted';
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import Login from './pages/auth/Login';
import ForgetPassword from './pages/auth/ForgetPassword';
import StudentDashboard from './pages/student/StudentDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import RecruiterDashboard from './pages/recruiter/RecruiterDashboard';
import PrivateRoute from './routes/PrivateRoute';
import PublicRoute from './routes/PublicRoute';


function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route element={<PublicRoute />}>
          <Route path="/getstarted" element={<GetStarted />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
           <Route path="/forgetpassword" element={<ForgetPassword/>} />
          
        </Route>

        {/* Protected Routes */}
        <Route element={<PrivateRoute allowedRoles={['student']} />}>
          <Route path="/student/*" element={<StudentDashboard />} />
        </Route>
        
        <Route element={<PrivateRoute allowedRoles={['admin']} />}>
          <Route path="/admin/*" element={<AdminDashboard />} />
        </Route>
        
        <Route element={<PrivateRoute allowedRoles={['recruiter']} />}>
          <Route path="/recruiter/*" element={<RecruiterDashboard />} />
        </Route>

        {/* Redirect to login by default */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        
        {/* Catch-all route */}
        <Route path="*" element={<div>404 Not Found</div>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;