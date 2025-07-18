import React from 'react';
import { useQuery } from '@apollo/client';
import { GET_SOURCING_DATA } from '../queries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ShoppingCart, Truck, Users, BarChart } from 'lucide-react';

// --- TypeScript Interfaces ---

interface Vendor {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  rating: number;
  onTimeDeliveryPercentage: number;
  totalOrders: number;
  activeOrders: number;
  status: 'ACTIVE' | 'INACTIVE' | 'PREFERRED';
}

interface OrderItem {
  name: string;
  quantity: number;
  unitPrice: number;
}

interface PurchaseOrder {
  id: string;
  poNumber: string;
  vendor: {
    id: string;
    name: string;
  };
  items: OrderItem[];
  totalAmount: number;
  status: 'PENDING' | 'APPROVED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  orderDate: string;
  expectedDeliveryDate: string;
  actualDeliveryDate?: string;
}

interface SourcingPerformance {
  averageDeliveryTimeDays: number;
  onTimeDeliveryRate: number;
  totalActiveVendors: number;
  activePurchaseOrders: number;
  topPerformingVendors: {
    id: string;
    name: string;
    rating: number;
  }[];
}

interface SourcingData {
  vendors: Vendor[];
  purchaseOrders: PurchaseOrder[];
  sourcingPerformance: SourcingPerformance;
}

const SourcingManagement: React.FC = () => {
  const { loading, error, data } = useQuery<SourcingData>(GET_SOURCING_DATA);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full p-8">
        <p>Loading sourcing data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-full p-8">
        <p className="text-red-500">Error loading sourcing data: {error.message}</p>
      </div>
    );
  }

  const vendors = data?.vendors || [];
  const purchaseOrders = data?.purchaseOrders || [];
  const performance = data?.sourcingPerformance;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
      case 'PREFERRED':
      case 'APPROVED':
      case 'DELIVERED':
        return 'bg-green-100 text-green-800';
      case 'INACTIVE':
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'SHIPPED':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-8 p-4 md:p-8">
      <div className="flex items-center gap-4">
        <Truck className="h-8 w-8 text-gray-700" />
        <h1 className="text-3xl font-bold text-gray-900">Sourcing & Vendor Management</h1>
      </div>

      {/* Performance Analytics Section */}
      {performance && (
        <section>
          <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
            <BarChart className="h-6 w-6" />
            Performance Analytics
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">On-Time Delivery Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{performance.onTimeDeliveryRate}%</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Avg. Delivery Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{performance.averageDeliveryTimeDays} Days</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Active Vendors</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{performance.totalActiveVendors}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Active POs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{performance.activePurchaseOrders}</div>
              </CardContent>
            </Card>
          </div>
        </section>
      )}

      {/* Vendor List Section */}
      <section>
        <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
          <Users className="h-6 w-6" />
          Vendors
        </h2>
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>On-Time Delivery</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vendors.map((vendor) => (
                <TableRow key={vendor.id}>
                  <TableCell className="font-medium">{vendor.name}</TableCell>
                  <TableCell>{vendor.rating.toFixed(1)} / 5.0</TableCell>
                  <TableCell>{vendor.onTimeDeliveryPercentage}%</TableCell>
                  <TableCell>
                    <Badge className={getStatusBadge(vendor.status)}>{vendor.status}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </section>

      {/* Purchase Orders Section */}
      <section>
        <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
          <ShoppingCart className="h-6 w-6" />
          Purchase Orders
        </h2>
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>PO Number</TableHead>
                <TableHead>Vendor</TableHead>
                <TableHead>Total Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Expected Delivery</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {purchaseOrders.map((po) => (
                <TableRow key={po.id}>
                  <TableCell className="font-medium">{po.poNumber}</TableCell>
                  <TableCell>{po.vendor.name}</TableCell>
                  <TableCell>${po.totalAmount.toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge className={getStatusBadge(po.status)}>{po.status}</Badge>
                  </TableCell>
                  <TableCell>{new Date(po.expectedDeliveryDate).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </section>
    </div>
  );
};

export default SourcingManagement;
