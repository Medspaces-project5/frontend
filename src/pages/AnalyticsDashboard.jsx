import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import NavigationShell from '../components/NavigationShell';
import Card from '../components/Card';
import Toast from '../components/Toast';
import Skeleton from '../components/Skeleton';
import useAuthStore from '../store/authStore';
import api from '../services/api';

const AnalyticsDashboard = () => {
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);
  const [toastType, setToastType] = useState('info');

  const triggerToast = (msg, type = 'info') => {
    setToastType(type);
    setToastMessage(msg);
  };

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        // Query endpoints: Doctor queries own numbers, Admin queries full clinic aggregates
        const doctorParam = user?.role === 'doctor' ? `?doctorId=${user.id}` : '';
        const res = await api.get(`/admin/dashboard${doctorParam}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.success) {
          setStats(res.data);
        }
      } catch (err) {
        triggerToast(err.error || 'Failed to fetch analytics statistics data', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [token, user]);

  return (
    <NavigationShell role={user?.role} userName={user?.name} onLogout={logout}>
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="text-left">
          <h1 className="text-3xl font-bold font-heading text-secondary mb-2">Clinic Performance Analytics</h1>
          <p className="font-sans text-sm text-text-secondary">Real-time overview of scheduling volumes, doctor slots utilization, collected revenue, and referrals status.</p>
        </div>

        {loading ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {[...Array(5)].map((_, i) => <Skeleton key={i} variant="rect" height="100px" />)}
            </div>
            <Skeleton variant="rect" height="300px" />
          </div>
        ) : stats ? (
          <>
            {/* Stat Cards Grid (5 counters per section A6) */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <Card>
                <div className="text-left">
                  <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Booked This Week</p>
                  <p className="text-3xl font-bold font-heading text-secondary mt-2">{stats.bookedThisWeek}</p>
                </div>
              </Card>

              <Card>
                <div className="text-left">
                  <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Completed Visits</p>
                  <p className="text-3xl font-bold font-heading text-success mt-2">{stats.completed}</p>
                </div>
              </Card>

              <Card>
                <div className="text-left">
                  <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider">No-Show Sessions</p>
                  <p className="text-3xl font-bold font-heading text-danger mt-2">{stats.noShow}</p>
                </div>
              </Card>

              <Card>
                <div className="text-left">
                  <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Slot Fill Rate</p>
                  <p className="text-3xl font-bold font-heading text-warning mt-2">{stats.fillRate}%</p>
                </div>
              </Card>

              <Card>
                <div className="text-left">
                  <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Collected Revenue</p>
                  <p className="text-3xl font-bold font-heading text-secondary mt-2">₹{stats.totalRevenue}</p>
                </div>
              </Card>
            </div>

            {/* Referrals Breakdown & Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Trend Chart (Recharts) */}
              <div className="lg:col-span-2">
                <Card title="Appointment Trend Analysis" subtitle="Weekly distribution grid slots">
                  <div className="h-64 mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={stats.trendData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" tickLine={false} />
                        <YAxis tickLine={false} />
                        <Tooltip />
                        <Bar dataKey="appointments" fill="#0F766E" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
              </div>

              {/* Referrals ledger status */}
              <div className="lg:col-span-1">
                <Card title="Outbound Referrals Summary" subtitle="Clinic to clinic dispatch log tracking" className="h-full">
                  <div className="space-y-4 mt-6 text-left">
                    <div className="flex justify-between items-center pb-2 border-b border-border-custom">
                      <span className="text-sm font-sans font-medium text-text-primary">Total Referrals Sent</span>
                      <span className="text-base font-bold text-text-primary font-mono">{stats.referralsCount.total}</span>
                    </div>
                    <div className="flex justify-between items-center pb-2 border-b border-border-custom">
                      <span className="text-sm font-sans font-medium text-text-primary">Pending Reviews</span>
                      <span className="text-base font-bold text-warning font-mono">{stats.referralsCount.pending}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-sans font-medium text-text-primary">Accepted Admissions</span>
                      <span className="text-base font-bold text-success font-mono">{stats.referralsCount.accepted}</span>
                    </div>
                  </div>
                </Card>
              </div>

            </div>
          </>
        ) : (
          <p className="font-sans text-sm text-text-secondary py-6 text-center">Failed to fetch performance statistics.</p>
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

export default AnalyticsDashboard;
