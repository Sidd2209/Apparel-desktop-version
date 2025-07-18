// In server/src/graphql/schema.ts

// We export the raw schema string directly.
// This is the standard way to provide type definitions.
export const typeDefs = `
  # Enums
  enum ProductStatus { CONCEPT, DESIGN, SAMPLING, APPROVED, PRODUCTION_READY, DISCONTINUED }
  enum DevelopmentStage { IDEATION, INITIAL_DESIGN, TECH_PACK, PROTO_SAMPLE, FIT_SAMPLE, FINAL_APPROVAL }
  enum OrderStatus { PENDING, PROCESSING, SHIPPED, DELIVERED, CANCELLED }
  enum Priority { LOW, MEDIUM, HIGH, URGENT }
  enum SampleStatus { REQUESTED, IN_PROGRESS, READY_REVIEW, REVISION_NEEDED, APPROVED }
  enum VendorStatus { ACTIVE, INACTIVE, PENDING_APPROVAL, PREFERRED }
  enum POStatus { PENDING, APPROVED, SHIPPED, DELIVERED, CANCELLED }
  enum ProductionPlanStatus { PLANNED, IN_PROGRESS, COMPLETED, DELAYED }
  enum ResourceType { MACHINE, WORKER, MATERIAL }
  enum InventoryCategory { RAW_MATERIALS, WIP, FINISHED_GOODS }
  enum Currency { USD, EUR, GBP, INR, CNY }
  enum OverheadType { FIXED, PERCENTAGE }

  # Product & Order Types
  type Product {
    id: ID!
    name: String!
    sku: String
    category: String
    season: String
    designer: String
    status: ProductStatus!
    developmentStage: DevelopmentStage!
    samples: [Sample!]!
    designFiles: [DesignFile!]!
    actualHours: Float
    priority: Priority!
    createdAt: String!
    updatedAt: String
  }

  type Sample {
    id: ID!
    productId: ID!
    type: String!
    status: SampleStatus!
    notes: String
    version: Int
    feedback: String
    approvedBy: String
    createdAt: String!
  }

  type DesignFile {
    id: ID!
    productId: ID!
    fileName: String!
    fileType: String
    url: String
    version: Int
    isLatest: Boolean
    uploadedBy: String
    uploadedAt: String!
  }

  type Order {
    id: ID!
    orderNumber: String!
    product: Product!
    quantity: Int!
    status: OrderStatus!
    totalValue: Float!
    customerName: String!
    productType: String!
    assignedTo: String!
    validDate: String!
    createdAt: String!
    updatedAt: String
  }

  type ProductionPlan {
    id: ID!
    productName: String!
    quantity: Int!
    startDate: String!
    endDate: String!
    status: ProductionPlanStatus!
    progress: Int!
    assignedWorkers: Int!
    estimatedHours: Int!
    actualHours: Int!
    priority: Priority!
  }

  type Resource {
    id: ID!
    name: String!
    type: ResourceType!
    capacity: Int!
    allocated: Int!
    available: Int!
    efficiency: Int!
  }

  type InventoryItem {
    id: ID!
    name: String!
    category: InventoryCategory!
    currentStock: Int!
    minStock: Int!
    maxStock: Int!
    unit: String!
    unitCost: Float!
    location: String!
    supplier: String
    totalValue: Float!
    lastUpdated: String!
  }

  type InventoryHistory {
    id: ID!
    itemId: ID!
    action: String!
    quantityChange: Int!
    previousStock: Int!
    newStock: Int!
    note: String
    createdAt: String!
    user: String
  }
  type InventoryReorder {
    id: ID!
    itemId: ID!
    quantity: Int!
    supplier: String
    status: String!
    note: String
    createdAt: String!
    user: String
  }

  # Sourcing Types
  type Vendor {
    id: ID!
    name: String!
    contactPerson: String
    email: String!
    rating: Float!
    onTimeDeliveryPercentage: Float!
    totalOrders: Int!
    activeOrders: Int!
    status: VendorStatus!
  }

  type OrderItem {
    name: String!
    quantity: Int!
    unitPrice: Float!
  }

  type PurchaseOrder {
    id: ID!
    poNumber: String!
    vendor: Vendor!
    items: [OrderItem!]!
    totalAmount: Float!
    status: POStatus!
    orderDate: String!
    expectedDeliveryDate: String!
    actualDeliveryDate: String
    createdAt: String!
  }

  type SourcingPerformance {
    averageDeliveryTimeDays: Float!
    onTimeDeliveryRate: Float!
    totalActiveVendors: Int!
    activePurchaseOrders: Int!
    topPerformingVendors: [Vendor!]!
    totalSpend: Float!
  }

  # Costing Types
  type MaterialCost {
    id: ID!
    name: String!
    supplier: String
    quantity: Float!
    unit: String!
    unitCost: Float!
    currency: Currency!
    total: Float
  }

  type LaborCost {
    id: ID!
    operation: String!
    timeMinutes: Float!
    ratePerHour: Float!
    currency: Currency!
    total: Float
  }

  type OverheadCost {
    id: ID!
    category: String!
    amount: Float!
    currency: Currency!
    type: OverheadType!
  }

  type CostBreakdown {
    materials: [MaterialCost!]!
    labor: [LaborCost!]!
    overheads: [OverheadCost!]!
  }

  type TaxConfiguration {
    vatRate: Float!
    customsDuty: Float!
    otherTaxes: Float!
  }

  type CostingSheet {
    id: ID!
    name: String!
    costBreakdown: CostBreakdown!
    taxConfig: TaxConfiguration!
    profitMargin: Float!
    selectedCurrency: Currency!
    createdAt: String!
    updatedAt: String!
  }

  type User {
    id: ID!
    googleId: String!
    email: String!
    name: String!
    department: String
    preferredHomepage: String
    token: String
  }

  # Input Types
  input ProductInput { name: String!, sku: String, category: String, season: String, designer: String, status: ProductStatus, developmentStage: DevelopmentStage, priority: Priority! }
  input OrderInput { productId: ID!, quantity: Int!, status: OrderStatus, totalValue: Float!, customerName: String!, productType: String!, assignedTo: String!, validDate: String! }

  input CostBreakdownInput { materials: [MaterialCostInput!]!, labor: [LaborCostInput!]!, overheads: [OverheadCostInput!]! }
  input MaterialCostInput { name: String!, quantity: Float!, unit: String!, unitCost: Float!, currency: Currency! }
  input LaborCostInput { operation: String!, timeMinutes: Float!, ratePerHour: Float!, currency: Currency! }
  input OverheadCostInput { category: String!, amount: Float!, currency: Currency!, type: OverheadType! }
  input TaxConfigurationInput { vatRate: Float!, customsDuty: Float!, otherTaxes: Float! }
  input VendorInput { name: String!, contactPerson: String, email: String! }
  input PurchaseOrderInput { vendorId: ID!, items: [OrderItemInput!]!, status: POStatus }
  input OrderItemInput { name: String!, quantity: Int!, unitPrice: Float! }
  input ProductionPlanInput {
    productName: String!
    quantity: Int!
    startDate: String!
    endDate: String!
    status: ProductionPlanStatus!
    priority: Priority!
    assignedWorkers: Int!
    estimatedHours: Int!
  }
  input ResourceInput {
    name: String!
    type: ResourceType!
    capacity: Int!
    efficiency: Int!
  }
  input CreateInventoryItemInput {
    name: String!
    category: InventoryCategory!
    currentStock: Int!
    minStock: Int!
    maxStock: Int!
    unit: String!
    unitCost: Float!
    location: String!
    supplier: String
  }
  input UpdateInventoryItemInput {
    name: String
    category: InventoryCategory
    currentStock: Int
    minStock: Int
    maxStock: Int
    unit: String
    unitCost: Float
    location: String
    supplier: String
  }
  input MaterialCostInput {
    name: String!
    supplier: String
    quantity: Float!
    unit: String!
    unitCost: Float!
    currency: Currency!
  }

  input LaborCostInput {
    operation: String!
    timeMinutes: Float!
    ratePerHour: Float!
    currency: Currency!
  }

  input OverheadCostInput {
    category: String!
    amount: Float!
    currency: Currency!
    type: OverheadType!
  }

  input CostBreakdownInput {
    materials: [MaterialCostInput!]!
    labor: [LaborCostInput!]!
    overheads: [OverheadCostInput!]!
  }

  input TaxConfigurationInput {
    vatRate: Float!
    customsDuty: Float!
    otherTaxes: Float!
  }

  input SaveCostingSheetInput {
    name: String!
    costBreakdown: CostBreakdownInput!
    taxConfig: TaxConfigurationInput!
    profitMargin: Float!
    selectedCurrency: Currency!
  }

  input UpdateUserInput {
    googleId: String!
    email: String!
    name: String!
    department: String!
  }

  input CreateInventoryReorderInput {
    itemId: ID!
    quantity: Int!
    supplier: String
    note: String
    user: String
  }

  input UserInput {
    email: String!
    name: String!
    department: String
    preferredHomepage: String
  }

  # Queries
  type Query {
    products: [Product!]!
    product(id: ID!): Product
    orders(status: OrderStatus, priority: Priority): [Order!]!
    order(id: ID!): Order
    vendors: [Vendor!]!
    purchaseOrders: [PurchaseOrder!]!
    sourcingPerformance: SourcingPerformance!
    productionPlans: [ProductionPlan!]!
    productionPlan(id: ID!): ProductionPlan
    resources: [Resource!]!
    inventoryItems: [InventoryItem!]!
    inventoryItem(id: ID!): InventoryItem
    costingSheets: [CostingSheet!]!
    costingSheet(id: ID!): CostingSheet
    me: User
    user(googleId: String!): User
    users: [User!]
    userByToken(idToken: String!): User
    inventoryHistory(itemId: ID!): [InventoryHistory!]!
    inventoryReorders(itemId: ID!): [InventoryReorder!]!
  }

  # Mutations
  type Mutation {
    createUser(input: UserInput!): User!
    updateUser(id: ID!, input: UserInput!): User!
    deleteUser(id: ID!): User!
    createProduct(input: ProductInput!): Product!
    updateProduct(id: ID!, input: ProductInput!): Product!
    deleteProduct(id: ID!): Product!
    createOrder(input: OrderInput!): Order!
    updateOrder(id: ID!, input: OrderInput!): Order!
    deleteOrder(id: ID!): Order!
    updateOrderStatus(id: ID!, status: OrderStatus!): Order!
    createVendor(input: VendorInput!): Vendor!
    createPurchaseOrder(input: PurchaseOrderInput!): PurchaseOrder!
    createProductionPlan(input: ProductionPlanInput!): ProductionPlan!
    updateProductionPlan(id: ID!, input: ProductionPlanInput!): ProductionPlan!
    deleteProductionPlan(id: ID!): ProductionPlan!
    createResource(input: ResourceInput!): Resource!
    updateResource(id: ID!, input: ResourceInput!): Resource!
    deleteResource(id: ID!): Resource!
    createInventoryItem(input: CreateInventoryItemInput!): InventoryItem!
    updateInventoryItem(id: ID!, input: UpdateInventoryItemInput!): InventoryItem
    deleteInventoryItem(id: ID!): InventoryItem
    saveCostingSheet(id: ID, input: SaveCostingSheetInput!): CostingSheet!
    deleteCostingSheet(id: ID!): CostingSheet!
    updateUserProfile(input: UpdateUserInput!): User
    createInventoryReorder(input: CreateInventoryReorderInput!): InventoryReorder!
  }
`;