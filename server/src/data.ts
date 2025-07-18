import { Order } from './types';

export let orders: Order[] = [
  {
    id: 'ord_001',
    customerName: 'Global Fashion Inc.',
    orderNumber: 'PO-2024-001',
    productType: 'Denim Jeans',
    quantity: 1200,
    deadline: '2025-09-15T00:00:00.000Z',
    status: 'in-progress',
    priority: 'high',
    assignedTo: 'Jane Doe',
    createdAt: '2025-07-01T10:00:00.000Z',
    updatedAt: '2025-07-03T14:30:00.000Z',
    totalValue: 48000
  },
  {
    id: 'ord_002',
    customerName: 'Urban Outfitters',
    orderNumber: 'PO-2024-002',
    productType: 'Cotton T-Shirts',
    quantity: 5000,
    deadline: '2025-08-20T00:00:00.000Z',
    status: 'pending',
    priority: 'medium',
    assignedTo: 'John Smith',
    createdAt: '2025-07-02T11:00:00.000Z',
    updatedAt: '2025-07-02T11:00:00.000Z',
    totalValue: 75000
  },
  {
    id: 'ord_003',
    customerName: 'Boutique Apparel',
    orderNumber: 'PO-2024-003',
    productType: 'Silk Blouses',
    quantity: 300,
    deadline: '2025-10-01T00:00:00.000Z',
    status: 'sampling',
    priority: 'low',
    assignedTo: 'Emily White',
    createdAt: '2025-07-04T09:00:00.000Z',
    updatedAt: '2025-07-04T09:00:00.000Z',
    totalValue: 15000
  }
];
