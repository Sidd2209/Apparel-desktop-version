import { PrismaClient } from '@prisma/client';

interface Context {
  prisma: PrismaClient;
}

// Utility functions to map database values to GraphQL enum values
const mapProductStatus = (dbValue: string): string => {
  const mapping: { [key: string]: string } = {
    'In Development': 'IN_DEVELOPMENT',
    'Production Ready': 'PRODUCTION_READY',
    'CONCEPT': 'CONCEPT',
    'DESIGN': 'DESIGN',
    'SAMPLING': 'SAMPLING',
    'APPROVED': 'APPROVED',
    'PRODUCTION_READY': 'PRODUCTION_READY',
    'DISCONTINUED': 'DISCONTINUED',
    'in-progress': 'IN_DEVELOPMENT',
    'sampling': 'SAMPLING',
    'design': 'DESIGN',
    'ready-review': 'APPROVED',
    'approved': 'APPROVED'
  };
  return mapping[dbValue] || dbValue;
};

const mapProductionPlanStatus = (dbValue: string): string => {
  const mapping: { [key: string]: string } = {
    'In Progress': 'IN_PROGRESS',
    'PLANNED': 'PLANNED',
    'COMPLETED': 'COMPLETED',
    'DELAYED': 'DELAYED',
    'In Production': 'IN_PROGRESS'
  };
  return mapping[dbValue] || dbValue;
};

const mapResourceType = (dbValue: string): string => {
  const mapping: { [key: string]: string } = {
    'Equipment': 'EQUIPMENT',
    'MACHINE': 'MACHINE',
    'WORKER': 'WORKER',
    'MATERIAL': 'MATERIAL'
  };
  return mapping[dbValue] || dbValue;
};

const mapInventoryCategory = (dbValue: string): string => {
  const mapping: { [key: string]: string } = {
    'Raw Materials': 'RAW_MATERIALS_ALT',
    'RAW_MATERIALS': 'RAW_MATERIALS',
    'WIP': 'WIP',
    'FINISHED_GOODS': 'FINISHED_GOODS'
  };
  return mapping[dbValue] || dbValue;
};

const mapOverheadType = (dbValue: string): string => {
  const mapping: { [key: string]: string } = {
    'Fixed': 'FIXED',
    'FIXED': 'FIXED',
    'PERCENTAGE': 'PERCENTAGE'
  };
  return mapping[dbValue] || dbValue;
};

const mapDevelopmentStage = (dbValue: string): string => {
  const mapping: { [key: string]: string } = {
    'Design Review': 'DESIGN_REVIEW',
    'Finalized': 'FINALIZED',
    'IDEATION': 'IDEATION',
    'INITIAL_DESIGN': 'INITIAL_DESIGN',
    'TECH_PACK': 'TECH_PACK',
    'PROTO_SAMPLE': 'PROTO_SAMPLE',
    'FIT_SAMPLE': 'FIT_SAMPLE',
    'FINAL_APPROVAL': 'FINAL_APPROVAL'
  };
  return mapping[dbValue] || dbValue;
};

const mapPriority = (dbValue: string): string => {
  const mapping: { [key: string]: string } = {
    'High': 'HIGH',
    'Medium': 'MEDIUM',
    'Low': 'LOW',
    'Urgent': 'URGENT',
    'LOW': 'LOW',
    'MEDIUM': 'MEDIUM',
    'HIGH': 'HIGH',
    'URGENT': 'URGENT'
  };
  return mapping[dbValue] || dbValue;
};

const mapOrderStatus = (dbValue: string): string => {
  const mapping: { [key: string]: string } = {
    'Pending': 'PENDING',
    'Processing': 'PROCESSING',
    'Shipped': 'SHIPPED',
    'Delivered': 'DELIVERED',
    'Cancelled': 'CANCELLED',
    'In Production': 'PROCESSING',
    'pending': 'PENDING',
    'in-progress': 'PROCESSING',
    'sampling': 'PENDING',
    'PENDING': 'PENDING',
    'PROCESSING': 'PROCESSING',
    'SHIPPED': 'SHIPPED',
    'DELIVERED': 'DELIVERED',
    'CANCELLED': 'CANCELLED'
  };
  return mapping[dbValue] || dbValue;
};

