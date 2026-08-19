import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import PatientSignUp from './pages/PatientSignUp';
import VerifyOtp from './pages/VerifyOtp';
import ForgotPassword from './pages/ForgotPassword';
import VerifyResetOtp from './pages/VerifyResetOtp';
import ResetPassword from './pages/ResetPassword';
import PasswordResetSuccess from './pages/PasswordResetSuccess';
import MyAppointments from './pages/MyAppointments';
import PatientHome from './pages/PatientHome';
import MyBills from './pages/MyBills';
import PatientProfilePatient from './pages/PatientProfilePatient';
import ComponentShowcase from './pages/ComponentShowcase';
import RateYourVisit from './pages/RateYourVisit';
import useAuthStore from './store/authStore';
import './index.css';

// Guard component checking JWT and active role
const RouteGuard = ({ children, allowedRoles }) => {
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Screens */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<PatientSignUp />} />
        <Route path="/verify-otp" element={<VerifyOtp />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/verify-reset-otp" element={<VerifyResetOtp />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/password-reset-success" element={<PasswordResetSuccess />} />
        <Route path="/showcase" element={<ComponentShowcase />} />
        <Route path="/feedback/:token" element={<RateYourVisit />} />

        {/* Guarded Patient Routes */}
        <Route 
          path="/patient/home" 
          element={
            <RouteGuard allowedRoles={['patient']}>
              <PatientHome />
            </RouteGuard>
          } 
        />
        <Route 
          path="/patient/appointments" 
          element={
            <RouteGuard allowedRoles={['patient']}>
              <MyAppointments />
            </RouteGuard>
          } 
        />
        <Route 
          path="/patient/bills" 
          element={
            <RouteGuard allowedRoles={['patient']}>
              <MyBills />
            </RouteGuard>
          } 
        />
        <Route 
          path="/patient/profile" 
          element={
            <RouteGuard allowedRoles={['patient']}>
              <PatientProfilePatient />
            </RouteGuard>
          } 
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

