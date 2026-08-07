import React, { useState } from 'react';
import Button from '../components/Button';
import Card from '../components/Card';
import StatusBadge from '../components/StatusBadge';
import Toggle from '../components/Toggle';
import Input from '../components/Input';
import Modal from '../components/Modal';
import Toast from '../components/Toast';
import Skeleton from '../components/Skeleton';
import NavigationShell from '../components/NavigationShell';

const ComponentShowcase = () => {
  const [toggleVal, setToggleVal] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [role, setRole] = useState('doctor');

  const addToast = (message, type) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter(t => t.id !== id));
  };

  return (
    <NavigationShell 
      role={role} 
      userName="Dr. Samantha Cooper" 
      onLogout={() => addToast('Logged out clicked', 'info')}
    >
      <div className="max-w-4xl mx-auto space-y-8 pb-16">
        <div>
          <h1 className="text-3xl font-bold font-heading text-secondary mb-2">Design System Showcase</h1>
          <p className="font-sans text-text-secondary">Verify design specifications, radius limits, hover transitions, and dark teal accents.</p>
        </div>

        {/* Role Selector Helper */}
        <Card title="Quick Sandbox Helpers">
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-text-primary">Change Navigation Shell Role:</span>
            {['doctor', 'frontdesk', 'admin', 'patient'].map((r) => (
              <button
                key={r}
                onClick={() => setRole(r)}
                className={`px-3 py-1.5 rounded text-xs font-semibold uppercase transition-colors ${
                  role === r ? 'bg-primary text-white' : 'bg-slate-100 text-text-secondary hover:bg-slate-200'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </Card>

        {/* Buttons Section */}
        <Card title="Buttons (Section 4.3)" subtitle="Verifying scale transitions, padding, and state configs">
          <div className="flex flex-wrap gap-4 mt-2">
            <Button variant="primary" onClick={() => addToast('Primary Action Fired!', 'success')}>
              Primary Button
            </Button>
            <Button variant="secondary" onClick={() => addToast('Secondary Action Fired!', 'info')}>
              Secondary Button
            </Button>
            <Button variant="danger" onClick={() => addToast('Destructive Action Fired!', 'error')}>
              Danger Button
            </Button>
            <Button variant="primary" disabled>
              Disabled Button
            </Button>
          </div>
        </Card>

        {/* Status Badges Section */}
        <Card title="Status Badges" subtitle="Light tint background with matching darker text and colored dots">
          <div className="flex flex-wrap gap-4 mt-2">
            <StatusBadge status="booked" />
            <StatusBadge status="checked_in" />
            <StatusBadge status="in_queue" />
            <StatusBadge status="in_consultation" />
            <StatusBadge status="completed" />
            <StatusBadge status="cancelled" />
            <StatusBadge status="no_show" />
          </div>
        </Card>

        {/* Toggles & Form Input Section */}
        <Card title="Toggles & Inputs" subtitle="44x24px pill toggles and custom form fields">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-text-primary uppercase tracking-wider">Toggles</h4>
              <Toggle 
                checked={toggleVal} 
                onChange={() => setToggleVal(!toggleVal)} 
                label={`Switch toggle is ${toggleVal ? 'ON' : 'OFF'}`} 
              />
              <Toggle 
                checked={true} 
                disabled 
                label="Disabled On Toggle" 
              />
            </div>
            
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-text-primary uppercase tracking-wider">Inputs & Selects</h4>
              <Input 
                label="Full Name" 
                placeholder="John Doe" 
              />
              <Input 
                label="Department" 
                options={[
                  { value: 'cardiology', label: 'Cardiology' },
                  { value: 'orthopedics', label: 'Orthopedics' },
                  { value: 'pediatrics', label: 'Pediatrics' }
                ]} 
              />
              <Input 
                label="Phone Number" 
                error={{ message: "Phone number format is invalid" }} 
                defaultValue="987654" 
              />
            </div>
          </div>
        </Card>

        {/* Modals & Toasts Sandbox */}
        <Card title="Interactive Overlays" subtitle="Test modal dialogs and slide-in toast notifications">
          <div className="flex gap-4 mt-2">
            <Button variant="secondary" onClick={() => setIsModalOpen(true)}>
              Open Test Modal
            </Button>
            <Button variant="primary" onClick={() => addToast('This is a success notification!', 'success')}>
              Trigger Success Toast
            </Button>
            <Button variant="danger" onClick={() => addToast('This is an error warning!', 'error')}>
              Trigger Error Toast
            </Button>
          </div>
        </Card>

        {/* Shimmer Skeleton Loaders */}
        <Card title="Skeleton Shimmer Loaders" subtitle="Verify visual skeleton configurations instead of spinner animations">
          <div className="space-y-3 mt-2">
            <div className="flex items-center space-x-3">
              <Skeleton variant="avatar" />
              <div className="space-y-1.5 flex-1">
                <Skeleton variant="text" width="40%" height="16px" />
                <Skeleton variant="text" width="60%" height="12px" />
              </div>
            </div>
            <Skeleton variant="rect" height="60px" />
          </div>
        </Card>
      </div>

      {/* Modal Element */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Merge Suggestion Resolution"
        footerActions={
          <>
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={() => {
              setIsModalOpen(false);
              addToast('Records merged successfully', 'success');
            }}>Use Existing</Button>
          </>
        }
      >
        <p className="mb-2">A patient with this phone number already exists in the system database:</p>
        <div className="bg-slate-50 p-3 rounded border border-border-custom font-semibold text-text-primary mb-2">
          Rajesh Kumar - +91 98765 43210 (DOB: 12-04-1988)
        </div>
        <p>Would you like to resolve this duplicate profile match by linking it to the existing patient record?</p>
      </Modal>

      {/* Render Active Toasts */}
      {toasts.map((t) => (
        <Toast 
          key={t.id} 
          message={t.message} 
          type={t.type} 
          onClose={() => removeToast(t.id)} 
        />
      ))}
    </NavigationShell>
  );
};

export default ComponentShowcase;