export const resolvers = {
  Query: {
    users: async (_: any, __: any, { prisma }: Context) => {
      return await prisma.user.findMany();
    },
    user: async (_: any, { id }: { id: string }, { prisma }: Context) => {
      return await prisma.user.findUnique({ where: { id } });
    },
    products: async (_: any, __: any, { prisma }: Context) => {
      return await prisma.product.findMany();
    },
    product: async (_: any, { id }: { id: string }, { prisma }: Context) => {
      return await prisma.product.findUnique({ where: { id } });
    },
    orders: async (_: any, __: any, { prisma }: Context) => {
      return await prisma.order.findMany();
    },
    order: async (_: any, { id }: { id: string }, { prisma }: Context) => {
      return await prisma.order.findUnique({ where: { id } });
    },
    costingSheets: async (_: any, __: any, { prisma }: Context) => {
      try {
        const sheets = await prisma.costingSheet.findMany();
        console.log("[DEBUG] costingSheets returned from DB:", JSON.stringify(sheets, null, 2));
        return sheets;
      } catch (err) {
        console.error("DEBUG: Error in costingSheets resolver:", err);
        throw err;
      }
    },
    costingSheet: async (_: any, { id }: { id: string }, { prisma }: Context) => {
      return await prisma.costingSheet.findUnique({ where: { id } });
    },
    productionPlans: async (_: any, __: any, { prisma }: Context) => {
      try {
        const plans = await prisma.productionPlan.findMany();
        console.log('[DEBUG] productionPlans returned from DB:', JSON.stringify(plans, null, 2));
        return plans;
      } catch (err) {
        console.error('[DEBUG] Error in productionPlans resolver:', err);
        throw err;
      }
    },
    productionPlan: async (_: any, { id }: { id: string }, { prisma }: Context) => {
      return await prisma.productionPlan.findUnique({ where: { id } });
    },
    resources: async (_: any, __: any, { prisma }: Context) => {
      return await prisma.resource.findMany();
    },
    inventoryItems: async (_: any, __: any, { prisma }: Context) => {
      return await prisma.inventoryItem.findMany();
    },
    inventoryHistory: async (_: any, { itemId }: { itemId: string }, { prisma }: Context) => {
      return await prisma.inventoryHistory.findMany({ where: { itemId } });
    },
    inventoryReorders: async (_: any, { itemId }: { itemId: string }, { prisma }: Context) => {
      return await prisma.inventoryReorder.findMany({ where: { itemId } });
    },
    // Add more queries for other models...
  },
  Mutation: {
    createUser: async (_: any, { input }: { input: any }, { prisma }: Context) => {
      return await prisma.user.create({ data: input });
    },
    updateUser: async (_: any, { id, input }: { id: string, input: any }, { prisma }: Context) => {
      return await prisma.user.update({ where: { id }, data: input });
    },
    deleteUser: async (_: any, { id }: { id: string }, { prisma }: Context) => {
      return await prisma.user.delete({ where: { id } });
    },
    createProduct: async (_: any, { input }: { input: any }, { prisma }: Context) => {
      return await prisma.product.create({ data: input });
    },
    updateProduct: async (_: any, { id, input }: { id: string, input: any }, { prisma }: Context) => {
      return await prisma.product.update({ where: { id }, data: input });
    },
    deleteProduct: async (_: any, { id }: { id: string }, { prisma }: Context) => {
      return await prisma.product.delete({ where: { id } });
    },
    createOrder: async (_: any, { input }: { input: any }, { prisma }: Context) => {
      // Generate a unique order number
      const timestamp = Date.now();
      const randomSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();
      const orderNumber = `ORD-${timestamp}-${randomSuffix}`;
      
      return await prisma.order.create({ 
        data: {
          ...input,
          orderNumber,
          validDate: new Date(input.validDate)
        } 
      });
    },
    updateOrder: async (_: any, { id, input }: { id: string, input: any }, { prisma }: Context) => {
      return await prisma.order.update({ where: { id }, data: input });
    },
    deleteOrder: async (_: any, { id }: { id: string }, { prisma }: Context) => {
      return await prisma.order.delete({ where: { id } });
    },
    saveCostingSheet: async (_: any, { id, input }: { id?: string, input: any }, { prisma }: Context) => {
      console.log("DEBUG: saveCostingSheet called with id:", id, "input.name:", input.name);
      const data = {
        name: input.name,
        profitMargin: input.profitMargin,
        selectedCurrency: input.selectedCurrency,
        costBreakdown: JSON.stringify(input.costBreakdown),
        taxConfig: JSON.stringify(input.taxConfig),
      };
      
      if (id) {
        return await prisma.costingSheet.update({ where: { id }, data });
      } else {
        return await prisma.costingSheet.create({ data });
      }
    },
    deleteCostingSheet: async (_: any, { id }: { id: string }, { prisma }: Context) => {
      return await prisma.costingSheet.delete({ where: { id } });
    },
    createResource: async (_: any, { input }: { input: any }, { prisma }: Context) => {
      return await prisma.resource.create({ data: input });
    },
    updateResource: async (_: any, { id, input }: { id: string, input: any }, { prisma }: Context) => {
      return await prisma.resource.update({ where: { id }, data: input });
    },
    deleteResource: async (_: any, { id }: { id: string }, { prisma }: Context) => {
      return await prisma.resource.delete({ where: { id } });
    },
    createProductionPlan: async (_: any, { input }: { input: any }, { prisma }: Context) => {
      // Validate and parse dates
      const startDate = input.startDate ? new Date(input.startDate) : undefined;
      const endDate = input.endDate ? new Date(input.endDate) : undefined;
      
      // Check if dates are valid
      if (!startDate || isNaN(startDate.getTime())) {
        throw new Error('Valid startDate is required');
      }
      if (!endDate || isNaN(endDate.getTime())) {
        throw new Error('Valid endDate is required');
      }
      
      return await prisma.productionPlan.create({ 
        data: {
          ...input,
          startDate,
          endDate
        } 
      });
    },
    updateProductionPlan: async (_: any, { id, input }: { id: string, input: any }, { prisma }: Context) => {
      // Create update data without dates first
      const updateData: any = { ...input };
      
      // Handle dates separately with validation
      if (input.startDate) {
        const startDate = new Date(input.startDate);
        if (isNaN(startDate.getTime())) {
          throw new Error('Invalid startDate provided');
        }
        updateData.startDate = startDate;
      }
      
      if (input.endDate) {
        const endDate = new Date(input.endDate);
        if (isNaN(endDate.getTime())) {
          throw new Error('Invalid endDate provided');
        }
        updateData.endDate = endDate;
      }
      
      // Remove date fields from input if they're not provided to avoid overwriting with null
      if (!input.startDate) delete updateData.startDate;
      if (!input.endDate) delete updateData.endDate;
      
      return await prisma.productionPlan.update({ 
        where: { id }, 
        data: updateData
      });
    },
    deleteProductionPlan: async (_: any, { id }: { id: string }, { prisma }: Context) => {
      return await prisma.productionPlan.delete({ where: { id } });
    },
    createInventoryItem: async (_: any, { input }: { input: any }, { prisma }: Context) => {
      return await prisma.inventoryItem.create({ 
        data: {
          ...input,
          totalValue: input.currentStock * input.unitCost
        } 
      });
    },
    updateInventoryItem: async (_: any, { id, input }: { id: string, input: any }, { prisma }: Context) => {
      // Get the current item to track changes
      const currentItem = await prisma.inventoryItem.findUnique({ where: { id } });
      if (!currentItem) {
        throw new Error('Inventory item not found');
      }

      const updateData: any = { ...input };
      if (input.currentStock !== undefined && input.unitCost !== undefined) {
        updateData.totalValue = input.currentStock * input.unitCost;
      }

      // Track all changes for history
      const changes: string[] = [];
      
      if (input.name !== undefined && input.name !== currentItem.name) {
        changes.push(`Name: "${currentItem.name}" → "${input.name}"`);
      }
      if (input.category !== undefined && input.category !== currentItem.category) {
        changes.push(`Category: "${currentItem.category}" → "${input.category}"`);
      }
      if (input.currentStock !== undefined && input.currentStock !== currentItem.currentStock) {
        changes.push(`Stock: ${currentItem.currentStock} → ${input.currentStock}`);
      }
      if (input.minStock !== undefined && input.minStock !== currentItem.minStock) {
        changes.push(`Min Stock: ${currentItem.minStock} → ${input.minStock}`);
      }
      if (input.maxStock !== undefined && input.maxStock !== currentItem.maxStock) {
        changes.push(`Max Stock: ${currentItem.maxStock} → ${input.maxStock}`);
      }
      if (input.unit !== undefined && input.unit !== currentItem.unit) {
        changes.push(`Unit: "${currentItem.unit}" → "${input.unit}"`);
      }
      if (input.unitCost !== undefined && input.unitCost !== currentItem.unitCost) {
        changes.push(`Unit Cost: $${currentItem.unitCost} → $${input.unitCost}`);
      }
      if (input.location !== undefined && input.location !== currentItem.location) {
        changes.push(`Location: "${currentItem.location}" → "${input.location}"`);
      }
      if (input.supplier !== undefined && input.supplier !== currentItem.supplier) {
        changes.push(`Supplier: "${currentItem.supplier || 'None'}" → "${input.supplier || 'None'}"`);
      }

      // Update the inventory item
      const updatedItem = await prisma.inventoryItem.update({ where: { id }, data: updateData });

      // Create history entry if any changes occurred
      if (changes.length > 0) {
        const action = input.currentStock !== undefined && input.currentStock !== currentItem.currentStock 
          ? (input.currentStock > currentItem.currentStock ? 'STOCK_IN' : 'STOCK_OUT')
          : 'ITEM_UPDATED';
        
        const quantityChange = input.currentStock !== undefined && input.currentStock !== currentItem.currentStock
          ? Math.abs(input.currentStock - currentItem.currentStock)
          : 0;

        await prisma.inventoryHistory.create({
          data: {
            itemId: id,
            action,
            quantityChange,
            previousStock: currentItem.currentStock,
            newStock: input.currentStock !== undefined ? input.currentStock : currentItem.currentStock,
            note: changes.join(', '),
            user: 'System'
          }
        });
      }

      return updatedItem;
    },
    deleteInventoryItem: async (_: any, { id }: { id: string }, { prisma }: Context) => {
      return await prisma.inventoryItem.delete({ where: { id } });
    },
    createInventoryReorder: async (_: any, { input }: { input: any }, { prisma }: Context) => {
      return await prisma.inventoryReorder.create({ data: input });
    },
    // Add more mutations for other models...
  },
  Product: {
    status: (parent: any) => mapProductStatus(parent.status),
    developmentStage: (parent: any) => mapDevelopmentStage(parent.developmentStage),
    priority: (parent: any) => mapPriority(parent.priority),
    samples: async (parent: any, _args: any, { prisma }: Context) => {
      return await prisma.sample.findMany({ where: { productId: parent.id } });
    },
    designFiles: async (parent: any, _args: any, { prisma }: Context) => {
      return await prisma.designFile.findMany({ where: { productId: parent.id } });
    },
  },
  Order: {
    status: (parent: any) => mapOrderStatus(parent.status),
    product: async (parent: any, _args: any, { prisma }: Context) => {
      if (!parent.productId) {
        return null;
      }
      const product = await prisma.product.findUnique({
        where: { id: parent.productId },
        select: {
          id: true,
          name: true,
          sku: true,
          category: true,
          season: true,
          designer: true,
          status: true,
          developmentStage: true,
          actualHours: true,
          priority: true,
          createdAt: true,
          updatedAt: true,
        }
      });
      console.log('Order.product resolver:', { productId: parent.productId, product });
      return product;
    },
    validDate: async (parent: any) => {
      // Ensure the date is properly formatted as an ISO string
      if (parent.validDate) {
        return new Date(parent.validDate).toISOString();
      }
      return null;
    },
  },
  CostingSheet: {
    costBreakdown: async (parent: any) => {
      try {
        const breakdown = JSON.parse(parent.costBreakdown);
        // Always recalculate totals for materials
        if (breakdown.materials) {
          breakdown.materials = breakdown.materials.map((material: any, index: number) => ({
            ...material,
            id: material.id || `temp-material-${index}`,
            total: material.quantity * material.unitCost
          }));
        }
        // Always recalculate totals for labor
        if (breakdown.labor) {
          breakdown.labor = breakdown.labor.map((labor: any, index: number) => ({
            ...labor,
            id: labor.id || `temp-labor-${index}`,
            total: (labor.timeMinutes / 60) * labor.ratePerHour
          }));
        }
        // Add IDs to overheads if they don't have them
        if (breakdown.overheads) {
          breakdown.overheads = breakdown.overheads.map((overhead: any, index: number) => ({
            ...overhead,
            id: overhead.id || `temp-overhead-${index}`
          }));
        }
        return breakdown;
      } catch {
        return { materials: [], labor: [], overheads: [] };
      }
    },
    taxConfig: async (parent: any) => {
      try {
        return JSON.parse(parent.taxConfig);
      } catch {
        return { vatRate: 0, customsDuty: 0, otherTaxes: 0 };
      }
    },
  },
  ProductionPlan: {
    status: (parent: any) => mapProductionPlanStatus(parent.status),
    priority: (parent: any) => mapPriority(parent.priority),
    startDate: (parent: any) => {
      try {
        return parent.startDate ? new Date(parent.startDate).toISOString() : null;
      } catch (error) {
        console.warn('Invalid startDate in ProductionPlan:', parent.startDate);
        return null;
      }
    },
    endDate: (parent: any) => {
      try {
        return parent.endDate ? new Date(parent.endDate).toISOString() : null;
      } catch (error) {
        console.warn('Invalid endDate in ProductionPlan:', parent.endDate);
        return null;
      }
    },
  },
  Resource: {
    type: (parent: any) => mapResourceType(parent.type),
  },
  InventoryItem: {
    category: (parent: any) => mapInventoryCategory(parent.category),
  },
  OverheadCost: {
    type: (parent: any) => mapOverheadType(parent.type),
  },
};