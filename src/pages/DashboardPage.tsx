
import React from 'react';
import Dashboard from '@/components/dashboard/Dashboard';

const DashboardPage: React.FC = () => {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      <Dashboard />
    </div>
  );
};

export default DashboardPage;
