import React, { useEffect, useState } from 'react';
import NavigationShell from '../components/NavigationShell';
import Card from '../components/Card';
import Button from '../components/Button';
import Toast from '../components/Toast';
import Skeleton from '../components/Skeleton';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import Input from '../components/Input';
import useAuthStore from '../store/authStore';
import api from '../services/api';

const CalendarView = () => {
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date().toISOString().split('T')[0]);
  const [viewMode, setViewMode] = useState('daily'); // daily/weekly view toggle

  // New Appointment Form State
  const [bookModalOpen, setBookModalOpen] = useState(false);
  const [patients, setPatients] = useState([]);
  const [patientSearchQuery, setPatientSearchQuery] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);
  
  const [bookingTime, setBookingTime] = useState('10:00:00');
  const [isWalkIn, setIsWalkIn] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [toastMessage, setToastMessage] = useState(null);
  const [toastType, setToastType] = useState('info');

  const triggerToast = (msg, type = 'info') => {
    setToastType(type);
    setToastMessage(msg);
  };

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/frontdesk/appointments?date=${currentDate}&facilityId=${user?.facilityId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.success) {
        setAppointments(res.data || []);
      }
    } catch (err) {
      triggerToast(err.error || 'Failed to fetch appointments list', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [currentDate, token]);

  const searchPatients = async () => {
    if (!patientSearchQuery) return;
    try {
      const res = await api.get(`/frontdesk/patients?phone=${patientSearchQuery}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.success) {
        setPatients(res.data || []);
      }
    } catch (err) {
      triggerToast(err.error || 'Patient lookup failed', 'error');
    }
  };

  const handleBooking = async (e) => {
    e.preventDefault();
    if (!selectedPatient) {
      triggerToast('Please select a patient to continue', 'error');
      return;
    }
    
    setIsSubmitting(true);
    try {
      const payload = {
        patientId: selectedPatient.id,
        doctorId: user.role === 'doctor' ? user.id : '00000000-0000-0000-0000-000000000000', // Assign default or current doctor context
        facilityId: user.facilityId,
        appointmentDate: currentDate,
        startTime: bookingTime,
        endTime: bookingTime.split(':').map((val, idx) => idx === 1 ? String(Number(val) + 15).padStart(2, '0') : val).join(':'), // Add 15 mins block
        isWalkIn
      };

      const res = await api.post('/frontdesk/appointments', payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.success) {
        triggerToast('Appointment booked successfully!', 'success');
        setBookModalOpen(false);
        setSelectedPatient(null);
        setPatients([]);
        setPatientSearchQuery('');
        fetchAppointments();
      }
    } catch (err) {
      triggerToast(err.error || 'Scheduling conflict or error booking appointment', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateStatus = async (appointmentId, nextStatus) => {
    try {
      const res = await api.patch(`/frontdesk/appointments/${appointmentId}/status`, { status: nextStatus }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.success) {
        triggerToast(`Status updated to ${nextStatus}`, 'success');
        fetchAppointments();
      }
    } catch (err) {
      triggerToast(err.error || 'Failed to update status', 'error');
    }
  };

  return (
    <NavigationShell role={user?.role} userName={user?.name} onLogout={logout}>
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold font-heading text-secondary mb-2">Calendar & Scheduling</h1>
            <p className="font-sans text-text-secondary">View scheduled slot layouts, manage conflict blocks, and register walk-ins inline.</p>
          </div>
          <div>
            <Button variant="primary" onClick={() => setBookModalOpen(true)}>
              + New Appointment
            </Button>
          </div>
        </div>

        {/* Calendar Nav bar Controls */}
        <Card>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 text-left">
            <div className="flex items-center space-x-3">
              <input 
                type="date" 
                value={currentDate} 
                onChange={(e) => setCurrentDate(e.target.value)}
                className="px-3 py-2 border border-border-custom rounded-lg text-sm text-text-primary focus:outline-none focus:border-primary"
              />
              <div className="flex bg-slate-100 rounded-lg p-0.5 border border-border-custom">
                <button 
                  onClick={() => setViewMode('daily')}
                  className={`px-4 py-1.5 rounded-md text-xs font-semibold uppercase transition-colors ${
                    viewMode === 'daily' ? 'bg-white text-primary shadow-sm' : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  Daily
                </button>
                <button 
                  onClick={() => setViewMode('weekly')}
                  className={`px-4 py-1.5 rounded-md text-xs font-semibold uppercase transition-colors ${
                    viewMode === 'weekly' ? 'bg-white text-primary shadow-sm' : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  Weekly
                </button>
              </div>
            </div>
            
            <div className="text-sm font-semibold text-text-secondary">
              Selected Clinic ID: <span className="text-secondary font-mono">{user?.facilityId}</span>
            </div>
          </div>
        </Card>

        {/* Time Slots Layout Grid */}
        <Card title={`${viewMode === 'daily' ? 'Daily Time Grid' : 'Weekly Time Grid'} - ${currentDate}`}>
          {loading ? (
            <div className="space-y-4">
              <Skeleton variant="rect" height="60px" />
              <Skeleton variant="rect" height="60px" />
              <Skeleton variant="rect" height="60px" />
            </div>
          ) : appointments.length > 0 ? (
            <div className="border border-border-custom rounded-lg divide-y divide-border-custom overflow-hidden text-left bg-slate-50/20">
              {appointments.map((appt) => (
                <div key={appt.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white hover:bg-slate-50/50 transition-colors">
                  <div className="flex items-start gap-4">
                    {/* Time slot badge */}
                    <div className="bg-slate-100 px-3 py-1 rounded text-xs font-semibold font-mono text-text-primary">
                      {appt.start_time.slice(0, 5)} - {appt.end_time.slice(0, 5)}
                    </div>
                    <div>
                      <h4 className="font-heading font-semibold text-base text-text-primary">{appt.patient?.name}</h4>
                      <p className="font-sans text-xs text-text-secondary">
                        Phone: {appt.patient?.phone} | Token Assigned: {appt.token_number || 'N/A'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <StatusBadge status={appt.status} />
                    
                    {/* Status lifecycle actions triggers */}
                    {appt.status === 'booked' && (
                      <Button variant="secondary" className="py-1 px-3 text-xs" onClick={() => updateStatus(appt.id, 'checked_in')}>
                        Check In
                      </Button>
                    )}
                    {appt.status === 'checked_in' && (
                      <Button variant="primary" className="py-1 px-3 text-xs" onClick={() => updateStatus(appt.id, 'in_queue')}>
                        Send to Queue
                      </Button>
                    )}
                    {appt.status === 'in_queue' && (
                      <Button variant="primary" className="py-1 px-3 text-xs" onClick={() => updateStatus(appt.id, 'in_consultation')}>
                        Start Consultation
                      </Button>
                    )}
                    {appt.status === 'in_consultation' && (
                      <div className="flex gap-2">
                        <Button variant="primary" className="py-1 px-3 text-xs" onClick={() => updateStatus(appt.id, 'completed')}>
                          Complete
                        </Button>
                        <Button variant="danger" className="py-1 px-3 text-xs" onClick={() => updateStatus(appt.id, 'no_show')}>
                          No Show
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="font-sans text-sm text-text-secondary py-12 text-center">No appointments booked for this day. Click "+ New Appointment" to schedule one.</p>
          )}
        </Card>
      </div>

      {/* Book Appointment Modal */}
      <Modal
        isOpen={bookModalOpen}
        onClose={() => setBookModalOpen(false)}
        title="Schedule New Appointment"
        footerActions={
          <Button variant="secondary" onClick={() => setBookModalOpen(false)}>
            Cancel
          </Button>
        }
      >
        <form onSubmit={handleBooking} className="space-y-4 text-left">
          {/* Patient Lookup Search */}
          <div className="space-y-1">
            <label className="font-sans text-sm font-medium text-text-primary">Search Patient Profile (By Phone)</label>
            <div className="flex gap-2">
              <input 
                type="text" 
                placeholder="Search phone number..." 
                value={patientSearchQuery}
                onChange={(e) => setPatientSearchQuery(e.target.value)}
                className="flex-1 px-3 py-2 border border-border-custom rounded-md text-sm text-text-primary focus:outline-none focus:border-primary"
              />
              <Button type="button" variant="secondary" className="py-2 px-4 text-xs" onClick={searchPatients}>
                Lookup
              </Button>
            </div>
            
            {/* Search results select */}
            {patients.length > 0 && (
              <div className="mt-2 border border-border-custom rounded-lg max-h-32 overflow-y-auto divide-y divide-border-custom bg-white">
                {patients.map((pat) => (
                  <button
                    key={pat.id}
                    type="button"
                    onClick={() => {
                      setSelectedPatient(pat);
                      setPatients([]);
                    }}
                    className="w-full text-left px-3 py-2 text-xs hover:bg-[#F0FDFA] font-sans"
                  >
                    {pat.name} ({pat.phone}) - DOB: {pat.dob}
                  </button>
                ))}
              </div>
            )}
          </div>

          {selectedPatient && (
            <div className="bg-[#F0FDFA] border border-primary/20 p-3 rounded-lg text-xs text-primary">
              Selected Patient: <span className="font-bold">{selectedPatient.name}</span> ({selectedPatient.phone})
            </div>
          )}

          <div className="flex items-center space-x-2 py-2">
            <input 
              type="checkbox" 
              id="is_walkin" 
              checked={isWalkIn} 
              onChange={() => setIsWalkIn(!isWalkIn)} 
              className="rounded border-border-custom text-primary focus:ring-primary" 
            />
            <label htmlFor="is_walkin" className="text-xs text-text-primary font-medium">Walk-in Booking (Bypass Time Slot selection)</label>
          </div>

          {!isWalkIn && (
            <Input 
              label="Select Appointment Time" 
              type="time" 
              value={bookingTime}
              onChange={(e) => setBookingTime(`${e.target.value}:00`)}
            />
          )}

          <Button type="submit" variant="primary" className="w-full mt-4" disabled={isSubmitting}>
            {isSubmitting ? 'Processing Booking...' : 'Confirm Appointment Slot'}
          </Button>
        </form>
      </Modal>

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

export default CalendarView;
