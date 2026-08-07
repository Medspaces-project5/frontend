import React, { useEffect, useState } from 'react';
import NavigationShell from '../components/NavigationShell';
import Card from '../components/Card';
import Button from '../components/Button';
import Toast from '../components/Toast';
import Skeleton from '../components/Skeleton';
import useAuthStore from '../store/authStore';
import api from '../services/api';

const DoctorQueue = () => {
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const [loading, setLoading] = useState(true);
  const [nowServing, setNowServing] = useState(null);
  const [upcoming, setUpcoming] = useState([]);
  
  const [toastMessage, setToastMessage] = useState(null);
  const [toastType, setToastType] = useState('info');
  const [actionLoading, setActionLoading] = useState(false);

  const triggerToast = (msg, type = 'info') => {
    setToastType(type);
    setToastMessage(msg);
  };

  const fetchQueue = async () => {
    try {
      const res = await api.get(`/doctor/queue/active?doctorId=${user?.id}&facilityId=${user?.facilityId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.success) {
        setNowServing(res.data.nowServing);
        setUpcoming(res.data.upcoming || []);
      }
    } catch (err) {
      triggerToast(err.error || 'Failed to fetch queue data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
    // Poll queue status every 10 seconds for live updates
    const interval = setInterval(fetchQueue, 10000);
    return () => clearInterval(interval);
  }, [token]);

  const handleCallNext = async () => {
    setActionLoading(true);
    try {
      const res = await api.post('/doctor/queue/call-next', {
        doctorId: user.id,
        facilityId: user.facilityId
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.success) {
        triggerToast(res.data.message || 'Advanced queue successfully', 'success');
        fetchQueue();
      }
    } catch (err) {
      triggerToast(err.error || 'Call Next command failed', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <NavigationShell role="doctor" userName={user?.name} onLogout={logout}>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 text-left">
          <div>
            <h1 className="text-3xl font-bold font-heading text-secondary">Today's Live Queue</h1>
            <p className="font-sans text-sm text-text-secondary">Real-time patient check-in token tracker and queue dashboard.</p>
          </div>
          <div>
            <Button 
              variant="primary" 
              onClick={handleCallNext} 
              disabled={actionLoading}
              className="px-8"
            >
              {actionLoading ? 'Loading...' : 'Call Next Patient'}
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="space-y-4">
            <Skeleton variant="rect" height="150px" />
            <Skeleton variant="rect" height="200px" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Now Serving Big Badge */}
            <div className="md:col-span-1">
              <Card title="Now Serving" className="text-center h-full flex flex-col justify-between">
                <div className="py-8 flex flex-col items-center justify-center flex-1">
                  {nowServing ? (
                    <>
                      {/* Pulse scale animation for serve status changelog updates */}
                      <div className="h-28 w-28 bg-[#F0FDFA] rounded-full border border-primary/20 flex items-center justify-center animate-pulse shadow-sm mb-4">
                        <span className="font-heading font-bold text-3xl text-primary">
                          #{nowServing.token_number}
                        </span>
                      </div>
                      <h4 className="font-heading font-semibold text-lg text-text-primary">
                        {nowServing.patient?.name}
                      </h4>
                      <p className="font-sans text-xs text-text-secondary mt-1">
                        Start Time: {nowServing.start_time.slice(0, 5)}
                      </p>
                    </>
                  ) : (
                    <div className="text-center py-6">
                      <p className="text-2xl font-bold text-slate-300 font-heading"># --</p>
                      <p className="font-sans text-xs text-text-secondary mt-2">No active consultation currently serving.</p>
                    </div>
                  )}
                </div>
              </Card>
            </div>

            {/* Upcoming Queue */}
            <div className="md:col-span-2">
              <Card title="Next Patients in Line" subtitle="Showing the next 5 tokens checked in" className="h-full">
                {upcoming.length > 0 ? (
                  <div className="divide-y divide-border-custom mt-4 text-left">
                    {upcoming.map((pat, idx) => (
                      <div key={pat.id} className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <span className="h-8 w-8 bg-slate-100 rounded-full flex items-center justify-center text-xs font-bold text-text-primary">
                            {idx + 1}
                          </span>
                          <div>
                            <h4 className="font-heading font-semibold text-sm text-text-primary">
                              Token #{pat.token_number}
                            </h4>
                            <p className="font-sans text-xs text-text-secondary mt-0.5">
                              {pat.patient?.name} - Schedule: {pat.start_time.slice(0, 5)}
                            </p>
                          </div>
                        </div>
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#FFFBEB] text-warning">
                          {pat.status === 'in_queue' ? 'In Queue' : 'Checked In'}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="font-sans text-sm text-text-secondary py-12 text-center">No patients checked-in or waiting in the active queue.</p>
                )}
              </Card>
            </div>

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

export default DoctorQueue;
