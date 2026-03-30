-- PostgreSQL Backup Script
-- Generated for PO Management System

-- Drop tables if they exist to ensure a clean restore
DROP TABLE IF EXISTS po_items CASCADE;
DROP TABLE IF EXISTS purchase_orders CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS vendors CASCADE;

-- Recreate tables using PostgreSQL SERIAL and consistent types
CREATE TABLE vendors (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    contact VARCHAR(255),
    rating FLOAT DEFAULT 0.0
);

CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    sku VARCHAR(255) UNIQUE NOT NULL,
    unit_price FLOAT NOT NULL,
    stock_level INTEGER NOT NULL,
    description TEXT
);

CREATE TABLE purchase_orders (
    id SERIAL PRIMARY KEY,
    ref_no VARCHAR(50) UNIQUE NOT NULL,
    vendor_id INTEGER NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
    total_amount FLOAT DEFAULT 0.0,
    tax_amount FLOAT DEFAULT 0.0,
    status VARCHAR(50) DEFAULT 'DRAFT',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE po_items (
    id SERIAL PRIMARY KEY,
    po_id INTEGER NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    price_at_purchase FLOAT NOT NULL
);

-- Seed Vendors
INSERT INTO vendors (id, name, contact, rating) VALUES 
(1, 'Global Supplies Inc.', 'contact@global.com', 4.5),
(2, 'Tech Dynamics', 'sales@techdyn.com', 4.8),
(3, 'Office Essentials', 'info@office.com', 4.2);

-- Seed Products
INSERT INTO products (id, name, sku, unit_price, stock_level, description) VALUES 
(1, 'Wireless Mouse', 'W-MOU-001', 25.5, 100, 'Ergonomic 2.4G wireless mouse.'),
(2, 'Mechanical Keyboard', 'M-KEY-002', 85.0, 50, 'RGB mechanical keyboard with blue switches.'),
(3, 'LED Monitor', 'L-MON-003', 150.0, 30, '24-inch Full HD LED monitor.'),
(4, 'Dell Latitude 5440 Laptop', 'DELL-LAT-5440', 68599.99, 15, 'A high-quality, premium Dell Latitude 5440 Laptop designed for maximum resilience and productivity in any environment.'),
(5, 'HP Wireless Mouse', 'HP-MOU-WL01', 799.0, 120, 'A high-quality, premium HP Wireless Mouse designed for maximum resilience and productivity in any environment.'),
(6, 'Logitech Mechanical Keyboard', 'LOG-KEY-MECH', 4299.99, 60, 'A high-quality, premium Logitech Mechanical Keyboard designed for maximum resilience and productivity in any environment.'),
(7, 'Eco-Friendly Packaging Box', 'GP-PACK-50', 959.99, 200, 'A high-quality, premium Eco-Friendly Packaging Box designed for maximum resilience and productivity in any environment.'),
(8, 'LED_TV', 'LG', 59999.0, 10, 'A high-quality, premium LED designed for maximum resilience and productivity in any environment.');

-- Seed Purchase Orders
INSERT INTO purchase_orders (id, ref_no, vendor_id, total_amount, tax_amount, status, created_at) VALUES 
(1, '194BB998', 2, 273.53, 13.03, 'Approved', '2026-03-30 10:57:07.600530'),
(2, 'C11A2BC9', 3, 75238.23, 3582.77, 'Pending', '2026-03-30 10:58:00.029630'),
(3, 'A2369795', 2, 5039.95, 240.00, 'Approved', '2026-03-30 10:58:16.178349'),
(4, '62058F55', 1, 184.28, 8.78, 'Completed', '2026-03-30 10:58:32.652341'),
(5, 'DB1B6DE9', 1, 72029.99, 3430.00, 'Pending', '2026-03-30 11:13:23.200678'),
(6, '4579D347', 3, 139543.93, 6644.95, 'Completed', '2026-03-30 11:15:30.301102');

-- Seed PO Items
INSERT INTO po_items (id, po_id, product_id, quantity, price_at_purchase) VALUES 
(1, 1, 1, 1, 25.5),
(2, 1, 2, 1, 85.0),
(3, 1, 3, 1, 150.0),
(4, 2, 7, 3, 959.99),
(5, 2, 1, 1, 25.5),
(6, 2, 3, 1, 150.0),
(7, 2, 4, 1, 68599.99),
(8, 3, 7, 5, 959.99),
(9, 4, 3, 1, 150.0),
(10, 4, 1, 1, 25.5),
(11, 5, 4, 1, 68599.99),
(12, 6, 8, 1, 59999.0),
(13, 6, 4, 1, 68599.99),
(14, 6, 6, 1, 4299.99);

-- Fix sequences for SERIAL columns
SELECT setval('vendors_id_seq', (SELECT MAX(id) FROM vendors));
SELECT setval('products_id_seq', (SELECT MAX(id) FROM products));
SELECT setval('purchase_orders_id_seq', (SELECT MAX(id) FROM purchase_orders));
SELECT setval('po_items_id_seq', (SELECT MAX(id) FROM po_items));
