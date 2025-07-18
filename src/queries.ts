// src/graphql/queries.ts
import { gql } from '@apollo/client';

// Product Queries
export const GET_PRODUCTS = gql`
  query GetProducts {
    products {
      id
      name
      sku
      category
      status
      developmentStage
      createdAt
    }
  }
`;

export const GET_PRODUCT = gql`
  query GetProduct($id: ID!) {
    product(id: $id) {
      id
      name
      sku
      category
      status
      developmentStage
      samples {
        id
        type
        status
        notes
        createdAt
      }
      designFiles
      createdAt
      updatedAt
    }
  }
`;

// Order Queries
export const GET_ORDERS = gql`
  query GetOrders($status: OrderStatus, $priority: Priority) {
    orders(status: $status, priority: $priority) {
      id
      orderNumber
      product {
        id
        name
      }
      quantity
      status
      priority
      totalValue
      customerName
      productType
      assignedTo
      deadline
      createdAt
    }
  }
`;

export const GET_ORDER = gql`
  query GetOrder($id: ID!) {
    order(id: $id) {
      id
      orderNumber
      product {
        id
        name
      }
      quantity
      status
      priority
      totalValue
      customerName
      productType
      assignedTo
      deadline
      createdAt
      updatedAt
    }
  }
`;

// Mutations
export const CREATE_PRODUCT = gql`
  mutation CreateProduct($input: ProductInput!) {
    createProduct(input: $input) {
      id
      name
      status
      developmentStage
      createdAt
    }
  }
`;

export const UPDATE_PRODUCT = gql`
  mutation UpdateProduct($id: ID!, $input: ProductInput!) {
    updateProduct(id: $id, input: $input) {
      id
      name
      status
      developmentStage
      updatedAt
    }
  }
`;

export const DELETE_PRODUCT = gql`
  mutation DeleteProduct($id: ID!) {
    deleteProduct(id: $id)
  }
`;

export const CREATE_ORDER = gql`
  mutation CreateOrder($input: OrderInput!) {
    createOrder(input: $input) {
      id
      orderNumber
      status
      priority
      customerName
      createdAt
    }
  }
`;

export const UPDATE_ORDER_STATUS = gql`
  mutation UpdateOrderStatus($id: ID!, $status: OrderStatus!) {
    updateOrderStatus(id: $id, status: $status) {
      id
      status
      updatedAt
    }
  }
`;

export const DELETE_ORDER = gql`
  mutation DeleteOrder($id: ID!) {
    deleteOrder(id: $id)
  }
`;

// Sourcing Queries
export const GET_SOURCING_DATA = gql`
  query GetSourcingData {
    vendors {
      id
      name
      contactPerson
      email
      rating
      onTimeDeliveryPercentage
      totalOrders
      activeOrders
      status
    }
    purchaseOrders {
      id
      poNumber
      vendor {
        id
        name
      }
      items {
        name
        quantity
        unitPrice
      }
      totalAmount
      status
      orderDate
      expectedDeliveryDate
      actualDeliveryDate
    }
    sourcingPerformance {
      averageDeliveryTimeDays
      onTimeDeliveryRate
      totalActiveVendors
      activePurchaseOrders
      topPerformingVendors {
        id
        name
        rating
      }
    }
  }
`;

// Sourcing Mutations
export const CREATE_VENDOR = gql`
  mutation CreateVendor($input: VendorInput!) {
    createVendor(input: $input) {
      id
      name
      status
    }
  }
`;

export const CREATE_PURCHASE_ORDER = gql`
  mutation CreatePurchaseOrder($input: PurchaseOrderInput!) {
    createPurchaseOrder(input: $input) {
      id
      poNumber
      status
    }
  }
`;

// Costing Calculator Queries & Mutations
export const GET_COSTING_SHEETS = gql`
  query GetCostingSheets {
    costingSheets {
      id
      name
      profitMargin
      selectedCurrency
      costBreakdown {
        materials {
          id
          name
          quantity
          unit
          unitCost
          currency
          total
        }
        labor {
          id
          operation
          timeMinutes
          ratePerHour
          currency
          total
        }
        overheads {
          id
          category
          amount
          currency
          type
        }
      }
      taxConfig {
        vatRate
        customsDuty
        otherTaxes
      }
      updatedAt
    }
  }
`;

export const SAVE_COSTING_SHEET = gql`
  mutation SaveCostingSheet($id: ID, $input: SaveCostingSheetInput!) {
    saveCostingSheet(id: $id, input: $input) {
      id
      name
      profitMargin
      selectedCurrency
      costBreakdown {
        materials {
          id
          name
          quantity
          unit
          unitCost
          currency
          total
        }
        labor {
          id
          operation
          timeMinutes
          ratePerHour
          currency
          total
        }
        overheads {
          id
          category
          amount
          currency
          type
        }
      }
      taxConfig {
        vatRate
        customsDuty
        otherTaxes
      }
      updatedAt
    }
  }
`;

export const DELETE_COSTING_SHEET = gql`
  mutation DeleteCostingSheet($id: ID!) {
    deleteCostingSheet(id: $id) {
      id
    }
  }
`;