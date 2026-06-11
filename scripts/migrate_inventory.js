require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const { pool } = require('../config/database');

const migrations = [

// ═══════════════════════════════════════════════════════════════════════════
// Spare Parts Inventory System
// ═══════════════════════════════════════════════════════════════════════════

`CREATE TABLE IF NOT EXISTS spare_parts_categories (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name          VARCHAR(100) NOT NULL UNIQUE,
  description   TEXT,
  icon          VARCHAR(50),
  is_active     BOOLEAN DEFAULT TRUE,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);`,

`CREATE TABLE IF NOT EXISTS spare_parts (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  part_id               VARCHAR(50) UNIQUE NOT NULL,
  name                  VARCHAR(255) NOT NULL,
  category_id           UUID REFERENCES spare_parts_categories(id) ON DELETE SET NULL,
  manufacturer          VARCHAR(150),
  model                 VARCHAR(150),
  version               VARCHAR(50),
  serial_number         VARCHAR(100),
  description           TEXT,
  critical_level        VARCHAR(20) CHECK (critical_level IN ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW')) DEFAULT 'MEDIUM',
  status                VARCHAR(20) CHECK (status IN ('NEW', 'AVAIL', 'INUSE', 'REPAIR', 'OBSOLETE', 'RESERVED')) DEFAULT 'NEW',
  quantity              INT DEFAULT 0,
  unit_cost             DECIMAL(10, 2),
  total_value           DECIMAL(15, 2),
  location_warehouse    VARCHAR(100),
  location_rack         VARCHAR(50),
  location_shelf        VARCHAR(50),
  minimum_stock_level   INT DEFAULT 5,
  reorder_point         INT DEFAULT 10,
  warranty_expires      DATE,
  notes                 TEXT,
  created_by            UUID REFERENCES users(id) ON DELETE SET NULL,
  updated_by            UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at            TIMESTAMPTZ DEFAULT NOW(),
  updated_at            TIMESTAMPTZ DEFAULT NOW()
);`,

`CREATE TABLE IF NOT EXISTS inventory_movements (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  part_id           UUID NOT NULL REFERENCES spare_parts(id) ON DELETE CASCADE,
  movement_type     VARCHAR(50) CHECK (movement_type IN ('IN', 'OUT', 'ADJUSTMENT', 'REPAIR', 'RETURN')) NOT NULL,
  quantity_change   INT NOT NULL,
  previous_quantity INT,
  new_quantity      INT,
  reason            TEXT,
  reference_number  VARCHAR(100),
  performed_by      UUID REFERENCES users(id) ON DELETE SET NULL,
  notes             TEXT,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);`,

`CREATE TABLE IF NOT EXISTS stock_alerts (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  part_id       UUID NOT NULL REFERENCES spare_parts(id) ON DELETE CASCADE,
  alert_type    VARCHAR(50) CHECK (alert_type IN ('LOW_STOCK', 'OUT_OF_STOCK', 'WARRANTY_EXPIRING', 'OBSOLETE')) NOT NULL,
  is_resolved   BOOLEAN DEFAULT FALSE,
  resolved_at   TIMESTAMPTZ,
  resolved_by   UUID REFERENCES users(id) ON DELETE SET NULL,
  notes         TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);`,

// Create indexes for performance
`CREATE INDEX IF NOT EXISTS idx_spare_parts_category ON spare_parts(category_id);`,
`CREATE INDEX IF NOT EXISTS idx_spare_parts_status ON spare_parts(status);`,
`CREATE INDEX IF NOT EXISTS idx_spare_parts_critical_level ON spare_parts(critical_level);`,
`CREATE INDEX IF NOT EXISTS idx_inventory_movements_part ON inventory_movements(part_id);`,
`CREATE INDEX IF NOT EXISTS idx_inventory_movements_created ON inventory_movements(created_at DESC);`,
`CREATE INDEX IF NOT EXISTS idx_stock_alerts_part ON stock_alerts(part_id);`,
`CREATE INDEX IF NOT EXISTS idx_stock_alerts_type ON stock_alerts(alert_type);`,
`CREATE INDEX IF NOT EXISTS idx_stock_alerts_resolved ON stock_alerts(is_resolved);`,

// Seed default categories
`INSERT INTO spare_parts_categories (name, description, icon) VALUES
('Hardware', 'Physical hardware components', 'hardware'),
('Network', 'Network and connectivity components', 'network'),
('Power', 'Power supply and battery components', 'power'),
('Storage', 'Storage devices and media', 'storage'),
('Software', 'Software and firmware components', 'software'),
('Mechanical', 'Mechanical and structural components', 'mechanical'),
('Cooling', 'Cooling and thermal management', 'cooling'),
('Cables', 'Cables, connectors, and adapters', 'cables')
ON CONFLICT (name) DO NOTHING;`,

// Update timestamp trigger for spare_parts
`DO $$ BEGIN
  CREATE TRIGGER set_updated_at_spare_parts BEFORE UPDATE ON spare_parts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;`,

`DO $$ BEGIN
  CREATE TRIGGER set_updated_at_categories BEFORE UPDATE ON spare_parts_categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;`,

];

async function run() {
  console.log('🔄 Running spare parts inventory migrations...');
  for (let i = 0; i < migrations.length; i++) {
    try {
      await pool.query(migrations[i]);
      if (i % 5 === 0 || i === migrations.length - 1) {
        console.log(`  ✅ Step ${i + 1}/${migrations.length}`);
      }
    } catch (err) {
      console.error(`  ❌ Step ${i + 1} failed:`, err.message);
      throw err;
    }
  }
  console.log('\n✅ Spare parts inventory migration complete!');
  process.exit(0);
}

run().catch(err => { console.error(err); process.exit(1); });
