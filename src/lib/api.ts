import { invoke } from '@tauri-apps/api/tauri';

const API_URL = import.meta.env.VITE_API_URL;

export async function graphqlRequest(query: string, variables: Record<string, any> = {}) {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    throw new Error('Network response was not ok');
  }

  const json = await response.json();
  if (json.errors) {
    throw new Error(json.errors.map((e: any) => e.message).join('\n'));
  }

  return json.data;
}

function isTauri() {
  return typeof window !== 'undefined' && '__TAURI__' in window;
}

export async function getOrders() {
  if (isTauri()) {
    return await invoke('get_orders');
  } else {
    return (await graphqlRequest(`query { orders { id orderNumber productId quantity status totalValue customerName productType assignedTo validDate createdAt updatedAt } }`)).orders;
  }
}

export async function getProducts() {
  if (isTauri()) {
    return await invoke('get_products');
  } else {
    return (await graphqlRequest(`query { products { id name sku category season designer status developmentStage actualHours priority createdAt updatedAt } }`)).products;
  }
}

export async function getCostingSheets() {
  if (isTauri()) {
    return await invoke('get_costing_sheets');
  } else {
    return (await graphqlRequest(`query { costingSheets { id name profitMargin selectedCurrency costBreakdown taxConfig createdAt updatedAt } }`)).costingSheets;
  }
}

export async function getUsers() {
  if (isTauri()) {
    return await invoke('get_users');
  } else {
    return (await graphqlRequest(`query { users { id email name department preferredHomepage createdAt updatedAt } }`)).users;
  }
}

export async function getSamples() {
  if (isTauri()) {
    return await invoke('get_samples');
  } else {
    return (await graphqlRequest(`query { samples { id productId type status notes version feedback approvedBy createdAt } }`)).samples;
  }
}

export async function getDesignFiles() {
  if (isTauri()) {
    return await invoke('get_design_files');
  } else {
    return (await graphqlRequest(`query { designFiles { id productId fileName fileType url version isLatest uploadedBy uploadedAt } }`)).designFiles;
  }
}

export async function getProductionPlans() {
  if (isTauri()) {
    return await invoke('get_production_plans');
  } else {
    return (await graphqlRequest(`query { productionPlans { id productName quantity startDate endDate status progress assignedWorkers estimatedHours actualHours priority createdAt updatedAt } }`)).productionPlans;
  }
}

export async function getResources() {
  if (isTauri()) {
    return await invoke('get_resources');
  } else {
    return (await graphqlRequest(`query { resources { id name type capacity allocated available efficiency createdAt updatedAt } }`)).resources;
  }
}

export async function getInventoryItems() {
  if (isTauri()) {
    return await invoke('get_inventory_items');
  } else {
    return (await graphqlRequest(`query { inventoryItems { id name category currentStock minStock maxStock unit unitCost totalValue location lastUpdated supplier createdAt updatedAt } }`)).inventoryItems;
  }
}

export async function getInventoryHistory() {
  if (isTauri()) {
    return await invoke('get_inventory_history');
  } else {
    return (await graphqlRequest(`query { inventoryHistory { id itemId action quantityChange previousStock newStock note user createdAt } }`)).inventoryHistory;
  }
}

export async function getInventoryReorders() {
  if (isTauri()) {
    return await invoke('get_inventory_reorders');
  } else {
    return (await graphqlRequest(`query { inventoryReorders { id itemId quantity supplier status note user createdAt } }`)).inventoryReorders;
  }
}