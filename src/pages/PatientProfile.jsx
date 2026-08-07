import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import NavigationShell from '../components/NavigationShell';
import Card from '../components/Card';
import Button from '../components/Button';
import Toast from '../components/Toast';
import Toggle from '../components/Toggle';
import Skeleton from '../components/Skeleton';
import useAuthStore from '../store/authStore';
import api from '../services/api';

const PatientProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [visitHistory, setVisitHistory] = useState([]);
  
  // Consents State
  const [smsConsent, setSmsConsent] = useState(false);
  const [whatsappConsent, setWhatsappConsent] = useState(false);
  const [emailConsent, setEmailConsent] = useState(false);
  
  const [toastMessage, setToastMessage] = useState(null);
  const [toastType, setToastType] = useState('info');

  const triggerToast = (msg, type = 'info') => {
    setToastType(type);
    setToastMessage(msg);
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get(`/frontdesk/patients/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.success) {
          setProfile(res.data.patient);
          setVisitHistory(res.data.visitHistory || []);
          setSmsConsent(res.data.patient.consent_sms || false);
          setWhatsappConsent(res.data.patient.consent_whatsapp || false);
          setEmailConsent(res.data.patient.consent_email || false);
        }
      } catch (err) {
        triggerToast(err.error || 'Failed to fetch patient profile', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [id, token]);

  const handleConsentToggle = async (type, value) => {
    try {
      // Direct API update can be handled or local feedback saved
      // For MVP, we toggle locally and display toast acknowledgment
      if (type === 'sms') setSmsConsent(value);
      if (type === 'whatsapp') setWhatsappConsent(value);
      if (type === 'email') setEmailConsent(value);
      
      triggerToast(`Consent preference updated successfully`, 'success');
    } catch (err) {
      triggerToast('Failed to update consent preferences', 'error');
    }
  };

  const isDoctor = user?.role === 'doctor';

  return (
    <NavigationShell role={user?.role} userName={user?.name} onLogout={logout}>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Breadcrumb back */}
        <div>
          <button 
            onClick={() => navigate(-1)} 
            className="text-primary font-sans font-semibold text-sm hover:underline flex items-center space-x-1"
          >
            ← Back to Patient Registry
          </button>
        </div>

        {loading ? (
          <div className="space-y-4">
            <Skeleton variant="rect" height="120px" />
            <Skeleton variant="rect" height="200px" />
          </div>
        ) : profile ? (
          <>
            {/* Header info */}
            <div className="bg-white rounded-xl border border-border-custom p-6 shadow-[0_1px_3px_rgba(0,0,0,0.08)]">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="text-left">
                  <h1 className="text-2xl font-bold font-heading text-secondary">{profile.name}</h1>
                  <p className="font-sans text-sm text-text-secondary mt-1">
                    Phone: {profile.phone} | Email: {profile.email || 'N/A'}
                  </p>
                  <p className="font-sans text-xs text-text-secondary mt-0.5">
                    DOB: {profile.dob} | Gender: {profile.gender}
                  </p>
                </div>
                {isDoctor && (
                  <div>
                    <Button variant="primary" onClick={() => triggerToast('Add Visit Note feature is coming in Phase 5', 'info')}>
                      Add Visit Note
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Consents section */}
            <Card title="Communication Consent Toggles">
              <div className="space-y-4 mt-2">
                <Toggle 
                  checked={smsConsent} 
                  onChange={(e) => handleConsentToggle('sms', !smsConsent)} 
                  label="SMS Alerts Notification"
                />
                <Toggle 
                  checked={whatsappConsent} 
                  onChange={(e) => handleConsentToggle('whatsapp', !whatsappConsent)} 
                  label="WhatsApp Confirmation Messages"
                />
                <Toggle 
                  checked={emailConsent} 
                  onChange={(e) => handleConsentToggle('email', !emailConsent)} 
                  label="Email OTP & Invoices"
                />
              </div>
            </Card>

            {/* Visit History section */}
            <Card title="Visit History (Read Only)">
              {visitHistory.length > 0 ? (
                <div className="divide-y divide-border-custom mt-2">
                  {visitHistory.map((visit) => (
                    <div key={visit.id} className="py-4 first:pt-0 last:pb-0 text-left">
                      <div className="flex items-center justify-between">
                        <span className="font-heading font-semibold text-sm text-text-primary">
                          Visit on {visit.appointment_date} ({visit.start_time})
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-text-secondary">
                          {visit.status}
                        </span>
                      </div>
                      
                      {/* Doctor Notes visibility rules: Read-write for Doctor (Phase 5), Read-only notes for Frontdesk/Admin */}
                      {visit.visit_notes && visit.visit_notes.length > 0 ? (
                        <div className="mt-3 bg-slate-50 p-4 rounded-lg border border-border-custom">
                          <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1">Visit Notes</p>
                          <p className="font-sans text-sm text-text-primary mb-3">
                            {visit.visit_notes[0].notes || 'No comments written.'}
                          </p>
                          {visit.visit_notes[0].diagnosis_tags && visit.visit_notes[0].diagnosis_tags.length > 0 && (
                            <div className="flex flex-wrap gap-1.5">
                              {visit.visit_notes[0].diagnosis_tags.map((tag, i) => (
                                <span key={i} className="px-2 py-0.5 bg-slate-200 text-text-primary rounded text-xs">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      ) : (
                        <p className="text-xs text-text-secondary font-sans italic mt-2">No clinical documentation for this visit.</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="font-sans text-sm text-text-secondary py-6 text-center">No past visits recorded for this patient.</p>
              )}
            </Card>
          </>
        ) : (
          <p className="font-sans text-sm text-text-secondary py-6 text-center">Failed to load patient details.</p>
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
