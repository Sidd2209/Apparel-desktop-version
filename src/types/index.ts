// src/types/index.ts
export * from './enums';
import { DevelopmentStage, ProductStatus, SampleStatus } from '../types/enums';
// Core types for the Apparel Merchandising Software
export interface User {
  id: string;
  name: string;
  email: string;
  department?: Department;
  preferredHomepage?: string;
  role?: Role;
  avatar?: string;
  token?: string;
}

export type Department = 'merchandising' | 'logistics' | 'procurement' | 'sampling' | 'management';

export type Role = 'admin' | 'manager' | 'coordinator' | 'associate';

export interface Product {
  id: string;
  name: string;
  sku?: string;
  category?: string;
  season?: string;
  designer?: string;
  status: ProductStatus;
  developmentStage: DevelopmentStage;
  samples: Array<{
    id: string;
    type: string;
    status: string;
    notes?: string;
    createdAt: string;
  }>;
  designFiles: string[];
  createdAt: string;
  updatedAt?: string;
}
// Add these to your existing types
export type OrderStatus = 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface Order {
  id: string;
  orderNumber: string;
  productId: string;
  product?: Product;
  quantity: number;
  status: OrderStatus;
  priority: Priority;
  totalValue: number;
  customerName: string;
  productType: string;
  assignedTo: string;
  deadline: string;
  createdAt: string;
  updatedAt?: string;
}








export interface Sample {
  id: string;
  type: string;
  status: string;
  notes?: string;
  createdAt: string;
  version?: number;
  productId?: string;
  feedback?: string;
  approvedBy?: string;
}


export interface DesignFile {
  id: string;
  fileName: string;
  fileType: string;
  version: number;
  uploadedBy: string;
  uploadedAt: string;
  isLatest: boolean;
  url?: string;
}