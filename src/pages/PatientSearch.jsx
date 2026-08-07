import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import NavigationShell from '../components/NavigationShell';
import Card from '../components/Card';
import Input from '../components/Input';
import Button from '../components/Button';
import Toast from '../components/Toast';
import Modal from '../components/Modal';
import Skeleton from '../components/Skeleton';
import useAuthStore from '../store/authStore';
import api from '../services/api';

const patientSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().min(10, 'Please enter a valid phone number'),
  email: z.string().email('Please enter a valid email address').or(z.literal('')),
  dob: z.string().min(1, 'Date of birth is required'),
  gender: z.enum(['Male', 'Female', 'Other']),
  consent_sms: z.boolean().default(false),
  consent_whatsapp: z.boolean().default(false),
  consent_email: z.boolean().default(false)
});

const PatientSearch = () => {
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const [searchPhone, setSearchPhone] = useState('');
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [toastType, setToastType] = useState('info');

  // Modal Resolution State
  const [duplicateModalOpen, setDuplicateModalOpen] = useState(false);
  const [duplicateRecord, setDuplicateRecord] = useState(null);
  const [pendingFormData, setPendingFormData] = useState(null);
  const [submittingPatient, setSubmittingPatient] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      gender: 'Male',
      consent_sms: false,
      consent_whatsapp: false,
      consent_email: false
    }
  });

  const triggerToast = (msg, type = 'info') => {
    setToastType(type);
    setToastMessage(msg);
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchPhone) return;
    setLoading(true);
    try {
      const res = await api.get(`/frontdesk/patients?phone=${searchPhone}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.success) {
        setPatients(res.data);
      }
    } catch (err) {
      triggerToast(err.error || 'Failed to search patients', 'error');
    } finally {
      setLoading(false);
    }
  };

  const submitPatientData = async (data, bypass = false) => {
    setSubmittingPatient(true);
    try {
      const payload = {
        ...data,
        facilityId: user?.facilityId || '00000000-0000-0000-0000-000000000000',
        bypassDuplicate: bypass
      };

      const res = await api.post('/frontdesk/patients', payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.success) {
        if (res.data.duplicateFound) {
          // Open duplicate check resolution popup
          setDuplicateRecord(res.data.existingPatient);
          setPendingFormData(data);
          setDuplicateModalOpen(true);
        } else {
          triggerToast('Patient record created successfully', 'success');
          reset();
          // Reload list
          setPatients((prev) => [res.data, ...prev]);
        }
      }
    } catch (err) {
      triggerToast(err.error || 'Failed to create patient', 'error');
    } finally {
      setSubmittingPatient(false);
    }
  };

  const onSubmit = (data) => {
    submitPatientData(data, false);
  };

  return (
    <NavigationShell role={user?.role} userName={user?.name} onLogout={logout}>
      <div className="max-w-5xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold font-heading text-secondary mb-2">Patient Search & Duplicate Resolution</h1>
          <p className="font-sans text-text-secondary">Search patient demographic records, add new profiles, and manage duplicates inline.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left panel: Add Patient */}
          <div className="lg:col-span-1">
            <Card title="Add New Patient">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
                <Input 
                  label="Patient Name" 
                  placeholder="Rajesh Kumar"
                  error={errors.name}
                  {...register('name')}
                />
                <Input 
                  label="Phone Number" 
                  placeholder="+91 98765 43210"
                  error={errors.phone}
                  {...register('phone')}
                />
                <Input 
                  label="Email (Optional)" 
                  type="email" 
                  placeholder="rajesh.k@gmail.com"
                  error={errors.email}
                  {...register('email')}
                />
                <Input 
                  label="Date of Birth" 
                  type="date"
                  error={errors.dob}
                  {...register('dob')}
                />
                <Input 
                  label="Gender" 
                  options={[
                    { value: 'Male', label: 'Male' },
                    { value: 'Female', label: 'Female' },
                    { value: 'Other', label: 'Other' }
                  ]}
                  error={errors.gender}
                  {...register('gender')}
                />

                <div className="space-y-2 pt-2 border-t border-border-custom">
                  <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Communication Consents</span>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="consent_sms" {...register('consent_sms')} className="rounded border-border-custom text-primary focus:ring-primary" />
                    <label htmlFor="consent_sms" className="text-xs text-text-primary">SMS Alerts Consent</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="consent_whatsapp" {...register('consent_whatsapp')} className="rounded border-border-custom text-primary focus:ring-primary" />
                    <label htmlFor="consent_whatsapp" className="text-xs text-text-primary">WhatsApp Notifications Consent</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="consent_email" {...register('consent_email')} className="rounded border-border-custom text-primary focus:ring-primary" />
                    <label htmlFor="consent_email" className="text-xs text-text-primary">Email Notifications Consent</label>
                  </div>
                </div>

                <Button type="submit" variant="primary" className="w-full mt-4" disabled={submittingPatient}>
                  {submittingPatient ? 'Saving...' : 'Create New Patient'}
                </Button>
              </form>
            </Card>
          </div>

          {/* Right panel: Search and Results */}
          <div className="lg:col-span-2 space-y-6">
            <Card title="Search Registry">
              <form onSubmit={handleSearch} className="flex gap-4 mt-2">
                <Input 
                  placeholder="Enter phone number..." 
                  value={searchPhone}
                  onChange={(e) => setSearchPhone(e.target.value)}
                  className="flex-1"
                />
                <Button type="submit" variant="primary">
                  Search
                </Button>
              </form>
            </Card>

            <Card title="Search Results">
              {loading ? (
                <div className="space-y-3">
                  <Skeleton variant="text" width="60%" />
                  <Skeleton variant="text" width="80%" />
                  <Skeleton variant="text" width="50%" />
                </div>
              ) : patients.length > 0 ? (
                <div className="divide-y divide-border-custom">
                  {patients.map((pat) => (
                    <div key={pat.id} className="py-4 first:pt-0 last:pb-0 flex items-center justify-between">
                      <div>
                        <h4 className="font-heading font-semibold text-base text-text-primary">{pat.name}</h4>
                        <p className="font-sans text-xs text-text-secondary">
                          Phone: {pat.phone} | DOB: {pat.dob} | Gender: {pat.gender}
                        </p>
                      </div>
                      <a 
                        href={`/frontdesk/patients/${pat.id}`} 
                        className="bg-transparent border border-primary text-primary font-sans font-semibold text-xs py-1.5 px-4 rounded hover:bg-[#F0FDFA] transition-colors"
                      >
                        View Profile
                      </a>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="font-sans text-sm text-text-secondary py-6 text-center">No patient records loaded. Enter a search query to lookup profiles.</p>
              )}
            </Card>
          </div>
        </div>
      </div>

      {/* Duplicate Verification Modal Resolution */}
      <Modal
        isOpen={duplicateModalOpen}
        onClose={() => setDuplicateModalOpen(false)}
        title="Duplicate Profile Detected"
        footerActions={
          <>
            <Button variant="secondary" onClick={() => setDuplicateModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={() => {
              setDuplicateModalOpen(false);
              // Retry bypassing checks
              submitPatientData(pendingFormData, true);
            }}>
              Create Anyway
            </Button>
            <a 
              href={`/frontdesk/patients/${duplicateRecord?.id}`}
              className="bg-primary text-white font-sans font-semibold text-sm py-3 px-6 rounded-lg hover:bg-primary-hover active:scale-[1.02] flex items-center justify-center"
            >
              Use Existing
            </a>
          </>
        }
      >
        <p className="mb-2">A patient profile matching this phone number already exists in the system database:</p>
        <div className="bg-slate-50 p-4 rounded-lg border border-border-custom font-semibold text-text-primary mb-2 text-left">
          <p className="text-sm font-bold">Name: {duplicateRecord?.name}</p>
          <p className="text-xs text-text-secondary">Phone: {duplicateRecord?.phone}</p>
          <p className="text-xs text-text-secondary">DOB: {duplicateRecord?.dob} | Gender: {duplicateRecord?.gender}</p>
        </div>
        <p>Would you like to use the existing profile or proceed with creation regardless?</p>
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

export default PatientSearch;
