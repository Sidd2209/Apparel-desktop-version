import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function initializeDatabase() {
  console.log('🔧 Initializing database...');
  
  try {
    // Create sample users
    const user1 = await prisma.user.upsert({
      where: { email: 'admin@apparelflow.com' },
      update: {},
      create: {
        email: 'admin@apparelflow.com',
        name: 'Admin User',
        department: 'Management',
        preferredHomepage: 'orders'
      }
    });

    const user2 = await prisma.user.upsert({
      where: { email: 'designer@apparelflow.com' },
      update: {},
      create: {
        email: 'designer@apparelflow.com',
        name: 'Design Team',
        department: 'Design',
        preferredHomepage: 'product-dev'
      }
    });

    console.log('✅ Users created:', user1.name, user2.name);

    // Create sample products
    const product1 = await prisma.product.upsert({
      where: { sku: 'PROD-001' },
      update: {},
      create: {
        name: 'Classic T-Shirt',
        sku: 'PROD-001',
        category: 'T-Shirts',
        season: 'Spring/Summer',
        designer: 'Design Team',
        status: 'In Development',
        developmentStage: 'Design Review',
        actualHours: 8.5,
        priority: 'High'
      }
    });

    const product2 = await prisma.product.upsert({
      where: { sku: 'PROD-002' },
      update: {},
      create: {
        name: 'Denim Jeans',
        sku: 'PROD-002',
        category: 'Bottoms',
        season: 'All Season',
        designer: 'Design Team',
        status: 'Production Ready',
        developmentStage: 'Finalized',
        actualHours: 12.0,
        priority: 'Medium'
      }
    });

    console.log('✅ Products created:', product1.name, product2.name);

    // Create sample orders
    const order1 = await prisma.order.upsert({
      where: { orderNumber: 'ORD-001' },
      update: {},
      create: {
        orderNumber: 'ORD-001',
        productId: product1.id,
        quantity: 100,
        status: 'Pending',
        totalValue: 2500.00,
        customerName: 'Fashion Retail Co.',
        productType: 'T-Shirts',
        assignedTo: 'Production Team',
        validDate: new Date('2024-12-31')
      }
    });

    const order2 = await prisma.order.upsert({
      where: { orderNumber: 'ORD-002' },
      update: {},
      create: {
        orderNumber: 'ORD-002',
        productId: product2.id,
        quantity: 50,
        status: 'In Production',
        totalValue: 3500.00,
        customerName: 'Urban Style Inc.',
        productType: 'Jeans',
        assignedTo: 'Production Team',
        validDate: new Date('2024-11-30')
      }
    });

    console.log('✅ Orders created:', order1.orderNumber, order2.orderNumber);

    // Create sample inventory items
    const inventory1 = await prisma.inventoryItem.create({
      data: {
        name: 'Cotton Fabric',
        category: 'Raw Materials',
        currentStock: 500,
        minStock: 100,
        maxStock: 1000,
        unit: 'meters',
        unitCost: 5.50,
        totalValue: 2750.00,
        location: 'Warehouse A',
        supplier: 'Textile Corp'
      }
    });

    const inventory2 = await prisma.inventoryItem.create({
      data: {
        name: 'Denim Fabric',
        category: 'Raw Materials',
        currentStock: 300,
        minStock: 50,
        maxStock: 800,
        unit: 'meters',
        unitCost: 8.00,
        totalValue: 2400.00,
        location: 'Warehouse B',
        supplier: 'Denim Supply Co'
      }
    });

    console.log('✅ Inventory items created:', inventory1.name, inventory2.name);

    // Create sample costing sheet
    const costingSheet = await prisma.costingSheet.create({
      data: {
        name: 'Standard T-Shirt Costing',
        profitMargin: 25.0,
        selectedCurrency: 'USD',
        costBreakdown: JSON.stringify({
          materials: [
            {
              id: 'mat-1',
              name: 'Cotton Fabric',
              quantity: 2.5,
              unit: 'meters',
              unitCost: 5.50,
              currency: 'USD',
              total: 13.75
            }
          ],
          labor: [
            {
              id: 'lab-1',
              operation: 'Cutting',
              timeMinutes: 15,
              ratePerHour: 12.00,
              currency: 'USD',
              total: 3.00
            },
            {
              id: 'lab-2',
              operation: 'Sewing',
              timeMinutes: 30,
              ratePerHour: 15.00,
              currency: 'USD',
              total: 7.50
            }
          ],
          overheads: [
            {
              id: 'ovh-1',
              category: 'Factory Overhead',
              amount: 5.00,
              currency: 'USD',
              type: 'Fixed'
            }
          ]
        }),
        taxConfig: JSON.stringify({
          vatRate: 10.0,
          customsDuty: 5.0,
          otherTaxes: 2.0
        })
      }
    });

    console.log('✅ Costing sheet created:', costingSheet.name);

    // Create sample production plan
    const productionPlan = await prisma.productionPlan.upsert({
      where: { id: 'plan-001' },
      update: {},
      create: {
        id: 'plan-001',
        productName: 'Classic T-Shirt',
        quantity: 100,
        startDate: new Date('2024-01-15'),
        endDate: new Date('2024-01-25'),
        status: 'In Progress',
        progress: 60,
        assignedWorkers: 5,
        estimatedHours: 40,
        actualHours: 24,
        priority: 'High'
      }
    });

    console.log('✅ Production plan created:', productionPlan.productName);

    // Create sample resources
    const resource1 = await prisma.resource.create({
      data: {
        name: 'Sewing Machine 1',
        type: 'Equipment',
        capacity: 8,
        allocated: 6,
        available: 2,
        efficiency: 85
      }
    });

    const resource2 = await prisma.resource.create({
      data: {
        name: 'Cutting Table A',
        type: 'Equipment',
        capacity: 10,
        allocated: 8,
        available: 2,
        efficiency: 90
      }
    });

    console.log('✅ Resources created:', resource1.name, resource2.name);

    console.log('🎉 Database initialization completed successfully!');
    
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run initialization if this file is executed directly
if (require.main === module) {
  initializeDatabase()
    .then(() => {
      console.log('✅ Database setup complete');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Database setup failed:', error);
      process.exit(1);
    });
}

export { initializeDatabase }; 