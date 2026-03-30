DROP TABLE IF EXISTS po_items CASCADE;
DROP TABLE IF EXISTS purchase_orders CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS vendors CASCADE;

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

-- Seed Data for Vendors
INSERT INTO vendors (name, contact, rating) VALUES 
('Global Supplies Inc.', 'contact@global.com', 4.5),
('Tech Dynamics', 'sales@techdyn.com', 4.8),
('Office Essentials', 'info@office.com', 4.2);

-- Seed Data for Products
INSERT INTO products (name, sku, unit_price, stock_level, description) VALUES 
('Wireless Mouse', 'W-MOU-001', 25.5, 100, 'Ergonomic 2.4G wireless mouse.'),
('Mechanical Keyboard', 'M-KEY-002', 85.0, 50, 'RGB mechanical keyboard with blue switches.'),
('LED Monitor', 'L-MON-003', 150.0, 30, '24-inch Full HD LED monitor.'),
('Dell Latitude 5440 Laptop', 'DELL-LAT-5440', 68599.99, 15, 'A high-quality, premium Dell Latitude 5440 Laptop designed for maximum resilience and productivity in any environment.'),
('HP Wireless Mouse', 'HP-MOU-WL01', 799.0, 120, 'A high-quality, premium HP Wireless Mouse designed for maximum resilience and productivity in any environment.'),
('Logitech Mechanical Keyboard', 'LOG-KEY-MECH', 4299.99, 60, 'A high-quality, premium Logitech Mechanical Keyboard designed for maximum resilience and productivity in any environment.'),
('Eco-Friendly Packaging Box', 'GP-PACK-50', 959.99, 200, 'A high-quality, premium Eco-Friendly Packaging Box designed for maximum resilience and productivity in any environment.'),
('LED_TV', 'LG', 59999.0, 10, 'A high-quality, premium LED designed for maximum resilience and productivity in any environment.');
