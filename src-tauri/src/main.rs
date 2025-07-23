// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::Manager;
use rusqlite::{Connection, Result as SqlResult, Row};
use serde::Serialize;
use tauri::api::path::{app_dir, BaseDirectory, app_data_dir};

#[derive(serde::Serialize)]
struct User {
    id: String,
    email: String,
    name: String,
    department: Option<String>,
    preferred_homepage: Option<String>,
    created_at: String,
    updated_at: String,
}

#[derive(serde::Serialize)]
struct Product {
    id: String,
    name: String,
    sku: Option<String>,
    category: Option<String>,
    season: Option<String>,
    designer: Option<String>,
    status: String,
    development_stage: String,
    actual_hours: Option<f64>,
    priority: String,
    created_at: String,
    updated_at: String,
}

#[derive(Serialize)]
struct Order {
    id: String,
    orderNumber: String,
    productId: String,
    quantity: i32,
    status: String,
    totalValue: f64,
    customerName: String,
    productType: String,
    assignedTo: String,
    validDate: i64, // changed from String to i64
    createdAt: i64, // changed from String to i64
    updatedAt: i64, // changed from String to i64
}

#[derive(serde::Serialize)]
struct Sample {
    id: String,
    product_id: String,
    type_: String,
    status: String,
    notes: Option<String>,
    version: Option<i64>,
    feedback: Option<String>,
    approved_by: Option<String>,
    created_at: String,
}

#[derive(serde::Serialize)]
struct DesignFile {
    id: String,
    product_id: String,
    file_name: String,
    file_type: Option<String>,
    url: Option<String>,
    version: Option<i64>,
    is_latest: Option<bool>,
    uploaded_by: Option<String>,
    uploaded_at: String,
}

#[derive(serde::Serialize)]
struct CostingSheet {
    id: String,
    name: String,
    profit_margin: f64,
    selected_currency: String,
    cost_breakdown: String,
    tax_config: String,
    created_at: String,
    updated_at: String,
}

#[derive(serde::Serialize)]
struct ProductionPlan {
    id: String,
    product_name: String,
    quantity: i64,
    start_date: String,
    end_date: String,
    status: String,
    progress: i64,
    assigned_workers: i64,
    estimated_hours: i64,
    actual_hours: i64,
    priority: String,
    created_at: String,
    updated_at: String,
}

#[derive(serde::Serialize)]
struct Resource {
    id: String,
    name: String,
    type_: String,
    capacity: i64,
    allocated: i64,
    available: i64,
    efficiency: i64,
    created_at: String,
    updated_at: String,
}

#[derive(serde::Serialize)]
struct InventoryItem {
    id: String,
    name: String,
    category: String,
    current_stock: i64,
    min_stock: i64,
    max_stock: i64,
    unit: String,
    unit_cost: f64,
    total_value: f64,
    location: String,
    last_updated: String,
    supplier: Option<String>,
    created_at: String,
    updated_at: String,
}

#[derive(serde::Serialize)]
struct InventoryHistory {
    id: String,
    item_id: String,
    action: String,
    quantity_change: i64,
    previous_stock: i64,
    new_stock: i64,
    note: Option<String>,
    user: Option<String>,
    created_at: String,
}

#[derive(serde::Serialize)]
struct InventoryReorder {
    id: String,
    item_id: String,
    quantity: i64,
    supplier: Option<String>,
    status: String,
    note: Option<String>,
    user: Option<String>,
    created_at: String,
}

// Manual implementations for each model (macro above is a sketch, not used for clarity)

#[tauri::command]
fn get_users() -> Vec<User> {
    let conn = Connection::open("../server/prisma/dev.db").expect("Failed to open SQLite DB");
    let mut stmt = conn.prepare("SELECT id, email, name, department, preferredHomepage, createdAt, updatedAt FROM User").expect("Failed to prepare statement");
    let rows = stmt.query_map([], |row| {
        Ok(User {
            id: row.get(0)?,
            email: row.get(1)?,
            name: row.get(2)?,
            department: row.get(3).ok(),
            preferred_homepage: row.get(4).ok(),
            created_at: row.get::<_, String>(5)?,
            updated_at: row.get::<_, String>(6)?,
        })
    }).expect("Failed to query users");
    rows.filter_map(|r| r.ok()).collect()
}

#[tauri::command]
fn get_products() -> Vec<Product> {
    let conn = Connection::open("../server/prisma/dev.db").expect("Failed to open SQLite DB");
    let mut stmt = conn.prepare("SELECT id, name, sku, category, season, designer, status, developmentStage, actualHours, priority, createdAt, updatedAt FROM Product").expect("Failed to prepare statement");
    let rows = stmt.query_map([], |row| {
        Ok(Product {
            id: row.get(0)?,
            name: row.get(1)?,
            sku: row.get(2).ok(),
            category: row.get(3).ok(),
            season: row.get(4).ok(),
            designer: row.get(5).ok(),
            status: row.get(6)?,
            development_stage: row.get(7)?,
            actual_hours: row.get(8).ok(),
            priority: row.get(9)?,
            created_at: row.get(10)?,
            updated_at: row.get(11)?,
        })
    }).expect("Failed to query products");
    rows.filter_map(|r| r.ok()).collect()
}

