import React, { useEffect, useState } from 'react';
import NavigationShell from '../components/NavigationShell';
import Card from '../components/Card';
import Toast from '../components/Toast';
import Skeleton from '../components/Skeleton';
import useAuthStore from '../store/authStore';
import api from '../services/api';
import { Calendar, ShieldAlert, Clock, Info } from 'lucide-react';

const MyAppointments = () => {
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState([]);
  const [activeTab, setActiveTab] = useState('upcoming'); // 'upcoming' or 'past'
  const [toastMessage, setToastMessage] = useState(null);
  const [toastType, setToastType] = useState('info');

  const triggerToast = (msg, type = 'info') => {
    setToastType(type);
    setToastMessage(msg);
  };

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const res = await api.get('/patient/appointments', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.success) {
          setAppointments(res.data || []);
        }
      } catch (err) {
        triggerToast(err.error || 'Failed to retrieve appointments', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [token]);

  const todayStr = new Date().toISOString().split('T')[0];

  // Classify appointments
  const upcomingAppts = appointments.filter(appt => {
    const isTodayOrFuture = appt.appointment_date >= todayStr;
    const isCompletedOrCancelled = ['completed', 'cancelled', 'no_show'].includes(appt.status);
    return isTodayOrFuture && !isCompletedOrCancelled;
  }).sort((a, b) => a.appointment_date.localeCompare(b.appointment_date));

  const pastAppts = appointments.filter(appt => {
    const isPast = appt.appointment_date < todayStr;
    const isCompletedOrCancelled = ['completed', 'cancelled', 'no_show'].includes(appt.status);
    return isPast || isCompletedOrCancelled;
  }).sort((a, b) => b.appointment_date.localeCompare(a.appointment_date));

  const displayedAppts = activeTab === 'upcoming' ? upcomingAppts : pastAppts;

  const getStatusBadge = (status) => {
    const styles = {
      booked: 'bg-blue-50 text-blue-700 border-blue-200',
      checked_in: 'bg-[#EFF6FF] text-[#0D4846] border-[#D8E7E5]',
      in_queue: 'bg-[#F0FDFA] text-primary border-primary/20',
      in_consultation: 'bg-amber-50 text-amber-700 border-amber-200',
      completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      no_show: 'bg-slate-50 text-slate-600 border-slate-200',
      cancelled: 'bg-rose-50 text-rose-700 border-rose-200',
    };
    const styleClass = styles[status] || 'bg-slate-50 text-slate-600 border-slate-200';
    return (
      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${styleClass} uppercase tracking-wider`}>
        {status.replace('_', ' ')}
      </span>
    );
  };

  const getInitials = (name) => {
    if (!name) return 'DR';
    return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  };

  return (
    <NavigationShell role="patient" userName={user?.name} onLogout={logout}>
      <div className="max-w-4xl mx-auto space-y-6 select-none">
        <div className="text-left">
          <h1 className="text-3xl font-bold font-heading text-secondary mb-2">My Appointments</h1>
          <p className="font-sans text-sm text-text-secondary">View your scheduled visits and consultation history.</p>
        </div>

        {/* Tab Headers */}
        <div className="flex border-b border-[#D8E7E5] font-sans">
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`py-3 px-6 font-bold text-sm border-b-2 transition-all cursor-pointer ${
              activeTab === 'upcoming'
                ? 'border-primary text-primary'
                : 'border-transparent text-text-secondary hover:text-text-primary'
            }`}
          >
            Upcoming
          </button>
          <button
            onClick={() => setActiveTab('past')}
            className={`py-3 px-6 font-bold text-sm border-b-2 transition-all cursor-pointer ${
              activeTab === 'past'
                ? 'border-primary text-primary'
                : 'border-transparent text-text-secondary hover:text-text-primary'
            }`}
          >
            Past
          </button>
        </div>

        {loading ? (
          <div className="space-y-4">
            <Skeleton variant="rect" height="150px" />
            <Skeleton variant="rect" height="150px" />
          </div>
        ) : displayedAppts.length > 0 ? (
          <div className="space-y-4">
            {displayedAppts.map((appt) => {
              const isToday = appt.appointment_date === todayStr;
              return (
                <div 
                  key={appt.id}
                  className="bg-white rounded-3xl border border-[#D8E7E5] shadow-[0_4px_24px_rgba(13,72,70,0.04)] p-6 hover:shadow-[0_12px_36px_rgba(13,72,70,0.08)] hover:-translate-y-0.5 transition-all duration-300 flex flex-col md:flex-row md:items-center justify-between gap-6"
                >
                  <div className="flex items-start gap-4 text-left">
                    <div className="w-12 h-12 rounded-2xl bg-[#F4F8F7] flex items-center justify-center text-primary font-bold font-heading shadow-sm">
                      {getInitials(appt.doctor?.name)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-heading font-bold text-base text-text-primary">
                          {appt.doctor?.name || 'Dr. Ramesh Babu'}
                        </h3>
                        {isToday && (
                          <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded uppercase border border-emerald-100">
                            Today
                          </span>
                        )}
                      </div>
                      <p className="font-sans text-xs text-text-secondary font-medium">
                        {appt.doctor?.role ? appt.doctor.role.charAt(0).toUpperCase() + appt.doctor.role.slice(1) : 'Cardiologist'}
                      </p>
                      
                      <div className="mt-2 text-xs font-sans text-text-secondary">
                        <p className="font-semibold text-text-primary">MedSpaces Multi Speciality Hospital</p>
                        <p className="text-[11px] mt-0.5">Banjara Hills, Hyderabad</p>
                      </div>

                      <div className="flex flex-wrap gap-x-6 gap-y-2 mt-4 font-sans text-xs text-text-secondary">
                        <span className="flex items-center gap-1.5"><Clock size={14} className="text-[#2F8F89]" /> {appt.appointment_date} at {appt.start_time.slice(0, 5)}</span>
                        <span>Type: <span className="font-semibold text-text-primary">In-Person</span></span>
                        <span>Room No: <span className="font-semibold text-text-primary">102</span></span>
                        {isToday && appt.token_number && (
                          <span className="font-bold text-[#0D4846]">Token No: A-{appt.token_number}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between md:justify-end gap-3 font-sans shrink-0">
                    {getStatusBadge(appt.status)}
                  </div>
                </div>
              );
            })}

            {/* Note info */}
            <div className="bg-[#EFF6FF] border border-[#D8E7E5] rounded-2xl p-4 flex items-start gap-3 text-left">
              <Info size={18} className="text-secondary shrink-0 mt-0.5" />
              <p className="font-sans text-xs text-text-secondary leading-relaxed">
                Booking, rescheduling or cancellation of appointments is not available. Please contact the clinic for any changes.
              </p>
            </div>
          </div>
        ) : (
          <Card>
            <div className="py-16 text-center max-w-sm mx-auto space-y-4">
              <div className="w-16 h-16 bg-[#F4F8F7] text-primary rounded-full flex items-center justify-center mx-auto shadow-sm">
                <Calendar size={32} />
              </div>
              <div>
                <h3 className="font-heading font-bold text-lg text-text-primary">No appointments scheduled</h3>
                <p className="font-sans text-xs text-text-secondary mt-1">
                  You do not have any {activeTab} medical appointments registered.
                </p>
              </div>
            </div>
          </Card>
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

export default MyAppointments;
