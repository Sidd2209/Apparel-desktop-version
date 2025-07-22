import React from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/DashboardLayout';

const Index: React.FC = () => {
  const { user, login } = useAuth();

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="m-auto flex flex-col items-center p-8 bg-white rounded-lg shadow-md w-full max-w-md">
          <h1 className="text-3xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent text-center">
            Welcome to ApparelOS 
          </h1>
          <p className="text-gray-600 mb-8 text-center">Click below to continue as a demo user.</p>
          <button
            className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
            onClick={() => login('demo@demo.com', 'any')}
          >
            Continue
          </button>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </DashboardLayout>
  );
};

export default Index;