#[tauri::command]
fn get_orders() -> Result<Vec<Order>, String> {
    let db_path = "../server/prisma/dev.db";
    println!("[DEBUG] get_orders: db_path = {}", db_path);
    let conn = match Connection::open(&db_path) {
        Ok(c) => c,
        Err(e) => {
            println!("[ERROR] Failed to open DB at {}: {}", db_path, e);
            return Err(format!("Failed to open DB at {}: {}", db_path, e));
        }
    };
    let mut stmt = match conn.prepare("SELECT id, orderNumber, productId, quantity, status, totalValue, customerName, productType, assignedTo, validDate, createdAt, updatedAt FROM 'Order'") {
        Ok(s) => s,
        Err(e) => {
            println!("[ERROR] Failed to prepare statement: {}", e);
            return Err(format!("Failed to prepare statement: {}", e));
        }
    };
    let orders = match stmt.query_map([], |row| {
        Ok(Order {
            id: row.get(0)?,
            orderNumber: row.get(1)?,
            productId: row.get(2)?,
            quantity: row.get(3)?,
            status: row.get(4)?,
            totalValue: row.get(5)?,
            customerName: row.get(6)?,
            productType: row.get(7)?,
            assignedTo: row.get(8)?,
            validDate: row.get(9)?,
            createdAt: row.get(10)?,
            updatedAt: row.get(11)?,
        })
    }) {
        Ok(rows) => rows,
        Err(e) => {
            println!("[ERROR] Failed to query orders: {}", e);
            return Err(format!("Failed to query orders: {}", e));
        }
    };
    let orders: Result<Vec<_>, _> = orders.collect();
    match orders {
        Ok(o) => Ok(o),
        Err(e) => {
            println!("[ERROR] Failed to collect orders: {}", e);
            Err(format!("Failed to collect orders: {}", e))
        }
    }
}

#[tauri::command]
fn get_samples() -> Vec<Sample> {
    let conn = Connection::open("../server/prisma/dev.db").expect("Failed to open SQLite DB");
    let mut stmt = conn.prepare("SELECT id, productId, type, status, notes, version, feedback, approvedBy, createdAt FROM Sample").expect("Failed to prepare statement");
    let rows = stmt.query_map([], |row| {
        Ok(Sample {
            id: row.get(0)?,
            product_id: row.get(1)?,
            type_: row.get(2)?,
            status: row.get(3)?,
            notes: row.get(4).ok(),
            version: row.get(5).ok(),
            feedback: row.get(6).ok(),
            approved_by: row.get(7).ok(),
            created_at: row.get(8)?,
        })
    }).expect("Failed to query samples");
    rows.filter_map(|r| r.ok()).collect()
}

#[tauri::command]
fn get_design_files() -> Vec<DesignFile> {
    let conn = Connection::open("../server/prisma/dev.db").expect("Failed to open SQLite DB");
    let mut stmt = conn.prepare("SELECT id, productId, fileName, fileType, url, version, isLatest, uploadedBy, uploadedAt FROM DesignFile").expect("Failed to prepare statement");
    let rows = stmt.query_map([], |row| {
        Ok(DesignFile {
            id: row.get(0)?,
            product_id: row.get(1)?,
            file_name: row.get(2)?,
            file_type: row.get(3).ok(),
            url: row.get(4).ok(),
            version: row.get(5).ok(),
            is_latest: row.get(6).ok(),
            uploaded_by: row.get(7).ok(),
            uploaded_at: row.get(8)?,
        })
    }).expect("Failed to query design files");
    rows.filter_map(|r| r.ok()).collect()
}

#[tauri::command]
fn get_costing_sheets() -> Vec<CostingSheet> {
    let conn = Connection::open("../server/prisma/dev.db").expect("Failed to open SQLite DB");
    let mut stmt = conn.prepare("SELECT id, name, profitMargin, selectedCurrency, costBreakdown, taxConfig, createdAt, updatedAt FROM CostingSheet").expect("Failed to prepare statement");
    let rows = stmt.query_map([], |row| {
        Ok(CostingSheet {
            id: row.get(0)?,
            name: row.get(1)?,
            profit_margin: row.get(2)?,
            selected_currency: row.get(3)?,
            cost_breakdown: row.get(4)?,
            tax_config: row.get(5)?,
            created_at: row.get(6)?,
            updated_at: row.get(7)?,
        })
    }).expect("Failed to query costing sheets");
    rows.filter_map(|r| r.ok()).collect()
}

