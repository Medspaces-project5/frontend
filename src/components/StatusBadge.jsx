import React from 'react';

const StatusBadge = ({ status }) => {
  // Configs based on Section 4: booked, checked_in/in_queue, in_consultation, completed, cancelled/no_show
  const statusConfig = {
    booked: {
      bg: 'bg-[#EFF6FF]', // light blue
      text: 'text-secondary', // #1E3A8A
      label: 'Booked'
    },
    checked_in: {
      bg: 'bg-[#FFFBEB]', // light amber
      text: 'text-warning', // #F59E0B
      label: 'Checked In'
    },
    in_queue: {
      bg: 'bg-[#FFFBEB]',
      text: 'text-warning',
      label: 'In Queue'
    },
    in_consultation: {
      bg: 'bg-[#F0FDFA]', // light teal
      text: 'text-primary', // #0F766E
      label: 'In Consultation'
    },
    completed: {
      bg: 'bg-[#F0FDF4]', // light green
      text: 'text-success', // #22C55E
      label: 'Completed'
    },
    cancelled: {
      bg: 'bg-[#FEF2F2]', // light red
      text: 'text-danger', // #EF4444
      label: 'Cancelled'
    },
    no_show: {
      bg: 'bg-[#FEF2F2]',
      text: 'text-danger',
      label: 'No Show'
    }
  };

  const current = statusConfig[status] || statusConfig.booked;

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${current.bg} ${current.text}`}>
      <span className={`h-1.5 w-1.5 rounded-full mr-1.5 ${current.text.replace('text-', 'bg-')}`}></span>
      {current.label}
    </span>
  );
};

export default StatusBadge;
