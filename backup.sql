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
INSERT INTO products VALUES(4,'Dell Latitude 5440 Laptop','DELL-LAT-5440',68599.99000000000524,15,'A high-quality, premium Dell Latitude 5440 Laptop designed for maximum resilience and productivity in any environment.');
INSERT INTO products VALUES(5,'HP Wireless Mouse','HP-MOU-WL01',799.0,120,'A high-quality, premium HP Wireless Mouse designed for maximum resilience and productivity in any environment.');
INSERT INTO products VALUES(6,'Logitech Mechanical Keyboard','LOG-KEY-MECH',4299.989999999999782,60,'A high-quality, premium Logitech Mechanical Keyboard designed for maximum resilience and productivity in any environment.');
INSERT INTO products VALUES(7,'Eco-Friendly Packaging Box','GP-PACK-50',959.990000000000009,200,'A high-quality, premium Eco-Friendly Packaging Box designed for maximum resilience and productivity in any environment.');
INSERT INTO products VALUES(8,'LED_TV','LG',59999.0,10,'A high-quality, premium LED designed for maximum resilience and productivity in any environment.');
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
INSERT INTO purchase_orders VALUES(1,'194BB998',2,273.5249999999999773,13.02500000000000035,'Approved','2026-03-30 10:57:07.600530');
INSERT INTO purchase_orders VALUES(2,'C11A2BC9',3,75238.23300000000746,3582.773000000000592,'Pending','2026-03-30 10:58:00.029630');
INSERT INTO purchase_orders VALUES(3,'A2369795',2,5039.947500000000218,239.9975000000000022,'Approved','2026-03-30 10:58:16.178349');
INSERT INTO purchase_orders VALUES(4,'62058F55',1,184.2750000000000056,8.775000000000000355,'Completed','2026-03-30 10:58:32.652341');
INSERT INTO purchase_orders VALUES(5,'DB1B6DE9',1,72029.98950000001059,3429.999500000000353,'Pending','2026-03-30 11:13:23.200678');
INSERT INTO purchase_orders VALUES(6,'4579D347',3,139543.9290000000037,6644.949000000000524,'Completed','2026-03-30 11:15:30.301102');
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
INSERT INTO po_items VALUES(1,1,1,1,25.5);
INSERT INTO po_items VALUES(2,1,2,1,85.0);
INSERT INTO po_items VALUES(3,1,3,1,150.0);
INSERT INTO po_items VALUES(4,2,7,3,959.990000000000009);
INSERT INTO po_items VALUES(5,2,1,1,25.5);
INSERT INTO po_items VALUES(6,2,3,1,150.0);
INSERT INTO po_items VALUES(7,2,4,1,68599.99000000000524);
INSERT INTO po_items VALUES(8,3,7,5,959.990000000000009);
INSERT INTO po_items VALUES(9,4,3,1,150.0);
INSERT INTO po_items VALUES(10,4,1,1,25.5);
INSERT INTO po_items VALUES(11,5,4,1,68599.99000000000524);
INSERT INTO po_items VALUES(12,6,8,1,59999.0);
INSERT INTO po_items VALUES(13,6,4,1,68599.99000000000524);
INSERT INTO po_items VALUES(14,6,6,1,4299.989999999999782);
CREATE INDEX ix_vendors_name ON vendors (name);
CREATE INDEX ix_vendors_id ON vendors (id);
CREATE INDEX ix_products_name ON products (name);
CREATE UNIQUE INDEX ix_products_sku ON products (sku);
CREATE INDEX ix_products_id ON products (id);
CREATE INDEX ix_purchase_orders_id ON purchase_orders (id);
CREATE UNIQUE INDEX ix_purchase_orders_ref_no ON purchase_orders (ref_no);
CREATE INDEX ix_po_items_id ON po_items (id);
COMMIT;
