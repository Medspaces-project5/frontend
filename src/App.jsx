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
import AddStaffMember from './pages/AddStaffMember';
import DoctorQueue from './pages/DoctorQueue';
import FrontDeskQueue from './pages/FrontDeskQueue';
import PatientHome from './pages/PatientHome';
import MyBills from './pages/MyBills';
import PatientSearch from './pages/PatientSearch';
import PatientProfile from './pages/PatientProfile';
import PatientProfilePatient from './pages/PatientProfilePatient';
import CalendarView from './pages/CalendarView';
import DoctorAvailabilitySetup from './pages/DoctorAvailabilitySetup';
import AnalyticsDashboard from './pages/AnalyticsDashboard';
import ComponentShowcase from './pages/ComponentShowcase';
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

        {/* Guarded Role Route Trees */}
        <Route 
          path="/admin/staff" 
          element={
            <RouteGuard allowedRoles={['admin']}>
              <AddStaffMember />
            </RouteGuard>
          } 
        />
        <Route 
          path="/doctor/queue" 
          element={
            <RouteGuard allowedRoles={['doctor']}>
              <DoctorQueue />
            </RouteGuard>
          } 
        />
        <Route 
          path="/frontdesk/queue" 
          element={
            <RouteGuard allowedRoles={['frontdesk']}>
              <FrontDeskQueue />
            </RouteGuard>
          } 
        />
        <Route 
          path="/frontdesk/patients" 
          element={
            <RouteGuard allowedRoles={['frontdesk', 'admin']}>
              <PatientSearch />
            </RouteGuard>
          } 
        />
        <Route 
          path="/frontdesk/patients/:id" 
          element={
            <RouteGuard allowedRoles={['frontdesk', 'admin']}>
              <PatientProfile />
            </RouteGuard>
          } 
        />
        <Route 
          path="/doctor/patients/:id" 
          element={
            <RouteGuard allowedRoles={['doctor']}>
              <PatientProfile />
            </RouteGuard>
          } 
        />
        <Route 
          path="/frontdesk/calendar" 
          element={
            <RouteGuard allowedRoles={['frontdesk', 'admin']}>
              <CalendarView />
            </RouteGuard>
          } 
        />
        <Route 
          path="/doctor/calendar" 
          element={
            <RouteGuard allowedRoles={['doctor']}>
              <CalendarView />
            </RouteGuard>
          } 
        />
        <Route 
          path="/doctor/availability" 
          element={
            <RouteGuard allowedRoles={['doctor', 'admin']}>
              <DoctorAvailabilitySetup />
            </RouteGuard>
          } 
        />
        <Route 
          path="/admin/dashboard" 
          element={
            <RouteGuard allowedRoles={['admin']}>
              <AnalyticsDashboard />
            </RouteGuard>
          } 
        />
        <Route 
          path="/doctor/dashboard" 
          element={
            <RouteGuard allowedRoles={['doctor']}>
              <AnalyticsDashboard />
            </RouteGuard>
          } 
        />
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
