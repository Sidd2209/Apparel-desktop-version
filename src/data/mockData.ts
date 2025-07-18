
import { Order, Product, KPI, Notification, Department } from '@/types';

export const mockOrders: Order[] = [
  {
    id: '1',
    customerName: 'Fashion Forward Inc.',
    orderNumber: 'FF-2024-001',
    productType: 'Cotton T-Shirts',
    quantity: 5000,
    deadline: '2024-02-15',
    status: 'in-progress',
    priority: 'high',
    assignedTo: 'Sarah Chen',
    createdAt: '2024-01-10',
    updatedAt: '2024-01-20',
    totalValue: 25000,
  },
  {
    id: '2',
    customerName: 'Urban Styles Co.',
    orderNumber: 'US-2024-002',
    productType: 'Denim Jackets',
    quantity: 2500,
    deadline: '2024-03-01',
    status: 'sampling',
    priority: 'medium',
    assignedTo: 'Mike Rodriguez',
    createdAt: '2024-01-15',
    updatedAt: '2024-01-25',
    totalValue: 75000,
  },
  {
    id: '3',
    customerName: 'Trendy Boutique',
    orderNumber: 'TB-2024-003',
    productType: 'Summer Dresses',
    quantity: 1200,
    deadline: '2024-01-30',
    status: 'pending',
    priority: 'urgent',
    assignedTo: 'Emily Watson',
    createdAt: '2024-01-08',
    updatedAt: '2024-01-18',
    totalValue: 36000,
  },
];

export const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Sustainable Cotton Tee',
    sku: 'SCT-2024-001',
    category: 'Tops',
    season: 'Spring 2024',
    designer: 'Alex Morgan',
    status: 'design',
    developmentStage: 'tech-pack',
    samples: [
      {
        id: '1',
        productId: '1',
        version: 1,
        status: 'ready-review',
        feedback: 'Initial sample looks good, minor fit adjustments needed',
        createdAt: '2024-01-20',
      },
    ],
    designFiles: [
      {
        id: '1',
        productId: '1',
        fileName: 'sct-tech-pack-v2.pdf',
        fileType: 'pdf',
        version: 2,
        uploadedBy: 'Alex Morgan',
        uploadedAt: '2024-01-22',
        isLatest: true,
      },
    ],
    createdAt: '2024-01-10',
    updatedAt: '2024-01-22',
  },
  {
    id: '2',
    name: 'Premium Denim Collection',
    sku: 'PDC-2024-002',
    category: 'Bottoms',
    season: 'Fall 2024',
    designer: 'Jordan Smith',
    status: 'sampling',
    developmentStage: 'fit-sample',
    samples: [
      {
        id: '2',
        productId: '2',
        version: 2,
        status: 'approved',
        feedback: 'Fit and finish approved for production',
        createdAt: '2024-01-18',
        approvedBy: 'David Kim',
      },
    ],
    designFiles: [
      {
        id: '2',
        productId: '2',
        fileName: 'pdc-design-v3.ai',
        fileType: 'ai',
        version: 3,
        uploadedBy: 'Jordan Smith',
        uploadedAt: '2024-01-21',
        isLatest: true,
      },
    ],
    createdAt: '2024-01-05',
    updatedAt: '2024-01-21',
  },
];

export const getDepartmentKPIs = (department: Department): KPI[] => {
  const baseKPIs = {
    merchandising: [
      { label: 'Active Orders', value: 23, change: 12, trend: 'up' as const, color: '#3b82f6' },
      { label: 'Orders This Month', value: 45, change: 8, trend: 'up' as const, color: '#10b981' },
      { label: 'Revenue Target', value: '87%', change: 5, trend: 'up' as const, color: '#f59e0b' },
      { label: 'Customer Satisfaction', value: '94%', change: 2, trend: 'up' as const, color: '#8b5cf6' },
    ],
    logistics: [
      { label: 'Orders Shipped', value: 156, change: 15, trend: 'up' as const, color: '#10b981' },
      { label: 'On-Time Delivery', value: '92%', change: -2, trend: 'down' as const, color: '#f59e0b' },
      { label: 'Inventory Turnover', value: '3.2x', change: 8, trend: 'up' as const, color: '#3b82f6' },
      { label: 'Shipping Cost/Unit', value: '$4.20', change: -5, trend: 'up' as const, color: '#ef4444' },
    ],
    procurement: [
      { label: 'Active Suppliers', value: 34, change: 3, trend: 'up' as const, color: '#f97316' },
      { label: 'Cost Savings', value: '$45K', change: 12, trend: 'up' as const, color: '#10b981' },
      { label: 'Quality Score', value: '96%', change: 1, trend: 'up' as const, color: '#8b5cf6' },
      { label: 'Lead Time Avg', value: '14 days', change: -8, trend: 'up' as const, color: '#3b82f6' },
    ],
    sampling: [
      { label: 'Samples In Review', value: 18, change: 5, trend: 'up' as const, color: '#8b5cf6' },
      { label: 'Approval Rate', value: '78%', change: 3, trend: 'up' as const, color: '#10b981' },
      { label: 'Avg Review Time', value: '3.2 days', change: -12, trend: 'up' as const, color: '#3b82f6' },
      { label: 'Samples This Week', value: 12, change: 8, trend: 'neutral' as const, color: '#f59e0b' },
    ],
    management: [
      { label: 'Total Revenue', value: '$2.4M', change: 18, trend: 'up' as const, color: '#10b981' },
      { label: 'Active Projects', value: 67, change: 12, trend: 'up' as const, color: '#3b82f6' },
      { label: 'Team Efficiency', value: '89%', change: 7, trend: 'up' as const, color: '#8b5cf6' },
      { label: 'Profit Margin', value: '24%', change: 3, trend: 'up' as const, color: '#f59e0b' },
    ],
  };

  return baseKPIs[department];
};

export const getDepartmentNotifications = (department: Department): Notification[] => {
  const baseNotifications = {
    merchandising: [
      {
        id: '1',
        title: 'Urgent Order Update',
        message: 'Order TB-2024-003 deadline approaching in 2 days',
        type: 'warning' as const,
        department: 'merchandising' as const,
        isRead: false,
        createdAt: '2024-01-28',
      },
      {
        id: '2',
        title: 'New Order Received',
        message: 'Fashion Forward Inc. placed a new order for 5000 units',
        type: 'info' as const,
        department: 'merchandising' as const,
        isRead: true,
        createdAt: '2024-01-27',
      },
    ],
    logistics: [
      {
        id: '3',
        title: 'Shipment Delayed',
        message: 'Order FF-2024-001 shipment delayed by 2 days due to weather',
        type: 'warning' as const,
        department: 'logistics' as const,
        isRead: false,
        createdAt: '2024-01-28',
      },
    ],
    procurement: [
      {
        id: '4',
        title: 'Supplier Quote Received',
        message: 'New competitive quote from Textile Solutions Inc.',
        type: 'info' as const,
        department: 'procurement' as const,
        isRead: false,
        createdAt: '2024-01-28',
      },
    ],
    sampling: [
      {
        id: '5',
        title: 'Sample Ready for Review',
        message: 'Premium Denim Collection sample v2 ready for approval',
        type: 'success' as const,
        department: 'sampling' as const,
        isRead: false,
        createdAt: '2024-01-28',
      },
    ],
    management: [
      {
        id: '6',
        title: 'Monthly Report Available',
        message: 'January performance report is ready for review',
        type: 'info' as const,
        department: 'management' as const,
        isRead: true,
        createdAt: '2024-01-28',
      },
    ],
  };

  return baseNotifications[department] || [];
};
