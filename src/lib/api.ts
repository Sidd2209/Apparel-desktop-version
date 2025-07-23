import { invoke } from '@tauri-apps/api';

declare const __TAURI__: boolean;

function isTauri() {
  return typeof window !== 'undefined' && '__TAURI__' in window;
}

const API_URL = import.meta.env.VITE_API_URL || '/graphql';

export async function graphqlRequest(query: string, variables: Record<string, any> = {}) {
  console.log("Sending GraphQL request:", { url: API_URL, query, variables });
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
    throw new Error('Network response was not ok');
  }

  if (json && json.errors) {
    console.error('[DEBUG] GraphQL errors:', json.errors);
    throw new Error(json.errors.map((e: any) => e.message).join('\n'));
  }

  return json.data;
}

export async function getOrders() {
  if (!isTauri()) throw new Error('Tauri API not available');
  return await invoke('get_orders');
}

export async function getProducts() {
  // Remove the Tauri check for this page
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