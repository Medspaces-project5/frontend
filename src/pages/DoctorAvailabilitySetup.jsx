import React, { useEffect, useState } from 'react';
import NavigationShell from '../components/NavigationShell';
import Card from '../components/Card';
import Button from '../components/Button';
import Toast from '../components/Toast';
import Skeleton from '../components/Skeleton';
import useAuthStore from '../store/authStore';
import api from '../services/api';

const DoctorAvailabilitySetup = () => {
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const [loading, setLoading] = useState(true);
  const [availability, setAvailability] = useState([]);
  const [toastMessage, setToastMessage] = useState(null);
  const [toastType, setToastType] = useState('info');

  const days = [
    { value: 0, label: 'Sunday' },
    { value: 1, label: 'Monday' },
    { value: 2, label: 'Tuesday' },
    { value: 3, label: 'Wednesday' },
    { value: 4, label: 'Thursday' },
    { value: 5, label: 'Friday' },
    { value: 6, label: 'Saturday' }
  ];

  const triggerToast = (msg, type = 'info') => {
    setToastType(type);
    setToastMessage(msg);
  };

  useEffect(() => {
    const fetchAvailability = async () => {
      try {
        const res = await api.get('/doctor/availability', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.success) {
          setAvailability(res.data || []);
        }
      } catch (err) {
        triggerToast(err.error || 'Failed to fetch availability schedule', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchAvailability();
  }, [token]);

  const handleAddTimeWindow = (dayOfWeek) => {
    setAvailability((prev) => [
      ...prev,
      {
        day_of_week: dayOfWeek,
        start_time: '09:00:00',
        end_time: '17:00:00',
        facility_id: user?.facilityId || '00000000-0000-0000-0000-000000000000'
      }
    ]);
  };

  const handleRemoveWindow = (index) => {
    setAvailability((prev) => prev.filter((_, i) => i !== index));
  };

  const handleTimeChange = (index, field, value) => {
    setAvailability((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleSave = async () => {
    try {
      const payload = {
        availability: availability.map(avail => ({
          dayOfWeek: avail.day_of_week,
          startTime: avail.start_time,
          endTime: avail.end_time,
          facilityId: avail.facility_id
        }))
      };

      const res = await api.post('/doctor/availability', payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.success) {
        triggerToast('Availability schedule saved successfully', 'success');
      }
    } catch (err) {
      triggerToast(err.error || 'Failed to save availability schedule', 'error');
    }
  };

  return (
    <NavigationShell role={user?.role} userName={user?.name} onLogout={logout}>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold font-heading text-secondary mb-2">Doctor Availability Setup</h1>
          <p className="font-sans text-text-secondary">Configure daily operational hours and clinics assignments for appointments bookings.</p>
        </div>

        {loading ? (
          <div className="space-y-4">
            <Skeleton variant="rect" height="150px" />
            <Skeleton variant="rect" height="150px" />
          </div>
        ) : (
          <div className="space-y-6">
            <Card title="Weekly Schedule Configurator">
              <div className="space-y-6 mt-4">
                {days.map((day) => {
                  const dayWindows = availability.filter((item) => item.day_of_week === day.value);
                  return (
                    <div key={day.value} className="pb-4 border-b border-border-custom last:border-0 last:pb-0 flex flex-col md:flex-row md:items-center justify-between gap-4 text-left">
                      <div className="w-32">
                        <span className="font-heading font-semibold text-base text-text-primary">{day.label}</span>
                      </div>
                      
                      <div className="flex-1 space-y-2">
                        {dayWindows.length > 0 ? (
                          dayWindows.map((window, idx) => {
                            const absoluteIdx = availability.findIndex((item) => item === window);
                            return (
                              <div key={idx} className="flex items-center gap-3">
                                <input 
                                  type="time" 
                                  value={window.start_time.slice(0, 5)} 
                                  onChange={(e) => handleTimeChange(absoluteIdx, 'start_time', `${e.target.value}:00`)}
                                  className="px-3 py-1.5 border border-border-custom rounded-md text-sm text-text-primary bg-white focus:outline-none focus:border-primary"
                                />
                                <span className="text-text-secondary text-sm">to</span>
                                <input 
                                  type="time" 
                                  value={window.end_time.slice(0, 5)} 
                                  onChange={(e) => handleTimeChange(absoluteIdx, 'end_time', `${e.target.value}:00`)}
                                  className="px-3 py-1.5 border border-border-custom rounded-md text-sm text-text-primary bg-white focus:outline-none focus:border-primary"
                                />
                                <button 
                                  type="button"
                                  onClick={() => handleRemoveWindow(absoluteIdx)}
                                  className="text-danger hover:text-red-700 text-xs font-semibold"
                                >
                                  Remove
                                </button>
                              </div>
                            );
                          })
                        ) : (
                          <span className="text-sm text-text-secondary italic">Unavailable / Blocked</span>
                        )}
                      </div>

                      <div>
                        <Button variant="secondary" onClick={() => handleAddTimeWindow(day.value)} className="py-1.5 px-4 text-xs">
                          + Add Hours
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-8 pt-4 border-t border-border-custom flex justify-end">
                <Button variant="primary" onClick={handleSave}>
                  Save Schedule Config
                </Button>
              </div>
            </Card>

            <Card title="Block Dates for Holidays/Leave">
              <div className="flex gap-4 mt-2">
                <input 
                  type="date" 
                  className="px-3 py-2 border border-border-custom rounded-md text-sm text-text-primary focus:outline-none focus:border-primary" 
                />
                <input 
                  type="text" 
                  placeholder="Reason for blocking date..." 
                  className="flex-1 px-3 py-2 border border-border-custom rounded-md text-sm text-text-primary focus:outline-none focus:border-primary" 
                />
                <Button variant="danger" className="py-2 px-5 text-sm">Block Date</Button>
              </div>
            </Card>
          </div>
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

export default DoctorAvailabilitySetup;
