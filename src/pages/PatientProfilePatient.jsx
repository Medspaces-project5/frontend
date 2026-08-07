import React, { useEffect, useState } from 'react';
import NavigationShell from '../components/NavigationShell';
import Card from '../components/Card';
import Toast from '../components/Toast';
import Toggle from '../components/Toggle';
import Skeleton from '../components/Skeleton';
import useAuthStore from '../store/authStore';
import api from '../services/api';
import { User, Mail, Phone, Settings, Save, RotateCcw } from 'lucide-react';

const PatientProfile = () => {
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  
  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  // Consent values
  const [smsConsent, setSmsConsent] = useState(false);
  const [whatsappConsent, setWhatsappConsent] = useState(false);
  const [emailConsent, setEmailConsent] = useState(false);

  const [toastMessage, setToastMessage] = useState(null);
  const [toastType, setToastType] = useState('info');
  const [isSaving, setIsSaving] = useState(false);

  const triggerToast = (msg, type = 'info') => {
    setToastType(type);
    setToastMessage(msg);
  };

  const loadProfileData = (data) => {
    setProfile(data);
    setName(data.name || '');
    setEmail(data.email || '');
    setPhone(data.phone || '');
    setSmsConsent(data.consent_sms || false);
    setWhatsappConsent(data.consent_whatsapp || false);
    setEmailConsent(data.consent_email || false);
  };

  const fetchProfile = async () => {
    try {
      const profileRes = await api.patch('/patient/profile', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (profileRes.success) {
        loadProfileData(profileRes.data);
      }
    } catch (err) {
      triggerToast(err.error || 'Failed to retrieve profile details', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [token]);

  const handleSaveChanges = async (e) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      triggerToast('Name and phone fields are required.', 'error');
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        name,
        email,
        phone,
        consent_sms: smsConsent,
        consent_whatsapp: whatsappConsent,
        consent_email: emailConsent
      };

      const res = await api.patch('/patient/profile', payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.success) {
        loadProfileData(res.data);
        // Sync local auth state with new name if updated
        if (name !== user.name) {
          const updatedUser = { ...user, name };
          localStorage.setItem('user', JSON.stringify(updatedUser));
        }
        triggerToast('Profile Updated Successfully.', 'success');
      }
    } catch (err) {
      triggerToast(err.error || 'Failed to save changes.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    if (profile) {
      loadProfileData(profile);
      triggerToast('Changes reset to last saved state.', 'info');
    }
  };

  return (
    <NavigationShell role="patient" userName={user?.name} onLogout={logout}>
      <div className="max-w-2xl mx-auto space-y-6 select-none">
        <div className="text-left flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold font-heading text-secondary mb-2">My Profile</h1>
            <p className="font-sans text-sm text-text-secondary">Manage your personal information and clinic preferences.</p>
          </div>
          <div className="p-3 bg-white border border-[#D8E7E5] rounded-2xl shadow-sm text-primary">
            <Settings size={24} />
          </div>
        </div>

        {loading ? (
          <div className="space-y-4">
            <Skeleton variant="rect" height="150px" />
            <Skeleton variant="rect" height="150px" />
          </div>
        ) : (
          <form onSubmit={handleSaveChanges} className="space-y-6 text-left">
            {/* Personal Information */}
            <Card title="Personal Information">
              <div className="space-y-4 mt-4 font-sans">
                {/* Full Name */}
                <div className="flex flex-col space-y-1.5">
                  <label className="text-xs font-bold text-text-secondary uppercase">Full Name</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-text-secondary">
                      <User size={16} />
                    </span>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-white border border-[#D8E7E5] rounded-xl py-3 pl-11 pr-4 text-sm focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all"
                      placeholder="Your Full Name"
                      required
                    />
                  </div>
                </div>

                {/* Email Address */}
                <div className="flex flex-col space-y-1.5">
                  <label className="text-xs font-bold text-text-secondary uppercase">Email Address</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-text-secondary">
                      <Mail size={16} />
                    </span>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-white border border-[#D8E7E5] rounded-xl py-3 pl-11 pr-4 text-sm focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all"
                      placeholder="name@example.com"
                    />
                  </div>
                </div>

                {/* Phone Number */}
                <div className="flex flex-col space-y-1.5">
                  <label className="text-xs font-bold text-text-secondary uppercase">Phone Number</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-text-secondary">
                      <Phone size={16} />
                    </span>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-white border border-[#D8E7E5] rounded-xl py-3 pl-11 pr-4 text-sm focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all"
                      placeholder="+91 XXXXX XXXXX"
                      required
                    />
                  </div>
                </div>
              </div>
            </Card>

            {/* Communication Preferences */}
            <Card title="Communication Preferences">
              <p className="font-sans text-xs text-text-secondary mb-4 mt-2">
                Choose how you want to receive updates, OTP codes, and billing invoices.
              </p>
              
              <div className="space-y-4">
                <Toggle 
                  checked={emailConsent} 
                  onChange={() => setEmailConsent(!emailConsent)} 
                  label="Email Notifications" 
                  description="Receive statements and receipts via email"
                />
                <Toggle 
                  checked={smsConsent} 
                  onChange={() => setSmsConsent(!smsConsent)} 
                  label="SMS Notifications" 
                  description="Receive instant visit alerts and queue updates"
                />
                <Toggle 
                  checked={whatsappConsent} 
                  onChange={() => setWhatsappConsent(!whatsappConsent)} 
                  label="WhatsApp Notifications" 
                  description="Receive interactive message confirmations"
                />
              </div>
            </Card>

            {/* Form Actions */}
            <div className="flex items-center gap-4 pt-2 font-sans">
              <button 
                type="submit"
                disabled={isSaving}
                className="btn-shine text-white font-semibold text-xs py-3.5 px-6 rounded-2xl shadow-sm hover:scale-[1.02] active:scale-100 transition-all duration-200 flex items-center gap-1.5"
                style={{ background: 'linear-gradient(135deg, #0D4846, #11615D)' }}
              >
                <Save size={14} /> {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
              
              <button 
                type="button"
                onClick={handleReset}
                className="bg-transparent border border-[#D8E7E5] text-[#0D4846] font-semibold text-xs py-3.5 px-6 rounded-2xl hover:bg-slate-50 transition-all flex items-center gap-1.5"
              >
                <RotateCcw size={14} /> Reset Changes
              </button>
            </div>
          </form>
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

export default PatientProfile;
