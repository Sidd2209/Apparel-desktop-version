import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TooltipProvider } from '@/components/ui/tooltip';
import { AuthProvider } from './contexts/AuthContext';
import Index from './pages/Index';
import NotFound from './pages/NotFound';
import LoginPage from './pages/LoginPage';

// Import all page components
import Dashboard from './components/Dashboard';
import OrderManagement from './components/OrderManagement';
import ProductDevelopment from './components/ProductDevelopment';
import CostingCalculator from './components/CostingCalculator';
import SourcingManagement from './components/SourcingManagement';
import ProductionScheduler from './components/ProductionScheduler';
import QualityControl from './components/QualityControl';
import ShippingModule from './components/ShippingModule';
import InventoryManagement from './components/InventoryManagement';
import { ProfileSetup } from './components/ProfileSetup';
import { AuthGate } from './components/AuthGate';

const queryClient = new QueryClient();

const App = () => {
  useEffect(() => {
    // Debug log for Tauri API presence
    // @ts-ignore
    if ((window as any).__TAURI_INTERNALS__) {
      console.log('Tauri context detected:', (window as any).__TAURI_INTERNALS__);
    } else {
      console.log('Tauri context NOT detected');
    }
    // Log the current window location
    console.log('Window location:', window.location.href);
  }, []);

  return (
    <TooltipProvider>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route element={<AuthGate />}>
                <Route path="/" element={<Index />}>
                  <Route index element={<OrderManagement />} />
                  <Route path="product-dev" element={<ProductDevelopment />} />
                  <Route path="orders" element={<OrderManagement />} />
                  <Route path="costing" element={<CostingCalculator />} />
                  <Route path="production" element={<ProductionScheduler />} />
                  <Route path="inventory" element={<InventoryManagement />} />
                  <Route path="*" element={<NotFound />} />
                </Route>
                <Route path="/profile-setup" element={<ProfileSetup />} />
              </Route>
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </TooltipProvider>
  );
};

export default App;