#[tauri::command]
fn get_production_plans() -> Vec<ProductionPlan> {
    let conn = Connection::open("../server/prisma/dev.db").expect("Failed to open SQLite DB");
    let mut stmt = conn.prepare("SELECT id, productName, quantity, startDate, endDate, status, progress, assignedWorkers, estimatedHours, actualHours, priority, createdAt, updatedAt FROM ProductionPlan").expect("Failed to prepare statement");
    let rows = stmt.query_map([], |row| {
        Ok(ProductionPlan {
            id: row.get(0)?,
            product_name: row.get(1)?,
            quantity: row.get(2)?,
            start_date: row.get(3)?,
            end_date: row.get(4)?,
            status: row.get(5)?,
            progress: row.get(6)?,
            assigned_workers: row.get(7)?,
            estimated_hours: row.get(8)?,
            actual_hours: row.get(9)?,
            priority: row.get(10)?,
            created_at: row.get(11)?,
            updated_at: row.get(12)?,
        })
    }).expect("Failed to query production plans");
    rows.filter_map(|r| r.ok()).collect()
}

#[tauri::command]
fn get_resources() -> Vec<Resource> {
    let conn = Connection::open("../server/prisma/dev.db").expect("Failed to open SQLite DB");
    let mut stmt = conn.prepare("SELECT id, name, type, capacity, allocated, available, efficiency, createdAt, updatedAt FROM Resource").expect("Failed to prepare statement");
    let rows = stmt.query_map([], |row| {
        Ok(Resource {
            id: row.get(0)?,
            name: row.get(1)?,
            type_: row.get(2)?,
            capacity: row.get(3)?,
            allocated: row.get(4)?,
            available: row.get(5)?,
            efficiency: row.get(6)?,
            created_at: row.get(7)?,
            updated_at: row.get(8)?,
        })
    }).expect("Failed to query resources");
    rows.filter_map(|r| r.ok()).collect()
}

#[tauri::command]
fn get_inventory_items() -> Vec<InventoryItem> {
    let conn = Connection::open("../server/prisma/dev.db").expect("Failed to open SQLite DB");
    let mut stmt = conn.prepare("SELECT id, name, category, currentStock, minStock, maxStock, unit, unitCost, totalValue, location, lastUpdated, supplier, createdAt, updatedAt FROM InventoryItem").expect("Failed to prepare statement");
    let rows = stmt.query_map([], |row| {
        Ok(InventoryItem {
            id: row.get(0)?,
            name: row.get(1)?,
            category: row.get(2)?,
            current_stock: row.get(3)?,
            min_stock: row.get(4)?,
            max_stock: row.get(5)?,
            unit: row.get(6)?,
            unit_cost: row.get(7)?,
            total_value: row.get(8)?,
            location: row.get(9)?,
            last_updated: row.get(10)?,
            supplier: row.get(11).ok(),
            created_at: row.get(12)?,
            updated_at: row.get(13)?,
        })
    }).expect("Failed to query inventory items");
    rows.filter_map(|r| r.ok()).collect()
}

#[tauri::command]
fn get_inventory_history() -> Vec<InventoryHistory> {
    let conn = Connection::open("../server/prisma/dev.db").expect("Failed to open SQLite DB");
    let mut stmt = conn.prepare("SELECT id, itemId, action, quantityChange, previousStock, newStock, note, user, createdAt FROM InventoryHistory").expect("Failed to prepare statement");
    let rows = stmt.query_map([], |row| {
        Ok(InventoryHistory {
            id: row.get(0)?,
            item_id: row.get(1)?,
            action: row.get(2)?,
            quantity_change: row.get(3)?,
            previous_stock: row.get(4)?,
            new_stock: row.get(5)?,
            note: row.get(6).ok(),
            user: row.get(7).ok(),
            created_at: row.get(8)?,
        })
    }).expect("Failed to query inventory history");
    rows.filter_map(|r| r.ok()).collect()
}

#[tauri::command]
fn get_inventory_reorders() -> Vec<InventoryReorder> {
    let conn = Connection::open("../server/prisma/dev.db").expect("Failed to open SQLite DB");
    let mut stmt = conn.prepare("SELECT id, itemId, quantity, supplier, status, note, user, createdAt FROM InventoryReorder").expect("Failed to prepare statement");
    let rows = stmt.query_map([], |row| {
        Ok(InventoryReorder {
            id: row.get(0)?,
            item_id: row.get(1)?,
            quantity: row.get(2)?,
            supplier: row.get(3).ok(),
            status: row.get(4)?,
            note: row.get(5).ok(),
            user: row.get(6).ok(),
            created_at: row.get(7)?,
        })
    }).expect("Failed to query inventory reorders");
    rows.filter_map(|r| r.ok()).collect()
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            get_users,
            get_products,
            get_orders,
            get_samples,
            get_design_files,
            get_costing_sheets,
            get_production_plans,
            get_resources,
            get_inventory_items,
            get_inventory_history,
            get_inventory_reorders,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
