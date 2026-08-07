import React from 'react';
import { NavLink } from 'react-router-dom';
import { Calendar, User, FileText, Settings, Users, LogOut, LayoutDashboard, CreditCard, ShieldAlert } from 'lucide-react';

const NavigationShell = ({ role, userName, onLogout, children }) => {
  // Define menu items available for each role (reusable shared components, not hardcoded inside the component body)
  const menuConfig = {
    admin: [
      { path: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { path: '/admin/staff', label: 'Manage Staff', icon: Users },
      { path: '/admin/billing', label: 'Billing Configuration', icon: Settings },
    ],
    doctor: [
      { path: '/doctor/queue', label: 'Today\'s Queue', icon: ShieldAlert },
      { path: '/doctor/calendar', label: 'Calendar', icon: Calendar },
      { path: '/doctor/patients', label: 'My Patients', icon: Users },
      { path: '/doctor/availability', label: 'Availability', icon: Settings },
    ],
    frontdesk: [
      { path: '/frontdesk/queue', label: 'Today\'s Queue', icon: ShieldAlert },
      { path: '/frontdesk/calendar', label: 'Calendar', icon: Calendar },
      { path: '/frontdesk/patients', label: 'Patient Registry', icon: Users },
      { path: '/frontdesk/billing', label: 'Billing Fees', icon: CreditCard },
    ],
    patient: [
      { path: '/patient/home', label: 'Dashboard', icon: LayoutDashboard },
      { path: '/patient/appointments', label: 'My Appointments', icon: Calendar },
      { path: '/patient/bills', label: 'My Bills', icon: CreditCard },
      { path: '/patient/profile', label: 'My Profile', icon: User },
    ]
  };

  const menuItems = menuConfig[role] || [];

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-app-bg text-text-primary font-sans">
      {/* Sidebar Nav */}
      <aside className="w-full md:w-64 bg-white border-r border-border-custom flex flex-col justify-between">
        <div>
          {/* Header */}
          <div className="h-16 px-6 border-b border-border-custom flex items-center justify-between">
            <span className="font-logo font-bold text-lg text-[#0D4846] uppercase tracking-[0.08em]">MEDSPACES</span>
            <span className="px-2 py-0.5 text-[10px] font-bold bg-[#EFF6FF] text-secondary rounded uppercase">
              {role}
            </span>
          </div>
          
          {/* User Name */}
          <div className="px-6 py-4 border-b border-border-custom bg-slate-50/50">
            <p className="text-xs text-text-secondary font-medium uppercase tracking-wider">Signed in as</p>
            <p className="text-sm font-semibold text-text-primary mt-0.5">{userName || 'User Name'}</p>
          </div>

          {/* Nav Items */}
          <nav className="p-4 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) => 
                    `flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive 
                        ? 'bg-[#F0FDFA] text-primary' 
                        : 'text-text-secondary hover:text-text-primary hover:bg-slate-50'
                    }`
                  }
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Footer Logout */}
        <div className="p-4 border-t border-border-custom">
          <button 
            onClick={onLogout}
            className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium text-danger hover:bg-red-50/50 transition-colors focus:outline-none"
          >
            <LogOut className="h-5 w-5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-8">
        {children}
      </main>
    </div>
  );
};

export default NavigationShell;
