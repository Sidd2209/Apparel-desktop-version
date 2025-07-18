import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, DollarSign, User } from 'lucide-react';
import { Order, OrderStatus, Priority } from '@/types';

interface OrderCardProps {
  order: Order;
  onViewDetails?: () => void;
  onUpdateStatus?: () => void;
  onContactCustomer?: () => void;
}

const statusColors: Record<OrderStatus, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  PROCESSING: 'bg-blue-100 text-blue-800',
  SHIPPED: 'bg-gray-100 text-gray-800',
  DELIVERED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
};

const priorityColors: Record<Priority, string> = {
  LOW: 'bg-green-100 text-green-800',
  MEDIUM: 'bg-yellow-100 text-yellow-800',
  HIGH: 'bg-orange-100 text-orange-800',
  URGENT: 'bg-red-100 text-red-800',
};

export const OrderCard = ({ 
  order, 
  onViewDetails, 
  onUpdateStatus, 
  onContactCustomer 
}: OrderCardProps) => {
  return (
    <Card className="p-4">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div>
          <div className="font-semibold text-lg">{order.orderNumber}</div>
          <div className="text-sm text-gray-600">{order.customerName}</div>
          <div className="flex gap-2 mt-2">
            <Badge className={statusColors[order.status]}>
              {order.status}
            </Badge>
            <Badge className={priorityColors[order.priority]}>
              {order.priority}
            </Badge>
          </div>
        </div>

        <div>
          <div className="font-medium text-sm text-gray-500">Product</div>
          <div className="text-sm">{order.productType}</div>
          <div className="text-sm text-gray-600">Qty: {order.quantity}</div>
        </div>

        <div>
          <div className="font-medium text-sm text-gray-500">Timeline</div>
          <div className="flex items-center gap-1 text-sm">
            <Calendar className="h-4 w-4" />
            <span>Due: {new Date(order.deadline).toLocaleDateString()}</span>
          </div>
          <div className="text-xs text-gray-500">
            Created: {new Date(order.createdAt).toLocaleDateString()}
          </div>
        </div>

        <div>
          <div className="font-medium text-sm text-gray-500">Financial</div>
          <div className="flex items-center gap-1 text-sm font-semibold">
            <DollarSign className="h-4 w-4" />
            <span>${order.totalValue.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-600">
            <User className="h-3 w-3" />
            <span>{order.assignedTo}</span>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Button variant="outline" size="sm" onClick={onViewDetails}>
            View Details
          </Button>
          <Button variant="outline" size="sm" onClick={onUpdateStatus}>
            Update Status
          </Button>
          <Button variant="outline" size="sm" onClick={onContactCustomer}>
            Contact Customer
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default OrderCard;