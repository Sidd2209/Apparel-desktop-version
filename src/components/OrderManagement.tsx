import React, { useState, useEffect } from 'react';
import { gql, useMutation } from '@apollo/client';
import { getOrders, getProducts } from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Loader2, PlusCircle, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Combobox } from "@/components/ui/Combobox";
import { useNavigate } from 'react-router-dom';

// GraphQL query to fetch all orders and their associated product details
const GET_ORDERS = gql`
  query GetOrders {
    orders {
      id
      orderNumber
      quantity
      status
      totalValue
      customerName
      productType
      assignedTo
      validDate
      createdAt
      product {
        id
        name
      }
    }
  }
`;

const GET_PRODUCTS = gql`
  query GetProducts {
    products {
      id
      name
    }
  }
`;

const CREATE_ORDER = gql`
  mutation CreateOrder($input: OrderInput!) {
    createOrder(input: $input) {
      id
      status
    }
  }
`;

const DELETE_ORDER = gql`
  mutation DeleteOrder($id: ID!) {
    deleteOrder(id: $id) {
      id
      orderNumber
    }
  }
`;

// TypeScript interfaces for type safety
interface Product {
  id: string;
  name: string;
}

interface Order {
  id: string;
  orderNumber: string;
  quantity: number;
  status: string;
  totalValue: number;
  customerName: string;
  productType: string;
  assignedTo: string;
  validDate: string;
  createdAt: string;
  product: {
    id: string;
    name: string;
  };
}



