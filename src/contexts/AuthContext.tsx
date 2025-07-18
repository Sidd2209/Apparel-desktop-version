import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useApolloClient } from '@apollo/client';
import { User, Department } from '@/types';

interface AuthContextType {
  user: User | null;
  authLoading: boolean;
  updateUserProfile: (updatedData: Partial<User>) => void;
  logout: () => void;
  switchDepartment: (department: Department) => void;
  login: (email: string, password: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const client = useApolloClient();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
    }
    setAuthLoading(false);
  }, []);

  const updateUserProfile = (updatedData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...updatedData };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  const logout = async () => {
    setUser(null);
    localStorage.removeItem('user');
    await client.resetStore();
  };

  const switchDepartment = (department: Department) => {
    if (user) {
      const updatedUser = { ...user, department };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  // Demo login: sets a fake user for direct access
  const login = async (email: string, password: string) => {
    const demoUser: User = {
      id: email,
      name: email.split('@')[0],
      email,
      department: 'DESIGN' as Department,
      preferredHomepage: '/orders',
    };
    setUser(demoUser);
    localStorage.setItem('user', JSON.stringify(demoUser));
  };

  return (
    <AuthContext.Provider value={{ user, authLoading, updateUserProfile, logout, switchDepartment, login }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
