import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { TooltipProvider } from '@/components/ui/tooltip';
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

const App = () => {
  return (
    <TooltipProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<AuthGate />}>
            <Route path="/" element={<Index />}>
              <Route index element={<OrderManagement />} />
              <Route path="product-dev" element={<ProductDevelopment />} />
              <Route path="costing" element={<CostingCalculator />} />
              <Route path="production" element={<ProductionScheduler />} />
              <Route path="inventory" element={<InventoryManagement />} />
              <Route path="orders" element={<OrderManagement />} />
            </Route>
            <Route path="/profile-setup" element={<ProfileSetup />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  );
};

export default App;