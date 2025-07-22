declare const __TAURI__: boolean;

function isTauri() {
  return typeof window !== 'undefined' && typeof __TAURI__ !== 'undefined' && __TAURI__;
}

const API_URL = import.meta.env.VITE_API_URL;

export async function graphqlRequest(query: string, variables: Record<string, any> = {}) {
  console.log("Sending GraphQL request:", { url: API_URL, query, variables });
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

export async function getOrders() {
  if (isTauri()) {
    const { invoke } = await import(/* @vite-ignore */ '@tauri-apps/api/core');
    return await invoke('get_orders');
  } else {
    return (await graphqlRequest(`query { orders { id orderNumber product { id name } quantity status totalValue customerName productType assignedTo validDate createdAt updatedAt } }`)).orders;
  }
}

export async function getProducts() {
  if (isTauri()) {
    const { invoke } = await import(/* @vite-ignore */ '@tauri-apps/api/core');
    return await invoke('get_products');
  } else {
    return (await graphqlRequest(`query { products { id name sku category season designer status developmentStage actualHours priority createdAt updatedAt } }`)).products;
  }
}

export async function getCostingSheets() {
  if (isTauri()) {
    const { invoke } = await import(/* @vite-ignore */ '@tauri-apps/api/core');
    return await invoke('get_costing_sheets');
  } else {
    return (await graphqlRequest(`query { costingSheets { id name profitMargin selectedCurrency costBreakdown { materials { id name supplier quantity unit unitCost currency total } labor { id operation timeMinutes ratePerHour currency total } overheads { id category amount currency type } } taxConfig { vatRate customsDuty otherTaxes } createdAt updatedAt } }`)).costingSheets;
  }
}

export async function getUsers() {
  if (isTauri()) {
    const { invoke } = await import(/* @vite-ignore */ '@tauri-apps/api/core');
    return await invoke('get_users');
  } else {
    return (await graphqlRequest(`query { users { id email name department preferredHomepage createdAt updatedAt } }`)).users;
  }
}

export async function getSamples() {
  if (isTauri()) {
    const { invoke } = await import(/* @vite-ignore */ '@tauri-apps/api/core');
    return await invoke('get_samples');
  } else {
    return (await graphqlRequest(`query { samples { id productId type status notes version feedback approvedBy createdAt } }`)).samples;
  }
}

export async function getDesignFiles() {
  if (isTauri()) {
    const { invoke } = await import(/* @vite-ignore */ '@tauri-apps/api/core');
    return await invoke('get_design_files');
  } else {
    return (await graphqlRequest(`query { designFiles { id productId fileName fileType url version isLatest uploadedBy uploadedAt } }`)).designFiles;
  }
}

export async function getProductionPlans() {
  if (isTauri()) {
    const { invoke } = await import(/* @vite-ignore */ '@tauri-apps/api/core');
    return await invoke('get_production_plans');
  } else {
    return (await graphqlRequest(`query { productionPlans { id productName quantity startDate endDate status progress assignedWorkers estimatedHours actualHours priority } }`)).productionPlans;
  }
}

export async function getResources() {
  if (isTauri()) {
    const { invoke } = await import(/* @vite-ignore */ '@tauri-apps/api/core');
    return await invoke('get_resources');
  } else {
    return (await graphqlRequest(`query { resources { id name type capacity allocated available efficiency } }`)).resources;
  }
}

export async function getInventoryItems() {
  if (isTauri()) {
    const { invoke } = await import(/* @vite-ignore */ '@tauri-apps/api/core');
    return await invoke('get_inventory_items');
  } else {
    return (await graphqlRequest(`query { inventoryItems { id name category currentStock minStock maxStock unit unitCost totalValue location lastUpdated supplier } }`)).inventoryItems;
  }
}

export async function getInventoryHistory(itemId: string) {
  return (await graphqlRequest(
    `query ($itemId: ID!) { inventoryHistory(itemId: $itemId) { id itemId action quantityChange previousStock newStock note user createdAt } }`,
    { itemId }
  )).inventoryHistory;
}

export async function getInventoryReorders() {
  if (isTauri()) {
    const { invoke } = await import(/* @vite-ignore */ '@tauri-apps/api/core');
    return await invoke('get_inventory_reorders');
  } else {
    return (await graphqlRequest(`query { inventoryReorders { id itemId quantity supplier status note user createdAt } }`)).inventoryReorders;
  }
}