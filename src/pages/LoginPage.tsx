import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simple offline authentication
    if (email && password) {
      await login(email, password);
      navigate('/orders');
    }
  };

  const handleDemoLogin = async () => {
    await login('demo@apparelflow.com', 'demo123');
    navigate('/orders');
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="p-8 bg-white rounded-lg shadow-md max-w-sm w-full text-center">
        <h1 className="text-2xl font-bold mb-2 text-gray-800">Welcome to Apparel Flow</h1>
        <p className="text-gray-600 mb-6">Sign in to continue</p>
        
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
          >
            Sign In
          </button>
        </form>
        
        <div className="mt-4">
          <button
            onClick={handleDemoLogin}
            className="w-full bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 transition-colors"
          >
            Demo Login
          </button>
        </div>
        
        <p className="text-xs text-gray-500 mt-4">
          This is an offline application. Any email/password combination will work for demo purposes.
        </p>
      </div>
    </div>
  );
};

export default LoginPage;