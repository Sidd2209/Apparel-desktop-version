import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getDepartmentKPIs, getDepartmentNotifications, mockOrders, mockProducts } from '@/data/mockData';
import KPICard from './KPICard';
import OrderCard from './OrderCard';
import ProductCard from './ProductCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bell, TrendingUp, Package, Users } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { user } = useAuth();

  if (!user) return null;

  const kpis = getDepartmentKPIs(user.department) || [];
  const notifications = getDepartmentNotifications(user.department) || [];
  const unreadCount = notifications.filter(n => !n.isRead).length;

  const departmentTitles = {
    merchandising: 'Merchandising Dashboard',
    logistics: 'Logistics Dashboard',
    procurement: 'Procurement Dashboard',
    sampling: 'Sampling Dashboard',
    management: 'Executive Dashboard',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {departmentTitles[user.department]}
          </h1>
          <p className="text-gray-600 mt-1">
            Welcome back, {user.name}! Here's what's happening today.
          </p>
        </div>
        {/* Removed notification icon and badge */}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, index) => (
          <KPICard key={index} kpi={kpi} />
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recent Orders */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Recent Orders
              </CardTitle>
              <Badge variant="outline">
                {mockOrders.length} active
              </Badge>
            </CardHeader>
            <CardContent className="space-y-4">
              {mockOrders.slice(0, 3).map(order => (
                <OrderCard key={order.id} order={order} />
              ))}
            </CardContent>
          </Card>
        </div>
        {/* Removed Notifications section */}
      </div>

      {/* Product Development Section (for relevant departments) */}
      {(user.department === 'merchandising' || user.department === 'sampling' || user.department === 'management') && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Product Development
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {mockProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-blue-600">
                  {user.department === 'management' ? '45' : '12'}
                </p>
                <p className="text-sm text-gray-600">Active Tasks</p>
              </div>
              <Users className="h-8 w-8 text-blue-500 opacity-75" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-green-600">94%</p>
                <p className="text-sm text-gray-600">Efficiency Rate</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500 opacity-75" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-purple-600">
                  {user.department === 'management' ? '8' : '3'}
                </p>
                <p className="text-sm text-gray-600">Projects</p>
              </div>
              <Package className="h-8 w-8 text-purple-500 opacity-75" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
