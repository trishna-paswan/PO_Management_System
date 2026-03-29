PRAGMA foreign_keys=OFF;
BEGIN TRANSACTION;
CREATE TABLE vendors (
	id INTEGER NOT NULL, 
	name VARCHAR, 
	contact VARCHAR, 
	rating FLOAT, 
	PRIMARY KEY (id)
);
INSERT INTO vendors VALUES(1,'Global Supplies Inc.','contact@global.com',4.5);
INSERT INTO vendors VALUES(2,'Tech Dynamics','sales@techdyn.com',4.799999999999999823);
INSERT INTO vendors VALUES(3,'Office Essentials','info@office.com',4.200000000000000177);
CREATE TABLE products (
	id INTEGER NOT NULL, 
	name VARCHAR, 
	sku VARCHAR, 
	unit_price FLOAT, 
	stock_level INTEGER, 
	description VARCHAR, 
	PRIMARY KEY (id)
);
INSERT INTO products VALUES(1,'Wireless Mouse','W-MOU-001',25.5,100,'Ergonomic 2.4G wireless mouse.');
INSERT INTO products VALUES(2,'Mechanical Keyboard','M-KEY-002',85.0,50,'RGB mechanical keyboard with blue switches.');
INSERT INTO products VALUES(3,'LED Monitor','L-MON-003',150.0,30,'24-inch Full HD LED monitor.');
CREATE TABLE purchase_orders (
	id INTEGER NOT NULL, 
	ref_no VARCHAR, 
	vendor_id INTEGER, 
	total_amount FLOAT, 
	tax_amount FLOAT, 
	status VARCHAR, 
	created_at DATETIME, 
	PRIMARY KEY (id), 
	FOREIGN KEY(vendor_id) REFERENCES vendors (id)
);
CREATE TABLE po_items (
	id INTEGER NOT NULL, 
	po_id INTEGER, 
	product_id INTEGER, 
	quantity INTEGER, 
	price_at_purchase FLOAT, 
	PRIMARY KEY (id), 
	FOREIGN KEY(po_id) REFERENCES purchase_orders (id), 
	FOREIGN KEY(product_id) REFERENCES products (id)
);
CREATE INDEX ix_vendors_name ON vendors (name);
CREATE INDEX ix_vendors_id ON vendors (id);
CREATE INDEX ix_products_name ON products (name);
CREATE UNIQUE INDEX ix_products_sku ON products (sku);
CREATE INDEX ix_products_id ON products (id);
CREATE INDEX ix_purchase_orders_id ON purchase_orders (id);
CREATE UNIQUE INDEX ix_purchase_orders_ref_no ON purchase_orders (ref_no);
CREATE INDEX ix_po_items_id ON po_items (id);
COMMIT;
