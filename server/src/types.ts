export type OrderStatus = 'pending' | 'in-progress' | 'sampling' | 'approved' | 'production' | 'shipped' | 'delivered' | 'cancelled';

export type Priority = 'high' | 'medium' | 'low';

export interface Order {
  id: string;
  customerName: string;
  orderNumber: string;
  productType: string;
  quantity: number;
  deadline: string;
  status: OrderStatus;
  priority: Priority;
  assignedTo: string;
  createdAt: string;
  updatedAt: string;
  totalValue: number;
}
