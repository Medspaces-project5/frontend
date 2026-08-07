import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import NavigationShell from '../components/NavigationShell';
import Input from '../components/Input';
import Button from '../components/Button';
import Toast from '../components/Toast';
import Card from '../components/Card';
import api from '../services/api';
import useAuthStore from '../store/authStore';

const inviteSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  role: z.enum(['doctor', 'frontdesk']),
  facilityId: z.string().min(10, 'Please enter a valid Facility UUID')
});

const AddStaffMember = () => {
  const logout = useAuthStore((state) => state.logout);
  const [toastMessage, setToastMessage] = useState(null);
  const [toastType, setToastType] = useState('info');
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(inviteSchema),
    defaultValues: {
      role: 'doctor',
      facilityId: '00000000-0000-0000-0000-000000000000'
    }
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const token = useAuthStore.getState().token;
      const res = await api.post('/admin/staff/invite', data, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.success) {
        setToastType('success');
        setToastMessage(`Invitation dispatched to ${data.email}!`);
        reset();
      }
    } catch (err) {
      setToastType('error');
      setToastMessage(err.error || 'Failed to dispatch staff invitation.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <NavigationShell role="admin" userName="Clinic Super Admin" onLogout={logout}>
      <div className="max-w-xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold font-heading text-secondary mb-2">Manage Staff Accounts</h1>
          <p className="font-sans text-text-secondary">Invite Doctor and Front Desk staff members. They will receive an email containing registration login access details.</p>
        </div>

        <Card title="Add New Staff Member" subtitle="Authorized Administrator creation endpoint">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
            <Input 
              label="Staff Member Name" 
              placeholder="Dr. John Watson"
              error={errors.name}
              {...register('name')}
            />

            <Input 
              label="Email Address" 
              type="email" 
              placeholder="john.watson@medspaces.com"
              error={errors.email}
              {...register('email')}
            />

            <Input 
              label="Staff Role" 
              options={[
                { value: 'doctor', label: 'Doctor / Medical Professional' },
                { value: 'frontdesk', label: 'Front Desk Operator' }
              ]} 
              error={errors.role}
              {...register('role')}
            />

            <Input 
              label="Facility Assignment (UUID)" 
              placeholder="00000000-0000-0000-0000-000000000000"
              error={errors.facilityId}
              {...register('facilityId')}
            />

            <Button type="submit" variant="primary" className="w-full mt-4" disabled={isLoading}>
              {isLoading ? 'Creating...' : 'Invite Staff Member'}
            </Button>
          </form>
        </Card>
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

export default AddStaffMember;
