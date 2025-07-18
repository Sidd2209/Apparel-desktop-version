
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Package, Truck, MapPin, Clock, Plus } from 'lucide-react';

interface Shipment {
  id: string;
  orderId: string;
  customerName: string;
  trackingNumber: string;
  carrier: string;
  status: 'preparing' | 'packed' | 'shipped' | 'in-transit' | 'delivered';
  origin: string;
  destination: string;
  shipDate?: string;
  estimatedDelivery: string;
  actualDelivery?: string;
  items: ShipmentItem[];
}

interface ShipmentItem {
  productName: string;
  quantity: number;
  weight: number;
}

const ShippingModule: React.FC = () => {
  const [shipments, setShipments] = useState<Shipment[]>([
    {
      id: 'SHP-001',
      orderId: 'ORD-001',
      customerName: 'Fashion Forward Ltd',
      trackingNumber: 'FF1234567890',
      carrier: 'FedEx',
      status: 'in-transit',
      origin: 'Manufacturing Facility - Mumbai',
      destination: 'New York, NY, USA',
      shipDate: '2024-01-10',
      estimatedDelivery: '2024-01-15',
      items: [
        { productName: 'Summer Breeze T-Shirt', quantity: 500, weight: 25.5 }
      ]
    },
    {
      id: 'SHP-002',
      orderId: 'ORD-002',
      customerName: 'Urban Style Co',
      trackingNumber: 'US0987654321',
      carrier: 'DHL',
      status: 'preparing',
      origin: 'Manufacturing Facility - Mumbai',
      destination: 'Los Angeles, CA, USA',
      estimatedDelivery: '2024-01-20',
      items: [
        { productName: 'Urban Denim Jacket', quantity: 200, weight: 60.0 }
      ]
    }
  ]);

  const getStatusColor = (status: string) => {
    const colors = {
      preparing: 'bg-yellow-100 text-yellow-800',
      packed: 'bg-blue-100 text-blue-800',
      shipped: 'bg-purple-100 text-purple-800',
      'in-transit': 'bg-orange-100 text-orange-800',
      delivered: 'bg-green-100 text-green-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'preparing':
        return <Package className="h-4 w-4" />;
      case 'packed':
        return <Package className="h-4 w-4" />;
      case 'shipped':
      case 'in-transit':
        return <Truck className="h-4 w-4" />;
      case 'delivered':
        return <MapPin className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Package className="h-6 w-6 text-purple-600" />
        <h1 className="text-3xl font-bold text-gray-900">Packing & Shipping Module</h1>
      </div>

      <Tabs defaultValue="shipments" className="space-y-6">
        <TabsList>
          <TabsTrigger value="shipments">Active Shipments</TabsTrigger>
          <TabsTrigger value="packing">Packing Lists</TabsTrigger>
          <TabsTrigger value="documentation">Documentation</TabsTrigger>
          <TabsTrigger value="tracking">Real-time Tracking</TabsTrigger>
        </TabsList>

        <TabsContent value="shipments" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="p-4 text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {shipments.filter(s => s.status === 'preparing').length}
              </div>
              <div className="text-sm text-gray-600">Preparing</div>
            </Card>
            <Card className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">
                {shipments.filter(s => s.status === 'shipped' || s.status === 'in-transit').length}
              </div>
              <div className="text-sm text-gray-600">In Transit</div>
            </Card>
            <Card className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">
                {shipments.filter(s => s.status === 'delivered').length}
              </div>
              <div className="text-sm text-gray-600">Delivered</div>
            </Card>
            <Card className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">
                {shipments.reduce((sum, s) => sum + s.items.reduce((itemSum, item) => itemSum + item.weight, 0), 0).toFixed(1)} kg
              </div>
              <div className="text-sm text-gray-600">Total Weight</div>
            </Card>
          </div>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Shipment Overview</CardTitle>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Shipment
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {shipments.map((shipment) => (
                  <Card key={shipment.id} className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <div className="font-semibold text-lg">{shipment.id}</div>
                        <div className="text-sm text-gray-600">{shipment.customerName}</div>
                        <div className="flex items-center gap-2 mt-2">
                          {getStatusIcon(shipment.status)}
                          <Badge className={getStatusColor(shipment.status)}>
                            {shipment.status.replace('-', ' ').toUpperCase()}
                          </Badge>
                        </div>
                      </div>

                      <div>
                        <div className="font-medium text-sm text-gray-500">Carrier & Tracking</div>
                        <div className="text-sm font-medium">{shipment.carrier}</div>
                        <div className="text-sm text-blue-600">{shipment.trackingNumber}</div>
                      </div>

                      <div>
                        <div className="font-medium text-sm text-gray-500">Route</div>
                        <div className="text-sm">From: {shipment.origin}</div>
                        <div className="text-sm">To: {shipment.destination}</div>
                      </div>

                      <div>
                        <div className="font-medium text-sm text-gray-500">Timeline</div>
                        {shipment.shipDate && (
                          <div className="text-sm">Shipped: {shipment.shipDate}</div>
                        )}
                        <div className="text-sm">Est. Delivery: {shipment.estimatedDelivery}</div>
                        {shipment.actualDelivery && (
                          <div className="text-sm text-green-600">Delivered: {shipment.actualDelivery}</div>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t">
                      <div className="font-medium text-sm text-gray-500 mb-2">Items</div>
                      <div className="space-y-1">
                        {shipment.items.map((item, index) => (
                          <div key={index} className="flex justify-between text-sm">
                            <span>{item.productName}</span>
                            <span>{item.quantity} units • {item.weight} kg</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-2 mt-4">
                      <Button variant="outline" size="sm">Track Package</Button>
                      <Button variant="outline" size="sm">View Packing List</Button>
                      <Button variant="outline" size="sm">Print Label</Button>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="packing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Automated Packing Lists</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="order-select">Select Order</Label>
                    <select className="w-full p-2 border rounded-md">
                      <option>ORD-001 - Fashion Forward Ltd</option>
                      <option>ORD-002 - Urban Style Co</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="box-type">Box Type</Label>
                    <select className="w-full p-2 border rounded-md">
                      <option>Standard Box - Medium</option>
                      <option>Heavy Duty Box - Large</option>
                      <option>Garment Box - Long</option>
                    </select>
                  </div>
                </div>
                
                <Button>Generate Packing List</Button>
                
                <Card className="p-4 bg-gray-50">
                  <h3 className="font-semibold mb-3">Sample Packing List - ORD-001</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Summer Breeze T-Shirt - Size S</span>
                      <span>100 units</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Summer Breeze T-Shirt - Size M</span>
                      <span>200 units</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Summer Breeze T-Shirt - Size L</span>
                      <span>150 units</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Summer Breeze T-Shirt - Size XL</span>
                      <span>50 units</span>
                    </div>
                    <div className="border-t pt-2 font-medium flex justify-between">
                      <span>Total Items:</span>
                      <span>500 units</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Weight:</span>
                      <span>25.5 kg</span>
                    </div>
                  </div>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documentation" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Shipping Documentation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="p-4">
                  <h3 className="font-semibold mb-3">Shipping Labels</h3>
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full justify-start">
                      📋 Generate Shipping Label
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      📄 Bulk Label Generation
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      🖨️ Print Queue Management
                    </Button>
                  </div>
                </Card>

                <Card className="p-4">
                  <h3 className="font-semibold mb-3">Freight Documentation</h3>
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full justify-start">
                      📃 Bill of Lading
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      📋 Commercial Invoice
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      🛃 Customs Documentation
                    </Button>
                  </div>
                </Card>

                <Card className="p-4">
                  <h3 className="font-semibold mb-3">Export Documents</h3>
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full justify-start">
                      📊 Export All Shipments (CSV)
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      📈 Monthly Shipping Report
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      📋 Carrier Performance Report
                    </Button>
                  </div>
                </Card>

                <Card className="p-4">
                  <h3 className="font-semibold mb-3">Integration Settings</h3>
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full justify-start">
                      🔗 Configure Carrier APIs
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      ⚙️ Shipping Preferences
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      📡 Tracking Webhooks
                    </Button>
                  </div>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tracking" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Real-time Shipment Tracking</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="flex-1">
                    <Label htmlFor="tracking-input">Enter Tracking Number</Label>
                    <Input
                      id="tracking-input"
                      placeholder="Enter tracking number..."
                      className="w-full"
                    />
                  </div>
                  <div className="flex items-end">
                    <Button>Track Package</Button>
                  </div>
                </div>

                <Card className="p-4 bg-blue-50">
                  <h3 className="font-semibold mb-4">Tracking: FF1234567890</h3>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                      <div>
                        <div className="font-medium">Package Delivered</div>
                        <div className="text-sm text-gray-600">New York, NY - Jan 14, 2024 at 2:30 PM</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                      <div>
                        <div className="font-medium">Out for Delivery</div>
                        <div className="text-sm text-gray-600">New York, NY - Jan 14, 2024 at 8:00 AM</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-4 h-4 bg-gray-400 rounded-full"></div>
                      <div>
                        <div className="font-medium">Arrived at Facility</div>
                        <div className="text-sm text-gray-600">Newark, NJ - Jan 13, 2024 at 11:45 PM</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-4 h-4 bg-gray-400 rounded-full"></div>
                      <div>
                        <div className="font-medium">In Transit</div>
                        <div className="text-sm text-gray-600">Chicago, IL - Jan 12, 2024 at 6:20 AM</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-4 h-4 bg-gray-400 rounded-full"></div>
                      <div>
                        <div className="font-medium">Package Shipped</div>
                        <div className="text-sm text-gray-600">Mumbai, India - Jan 10, 2024 at 3:15 PM</div>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ShippingModule;
