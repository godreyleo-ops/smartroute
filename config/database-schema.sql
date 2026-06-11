-- Create database
CREATE DATABASE smartroute_admin;

-- Connect to the database
\c smartroute_admin;

-- Users Table (for admin authentication)
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(100) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'admin',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP
);

-- Spare Parts Categories Table
CREATE TABLE spare_parts_categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  icon VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Spare Parts Table
CREATE TABLE spare_parts (
  id SERIAL PRIMARY KEY,
  part_id VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  category_id INTEGER REFERENCES spare_parts_categories(id) ON DELETE SET NULL,
  manufacturer VARCHAR(150),
  model VARCHAR(150),
  version VARCHAR(50),
  serial_number VARCHAR(100),
  description TEXT,
  critical_level VARCHAR(20) CHECK (critical_level IN ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW')),
  status VARCHAR(20) CHECK (status IN ('NEW', 'AVAIL', 'INUSE', 'REPAIR', 'OBSOLETE', 'RESERVED')),
  quantity INTEGER DEFAULT 0,
  unit_cost DECIMAL(10, 2),
  total_value DECIMAL(15, 2),
  supplier_id INTEGER,
  warranty_expires DATE,
  location_warehouse VARCHAR(100),
  location_rack VARCHAR(50),
  location_shelf VARCHAR(50),
  notes TEXT,
  minimum_stock_level INTEGER DEFAULT 5,
  reorder_point INTEGER DEFAULT 10,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by INTEGER REFERENCES users(id),
  updated_by INTEGER REFERENCES users(id)
);

-- Suppliers Table
CREATE TABLE suppliers (
  id SERIAL PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  contact_person VARCHAR(100),
  email VARCHAR(255),
  phone VARCHAR(20),
  address TEXT,
  lead_time_days INTEGER,
  reliability_rating DECIMAL(3, 2),
  minimum_order_quantity INTEGER DEFAULT 1,
  payment_terms VARCHAR(100),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Inventory Movements Table (for tracking stock changes)
CREATE TABLE inventory_movements (
  id SERIAL PRIMARY KEY,
  part_id INTEGER NOT NULL REFERENCES spare_parts(id) ON DELETE CASCADE,
  movement_type VARCHAR(50) CHECK (movement_type IN ('IN', 'OUT', 'ADJUSTMENT', 'REPAIR', 'RETURN')),
  quantity_change INTEGER NOT NULL,
  previous_quantity INTEGER,
  new_quantity INTEGER,
  reason TEXT,
  reference_number VARCHAR(100),
  performed_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  notes TEXT
);

-- Stock Alerts Table
CREATE TABLE stock_alerts (
  id SERIAL PRIMARY KEY,
  part_id INTEGER NOT NULL REFERENCES spare_parts(id) ON DELETE CASCADE,
  alert_type VARCHAR(50) CHECK (alert_type IN ('LOW_STOCK', 'OUT_OF_STOCK', 'WARRANTY_EXPIRING', 'OBSOLETE')),
  is_resolved BOOLEAN DEFAULT false,
  resolved_at TIMESTAMP,
  resolved_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  notes TEXT
);

-- Purchase Orders Table
CREATE TABLE purchase_orders (
  id SERIAL PRIMARY KEY,
  po_number VARCHAR(50) UNIQUE NOT NULL,
  supplier_id INTEGER NOT NULL REFERENCES suppliers(id),
  status VARCHAR(50) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'ORDERED', 'IN_TRANSIT', 'RECEIVED', 'CANCELLED')),
  total_amount DECIMAL(15, 2),
  order_date DATE NOT NULL,
  expected_delivery_date DATE,
  actual_delivery_date DATE,
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  notes TEXT
);

-- Purchase Order Items Table
CREATE TABLE purchase_order_items (
  id SERIAL PRIMARY KEY,
  purchase_order_id INTEGER NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
  part_id INTEGER NOT NULL REFERENCES spare_parts(id),
  quantity_ordered INTEGER NOT NULL,
  quantity_received INTEGER DEFAULT 0,
  unit_price DECIMAL(10, 2),
  line_total DECIMAL(15, 2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Audit Log Table
CREATE TABLE audit_logs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50),
  entity_id INTEGER,
  old_values JSONB,
  new_values JSONB,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Indexes for Performance
CREATE INDEX idx_spare_parts_category ON spare_parts(category_id);
CREATE INDEX idx_spare_parts_status ON spare_parts(status);
CREATE INDEX idx_spare_parts_critical_level ON spare_parts(critical_level);
CREATE INDEX idx_inventory_movements_part ON inventory_movements(part_id);
CREATE INDEX idx_stock_alerts_part ON stock_alerts(part_id);
CREATE INDEX idx_stock_alerts_type ON stock_alerts(alert_type);
CREATE INDEX idx_purchase_orders_status ON purchase_orders(status);
CREATE INDEX idx_purchase_orders_supplier ON purchase_orders(supplier_id);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at);

-- Insert default categories
INSERT INTO spare_parts_categories (name, description, icon) VALUES
('Hardware', 'Physical hardware components', 'hardware'),
('Network', 'Network and connectivity components', 'network'),
('Power', 'Power supply and battery components', 'power'),
('Storage', 'Storage devices and media', 'storage'),
('Software', 'Software and firmware components', 'software'),
('Mechanical', 'Mechanical and structural components', 'mechanical'),
('Cooling', 'Cooling and thermal management', 'cooling'),
('Cables', 'Cables, connectors, and adapters', 'cables');