const OrderManagement: React.FC = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetchOrders = () => {
    setLoading(true);
    Promise.all([getOrders(), getProducts()])
      .then(([ordersData, productsData]) => {
        setOrders(ordersData);
        setProducts(productsData);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  };

  useEffect(() => {
    refetchOrders();
  }, []);

  const [createOrder, { loading: creatingOrder }] = useMutation(CREATE_ORDER, {
    refetchQueries: [{ query: GET_ORDERS }],
    onError: (err) => {
      // This will show a popup with the specific error from the server
      alert(`Failed to create order: ${err.message}`);
    },
  });
  const [deleteOrder, { loading: deletingOrder }] = useMutation(DELETE_ORDER, {
    refetchQueries: [{ query: GET_ORDERS }],
    onError: (err) => {
      alert(`Failed to delete order: ${err.message}`);
    },
  });
  const [isModalOpen, setIsModalOpen] = useState(false);

  // State for the new order form
  const [newOrder, setNewOrder] = useState({
    productId: '',
    quantity: '',
    totalValue: '',
    customerName: '',
    productType: '',
    assignedTo: '',
    validDate: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setNewOrder(prev => ({ ...prev, [id]: value }));
  };

  const handleProductChange = (productId: string) => {
    setNewOrder(prev => ({ ...prev, productId }));
  };

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    // Comprehensive validation
    const requiredFields: (keyof typeof newOrder)[] = ['productId', 'quantity', 'totalValue', 'customerName', 'productType', 'assignedTo', 'validDate'];
    for (const field of requiredFields) {
      if (!newOrder[field]) {
        alert(`Please fill in the '${String(field)}' field.`);
        return;
      }
    }

    try {
      await createOrder({
        variables: {
          input: {
            productId: newOrder.productId,
            quantity: parseInt(newOrder.quantity, 10),
            totalValue: parseFloat(newOrder.totalValue),
            customerName: newOrder.customerName,
            productType: newOrder.productType,
            assignedTo: newOrder.assignedTo,
            validDate: newOrder.validDate,
            status: 'PENDING',
            // priority: 'MEDIUM', // Remove priority
          },
        },
      });
      setIsModalOpen(false); // Close the modal
      setNewOrder({ 
        productId: '', 
        quantity: '', 
        totalValue: '', 
        customerName: '', 
        productType: '', 
        assignedTo: '', 
        validDate: '',
      }); // Reset form
      refetchOrders(); // Refetch orders after successful creation
    } catch (err) {
      // This catch block is useful for network errors, but the onError handler above is better for GraphQL errors.
      console.error("A network or other unexpected error occurred:", err);
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (window.confirm('Are you sure you want to delete this order?')) {
      try {
        await deleteOrder({
          variables: { id: orderId },
        });
        refetchOrders(); // Refetch orders after successful deletion
      } catch (err) {
        console.error("Failed to delete order:", err);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="animate-spin mr-2" /> Loading Orders...
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error Loading Orders</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  console.log('Orders data:', orders);

  return (
    <>
      <div className="grid grid-cols-4 md:grid-cols-10 gap-8 items-end mb-6">
        <h1 className="text-2xl font-bold col-span-2 md:col-span-6 justify-end">Order Management</h1>
        <div className="col-span-4 md:col-span-2 justify-self-end justify-self-end">
          <Button
            onClick={() => setIsModalOpen(true)}
            className="h-8 px-6 text-lg">
            <PlusCircle className="mr-2 h-8 w-5" />
            Add New Order
          </Button>
        </div>
      </div>
      <Card className="w-full">
        <CardHeader>
          <CardTitle>All Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order Number</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.length > 0 ? (
                orders.map((order) => {
                  if (order.product && !order.product.name) {
                    // Log the product object if name is missing
                    // eslint-disable-next-line no-console
                    console.log('Order product with missing name:', order.product);
                  }
                  return (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.orderNumber}</TableCell>
                      <TableCell>
                        {order.product ? (
                          order.product.name ? (
                            <div>{order.product.name}</div>
                          ) : (
                            <div>
                              <span className="text-gray-400">No Name</span>
                              <pre className="text-xs text-gray-500 bg-gray-100 p-1 rounded mt-1">{JSON.stringify(order.product, null, 2)}</pre>
                            </div>
                          )
                        ) : (
                          <div className="text-red-600 text-sm">
                            Unknown Product
                            <br />
                            <span className="text-xs text-gray-500">ID: {order.productId}</span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>{order.quantity}</TableCell>
                      <TableCell>
                        {order.validDate ? 
                          (() => {
                            try {
                              const date = new Date(order.validDate);
                              return isNaN(date.getTime()) ? 'Invalid Date' : date.toLocaleDateString();
                            } catch {
                              return 'Invalid Date';
                            }
                          })() 
                          : 'No Date'
                        }
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteOrder(order.id)}
                          disabled={deletingOrder}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={10} className="text-center">No orders found.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create New Order</DialogTitle>
            <DialogDescription>Fill in the details for the new order.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateOrder}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-10">
                <Label htmlFor="product" className="text-right">Product</Label>
                <div className="col-span-3">
                  <Combobox
                    options={products.map((product: Product) => ({
                      label: product.name,
                      value: product.id,
                    }))}
                    value={newOrder.productId}
                    onChange={handleProductChange}
                    placeholder="Select a product..."
                    searchPlaceholder="Search products..."
                    emptyPlaceholder="No product found."
                  />
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-10">
                <Label htmlFor="quantity" className="text-right">
                  Quantity
                </Label>
                <Input
                  id="quantity"
                  type="number"
                  value={newOrder.quantity}
                  onChange={handleInputChange}
                  className="col-span-3"
                  placeholder="e.g., 100"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="totalValue" className="text-right">Total Value</Label>
                <Input id="totalValue" type="number" value={newOrder.totalValue} onChange={handleInputChange} className="col-span-3" placeholder="e.g., 2500.00" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="customerName" className="text-right">Customer</Label>
                <Input id="customerName" value={newOrder.customerName} onChange={handleInputChange} className="col-span-3" placeholder="e.g., 'John Doe'" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="productType" className="text-right">Product Type</Label>
                <Input id="productType" value={newOrder.productType} onChange={handleInputChange} className="col-span-3" placeholder="e.g., 'Apparel'" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="assignedTo" className="text-right">Assigned To</Label>
                <Input id="assignedTo" value={newOrder.assignedTo} onChange={handleInputChange} className="col-span-3" placeholder="e.g., 'Jane Smith'" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="validDate" className="text-right">Valid Date</Label>
                <Input 
                  id="validDate" 
                  type="date" 
                  value={newOrder.validDate} 
                  onChange={handleInputChange} 
                  className="col-span-3" 
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={creatingOrder}>
                {creatingOrder ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating...</>
                ) : (
                  'Create Order'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default OrderManagement;