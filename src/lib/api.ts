// API configuration for offline Electron app
const API_URL = 'http://localhost:8080/graphql';

export async function graphqlRequest(query: string, variables: Record<string, any> = {}) {
  console.log("Sending GraphQL request:", { url: API_URL, query, variables });
  
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query, variables }),
    });

    let json;
    try {
      json = await response.clone().json();
    } catch (e) {
      json = null;
    }

    if (!response.ok) {
      console.error('[DEBUG] GraphQL network error:', response.status, response.statusText, json);
      throw new Error(`Network error: ${response.status} ${response.statusText}`);
    }

    if (json && json.errors) {
      console.error('[DEBUG] GraphQL errors:', json.errors);
      throw new Error(json.errors.map((e: any) => e.message).join('\n'));
    }

    return json.data;
  } catch (error) {
    console.error('[DEBUG] GraphQL request failed:', error);
    throw new Error(`Failed to connect to backend: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Health check function
export async function checkBackendHealth() {
  try {
    const response = await fetch('http://localhost:8080/health');
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Backend health check passed:', data);
      return true;
    } else {
      console.error('❌ Backend health check failed:', response.status);
      return false;
    }
  } catch (error) {
    console.error('❌ Backend health check error:', error);
    return false;
  }
}

export async function getOrders() {
  return (await graphqlRequest(
    `query { orders { id status createdAt updatedAt product { id name sku } } }`
  )).orders;
}

export async function getProducts() {
  return (await graphqlRequest(
    `query { products { id name sku category season designer status developmentStage actualHours priority createdAt updatedAt } }`
  )).products;
}

export async function getCostingSheets() {
  return (await graphqlRequest(
    `query {
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
        createdAt
        updatedAt
      }
    }`
  )).costingSheets;
}

export async function getProductionPlans() {
  return (await graphqlRequest(
    `query { productionPlans { id productName quantity startDate endDate status progress assignedWorkers estimatedHours actualHours priority } }`
  )).productionPlans;
}

export async function getResources() {
  return (await graphqlRequest(
    `query { resources { id name type capacity allocated available efficiency } }`
  )).resources;
}

export async function getInventoryHistory(itemId: string) {
  return (await graphqlRequest(
    `query ($itemId: ID!) { inventoryHistory(itemId: $itemId) { id itemId action quantityChange previousStock newStock note user createdAt } }`,
    { itemId }
  )).inventoryHistory;
}

export async function getInventoryItems() {
  return (await graphqlRequest(
    `query { inventoryItems { id name category currentStock minStock maxStock unit unitCost totalValue location lastUpdated createdAt supplier } }`
  )).inventoryItems;
}