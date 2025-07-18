// Type definitions aligned with the frontend `src/types/index.ts`

export type ProductStatus = 
  | 'CONCEPT'
  | 'DESIGN'
  | 'SAMPLING'
  | 'APPROVED'
  | 'PRODUCTION_READY'
  | 'DISCONTINUED';

export type DevelopmentStage = 
  | 'IDEATION'
  | 'INITIAL_DESIGN'
  | 'TECH_PACK'
  | 'PROTO_SAMPLE'
  | 'FIT_SAMPLE'
  | 'FINAL_APPROVAL';

export type SampleStatus = 
  | 'REQUESTED'
  | 'IN_PRODUCTION'
  | 'READY_REVIEW'
  | 'APPROVED'
  | 'REJECTED'
  | 'REVISION_NEEDED';

export type Department = 'merchandising' | 'logistics' | 'procurement' | 'sampling' | 'management';

export type Role = 'admin' | 'manager' | 'coordinator' | 'associate';

export interface User {
  id: string;
  name: string;
  email: string;
  department: Department;
  role: Role;
  avatar?: string;
}

export interface Sample {
  id: string;
  productId: string;
  version: number;
  status: SampleStatus;
  feedback: string;
  createdAt: string;
  approvedBy?: string;
}

export interface DesignFile {
  id: string;
  productId: string;
  fileName: string;
  fileType: string;
  version: number;
  uploadedBy: string;
  uploadedAt: string;
  isLatest: boolean;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  season: string;
  designer: string;
  status: ProductStatus;
  developmentStage: DevelopmentStage;
  samples: Sample[];
  designFiles: DesignFile[];
  createdAt: string;
  updatedAt: string;
}
