import React, { useEffect, useState } from 'react';
import NavigationShell from '../components/NavigationShell';
import Card from '../components/Card';
import Toast from '../components/Toast';
import Skeleton from '../components/Skeleton';
import useAuthStore from '../store/authStore';
import api from '../services/api';
import { 
  Calendar, 
  CreditCard, 
  Clock, 
  ChevronRight,
  ShieldAlert,
  Activity,
  FileText
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PatientHome = () => {
  const navigate = useNavigate();
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState([]);
  const [bills, setBills] = useState([]);
  const [profile, setProfile] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);
  const [toastType, setToastType] = useState('info');

  const triggerToast = (msg, type = 'info') => {
    setToastType(type);
    setToastMessage(msg);
  };

  useEffect(() => {
    const fetchPortalData = async () => {
      try {
        const apptsRes = await api.get('/patient/appointments', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const billsRes = await api.get('/patient/bills', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const profileRes = await api.patch('/patient/profile', {}, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (apptsRes.success) setAppointments(apptsRes.data || []);
        if (billsRes.success) setBills(billsRes.data || []);
        if (profileRes.success) setProfile(profileRes.data || null);

      } catch (err) {
        triggerToast(err.error || 'Failed to retrieve portal data', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchPortalData();
  }, [token]);

  const todayStr = new Date().toISOString().split('T')[0];
  
  // 1. Upcoming Appointment
  const upcomingAppt = appointments
    .filter(appt => appt.appointment_date >= todayStr && appt.status !== 'cancelled')
    .sort((a, b) => a.appointment_date.localeCompare(b.appointment_date))[0];

  // 2. Today's Appointment / Token
  const todayAppt = appointments.find(appt => appt.appointment_date === todayStr && appt.status !== 'cancelled');
  const showToken = todayAppt && todayAppt.token_number;

  // 3. Outstanding Bills
  const pendingBills = bills.filter(b => b.collected_flag !== 'Yes');
  const outstandingAmount = pendingBills.reduce((acc, curr) => acc + parseFloat(curr.amount), 0);
  const lastPendingBill = pendingBills[0];

  const getInitials = (name) => {
    if (!name) return 'PT';
    return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  };

  return (
    <NavigationShell role="patient" userName={user?.name} onLogout={logout}>
      <div className="max-w-7xl mx-auto space-y-6 select-none">
        
        {/* Header (No bells, no right chip) */}
        <header className="flex items-center gap-4 text-left pb-6 border-b border-[#D8E7E5]">
          <div className="w-14 h-14 rounded-full bg-[#E6F4F1] border-2 border-primary/20 text-primary font-bold text-lg flex items-center justify-center shadow-inner">
            {getInitials(user?.name)}
          </div>
          <div>
            <h1 className="text-3xl font-bold font-heading text-secondary mb-1">
              Welcome back, {user?.name || 'User'}
            </h1>
            <p className="font-sans text-sm text-text-secondary">Here's an overview of your healthcare activities.</p>
          </div>
        </header>

        {loading ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Skeleton variant="rect" height="200px" />
              <Skeleton variant="rect" height="200px" />
              <Skeleton variant="rect" height="200px" />
            </div>
            <Skeleton variant="rect" height="120px" />
          </div>
        ) : (
          <>
            {/* Primary Dashboard Cards: span appropriately depending on whether token is visible */}
            <div className={`grid grid-cols-1 ${showToken ? 'lg:grid-cols-3' : 'lg:grid-cols-2'} gap-6`}>
              
              {/* Upcoming Appointment */}
              <div className="bg-white rounded-3xl border border-[#D8E7E5] shadow-[0_4px_24px_rgba(13,72,70,0.05)] p-6 flex flex-col justify-between hover:shadow-[0_12px_36px_rgba(13,72,70,0.08)] transition-all duration-300">
                <div className="flex items-center justify-between pb-4 border-b border-[#D8E7E5]/50">
                  <span className="text-[#0d4846] font-bold text-sm flex items-center gap-1.5 font-heading">
                    <Calendar size={16} /> Upcoming Appointment
                  </span>
                  <button 
                    onClick={() => navigate('/patient/appointments')}
                    className="text-xs font-semibold text-primary hover:underline"
                  >
                    View All
                  </button>
                </div>

                {upcomingAppt ? (
                  <div className="my-5 text-left space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 bg-[#F4F8F7] text-primary rounded-xl flex items-center justify-center font-bold font-heading shadow-sm">
                        {upcomingAppt.doctor?.name ? getInitials(upcomingAppt.doctor.name) : 'DR'}
                      </div>
                      <div>
                        <h4 className="font-heading font-bold text-base text-text-primary">
                          {upcomingAppt.doctor?.name || 'Medical Officer'}
                        </h4>
                        <p className="font-sans text-xs text-text-secondary font-medium">
                          {upcomingAppt.doctor?.role ? upcomingAppt.doctor.role.charAt(0).toUpperCase() + upcomingAppt.doctor.role.slice(1) : 'General Practitioner'}
                        </p>
                      </div>
                    </div>

                    <div className="bg-slate-50/80 rounded-2xl p-3 border border-[#D8E7E5]/30">
                      <p className="text-xs text-text-primary font-semibold">MedSpaces Multi Speciality Hospital</p>
                      <p className="text-[11px] text-text-secondary mt-0.5">Banjara Hills, Hyderabad</p>
                    </div>

                    <div className="grid grid-cols-4 gap-2 pt-1 text-xs font-sans">
                      <div className="bg-slate-50/50 p-2.5 rounded-xl border border-[#D8E7E5]/20 text-center">
                        <p className="text-[10px] font-bold text-[#6E8785] uppercase">Date</p>
                        <p className="font-semibold text-text-primary mt-0.5 whitespace-nowrap">{upcomingAppt.appointment_date}</p>
                      </div>
                      <div className="bg-slate-50/50 p-2.5 rounded-xl border border-[#D8E7E5]/20 text-center">
                        <p className="text-[10px] font-bold text-[#6E8785] uppercase">Time</p>
                        <p className="font-semibold text-text-primary mt-0.5">{upcomingAppt.start_time.slice(0, 5)}</p>
                      </div>
                      <div className="bg-slate-50/50 p-2.5 rounded-xl border border-[#D8E7E5]/20 text-center">
                        <p className="text-[10px] font-bold text-[#6E8785] uppercase">Type</p>
                        <p className="font-semibold text-text-primary mt-0.5">In-Person</p>
                      </div>
                      <div className="bg-slate-50/50 p-2.5 rounded-xl border border-[#D8E7E5]/20 text-center">
                        <p className="text-[10px] font-bold text-[#6E8785] uppercase">Status</p>
                        <span className="inline-block px-1.5 py-0.5 bg-emerald-50 text-emerald-700 text-[9px] font-bold rounded uppercase mt-0.5">
                          {upcomingAppt.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="py-12 text-center max-w-[240px] mx-auto space-y-3 flex flex-col items-center justify-center">
                    <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center text-text-secondary">
                      <Calendar size={24} />
                    </div>
                    <div>
                      <p className="font-heading font-bold text-sm text-text-primary">No Scheduled Visits</p>
                      <p className="font-sans text-[11px] text-text-secondary mt-1">Book an appointment at the front desk to see scheduled slots here.</p>
                    </div>
                  </div>
                )}

                <button 
                  onClick={() => navigate('/patient/appointments')}
                  className="w-full text-white font-sans font-semibold text-xs py-3.5 rounded-2xl shadow-sm hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-1.5 mt-auto"
                  style={{ background: 'linear-gradient(135deg, #0D4846, #11615D)' }}
                >
                  View Appointment Details
                </button>
              </div>

              {/* Today's Token (ONLY if appointment is today) */}
              {showToken && (
                <div className="bg-white rounded-3xl border border-[#D8E7E5] shadow-[0_4px_24px_rgba(13,72,70,0.05)] p-6 flex flex-col justify-between hover:shadow-[0_12px_36px_rgba(13,72,70,0.08)] transition-all duration-300">
                  <div className="flex items-center pb-4 border-b border-[#D8E7E5]/50">
                    <span className="text-[#0d4846] font-bold text-sm flex items-center gap-1.5 font-heading">
                      <ShieldAlert size={16} /> Today's Token
                    </span>
                  </div>

                  <div className="my-5 flex flex-col items-center justify-center text-center space-y-4">
                    <p className="font-sans text-xs font-semibold text-text-secondary tracking-wide uppercase">Your Queue Token</p>
                    <h2 className="text-6xl font-bold font-heading text-primary tracking-tight">
                      A-{todayAppt.token_number}
                    </h2>
                    <div className="flex items-center gap-1.5 font-sans text-xs text-text-secondary bg-[#F0FDFA] border border-primary/10 px-3 py-1.5 rounded-full">
                      <Clock size={14} className="text-[#2F8F89]" /> Estimated Wait Time: <span className="font-bold text-[#0D4846]">15 mins</span>
                    </div>
                    <p className="text-[11px] text-text-secondary font-medium italic">Please be available in the waiting area</p>
                  </div>

                  <div className="pt-2">
                    <span className="block text-center text-[11px] text-[#6E8785] font-semibold bg-[#F4F8F7] py-2.5 rounded-xl border border-[#D8E7E5]/30">
                      Live Queue Tracking Secured
                    </span>
                  </div>
                </div>
              )}

              {/* Outstanding Bills */}
              <div className="bg-white rounded-3xl border border-[#D8E7E5] shadow-[0_4px_24px_rgba(13,72,70,0.05)] p-6 flex flex-col justify-between hover:shadow-[0_12px_36px_rgba(13,72,70,0.08)] transition-all duration-300">
                <div className="flex items-center justify-between pb-4 border-b border-[#D8E7E5]/50">
                  <span className="text-[#0d4846] font-bold text-sm flex items-center gap-1.5 font-heading">
                    <CreditCard size={16} /> Outstanding Bills
                  </span>
                  <button 
                    onClick={() => navigate('/patient/bills')}
                    className="text-xs font-semibold text-primary hover:underline"
                  >
                    View All
                  </button>
                </div>

                {outstandingAmount > 0 ? (
                  <div className="my-4 text-left font-sans">
                    <p className="text-xs text-text-secondary font-medium">Your Outstanding</p>
                    <p className="text-3xl font-bold font-heading text-danger mt-0.5">
                      ₹{outstandingAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </p>

                    <div className="mt-4 pt-3 border-t border-slate-50 flex items-center justify-between text-xs font-medium text-text-secondary">
                      <span>Pending Bills</span>
                      <span className="font-semibold text-text-primary">{pendingBills.length}</span>
                    </div>
                    <div className="mt-2 flex items-center justify-between text-xs font-medium text-text-secondary">
                      <span>Last Invoice</span>
                      <span className="font-semibold text-text-primary">
                        {lastPendingBill ? lastPendingBill.razorpay_order_id || 'INV-2025-0043' : 'N/A'}
                      </span>
                    </div>
                    <div className="mt-2 flex items-center justify-between text-xs font-medium text-text-secondary">
                      <span>Due Date</span>
                      <span className="font-semibold text-danger">
                        {lastPendingBill ? lastPendingBill.created_at.slice(0, 10) : 'N/A'}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="py-12 text-center max-w-[240px] mx-auto space-y-3 flex flex-col items-center justify-center">
                    <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                      <CreditCard size={24} />
                    </div>
                    <div>
                      <p className="font-heading font-bold text-sm text-text-primary">No outstanding bills</p>
                      <p className="font-sans text-[11px] text-text-secondary mt-1">All invoices are settled. Thank you!</p>
                    </div>
                  </div>
                )}

                <button 
                  onClick={() => navigate('/patient/bills')}
                  className="w-full text-white font-sans font-semibold text-xs py-3.5 rounded-2xl shadow-sm hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-1.5 mt-auto"
                  style={{ background: 'linear-gradient(135deg, #0D4846, #11615D)' }}
                >
                  Pay Now
                </button>
              </div>

            </div>

            {/* Quick Actions (Large horizontal card containing exactly two actions) */}
            <div className="bg-white rounded-3xl border border-[#D8E7E5] shadow-[0_4px_24px_rgba(13,72,70,0.05)] p-6 text-left">
              <h3 className="font-heading font-bold text-sm text-[#0D4846] mb-5 pb-3 border-b border-[#D8E7E5]/50 flex items-center gap-1.5">
                <ShieldAlert size={16} className="text-[#2F8F89]" /> Quick Actions
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Action 1: View My Appointments */}
                <div 
                  onClick={() => navigate('/patient/appointments')}
                  className="flex items-center justify-between p-6 bg-slate-50/50 border border-[#D8E7E5]/40 rounded-2xl hover:bg-[#F0FDFA] hover:border-primary/20 hover:-translate-y-0.5 transition-all duration-300 cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-white rounded-xl text-primary shadow-sm">
                      <Calendar size={24} />
                    </div>
                    <div>
                      <h4 className="font-heading font-bold text-base text-text-primary">View My Appointments</h4>
                      <p className="font-sans text-xs text-text-secondary mt-0.5">Check your upcoming and past appointments</p>
                    </div>
                  </div>
                  <ChevronRight size={20} className="text-text-secondary" />
                </div>

                {/* Action 2: View My Bills */}
                <div 
                  onClick={() => navigate('/patient/bills')}
                  className="flex items-center justify-between p-6 bg-slate-50/50 border border-[#D8E7E5]/40 rounded-2xl hover:bg-[#F0FDFA] hover:border-primary/20 hover:-translate-y-0.5 transition-all duration-300 cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-white rounded-xl text-primary shadow-sm">
                      <CreditCard size={24} />
                    </div>
                    <div>
                      <h4 className="font-heading font-bold text-base text-text-primary">View My Bills</h4>
                      <p className="font-sans text-xs text-text-secondary mt-0.5">View charges, make payments and download receipts</p>
                    </div>
                  </div>
                  <ChevronRight size={20} className="text-text-secondary" />
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {toastMessage && (
        <Toast 
          message={toastMessage} 
          type={toastType} 
          onClose={() => setToastMessage(null)} 
        />
      )}
    </NavigationShell>
  );
};

export default PatientHome;
