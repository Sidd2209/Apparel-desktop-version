import { Router, Request, Response } from 'express';
import { orders } from '../data';
import { Order } from '../types';

const router = Router();

// GET /api/v1/orders - Retrieve all orders
router.get('/', (req: Request, res: Response) => {
  // In a real app, you'd handle filtering, sorting, and pagination here
  res.json(orders);
});

// POST /api/v1/orders - Create a new order
router.post('/', (req: Request, res: Response) => {
  const newOrderData = req.body;

  const newOrder: Order = {
    id: `ord_${new Date().getTime()}`, // Simple unique ID generation
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...newOrderData,
  };

  orders.push(newOrder);
  res.status(201).json(newOrder);
});

// GET /api/v1/orders/:id - Retrieve a single order by ID
router.get('/:id', (req: Request, res: Response) => {
  const order = orders.find(o => o.id === req.params.id);
  if (order) {
    res.json(order);
  } else {
    res.status(404).send('Order not found');
  }
});

// PATCH /api/v1/orders/:id - Update an existing order
router.patch('/:id', (req: Request, res: Response) => {
  const index = orders.findIndex(o => o.id === req.params.id);
  if (index !== -1) {
    const originalOrder = orders[index];
    const updatedOrder = {
      ...originalOrder,
      ...req.body,
      updatedAt: new Date().toISOString(),
    };
    orders[index] = updatedOrder;
    res.json(updatedOrder);
  } else {
    res.status(404).send('Order not found');
  }
});

// DELETE /api/v1/orders/:id - Delete an order
router.delete('/:id', (req: Request, res: Response) => {
  const index = orders.findIndex(o => o.id === req.params.id);
  if (index !== -1) {
    // In a real database, you would delete the record.
    // Here, we'll just remove it from the array.
    orders.splice(index, 1);
    res.status(204).send(); // No Content
  } else {
    res.status(404).send('Order not found');
  }
});

export default router;
