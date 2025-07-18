import React from 'react';
import { Outlet } from 'react-router-dom';

export const AuthGate: React.FC = () => {
  return <Outlet />;
};