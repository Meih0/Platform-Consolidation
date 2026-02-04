import Database from 'better-sqlite3';
import path from 'path';

const DB_PATH = process.env.DB_PATH || path.join(process.cwd(), 'data.db');

let _db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!_db) {
    _db = new Database(DB_PATH);
    _db.pragma('journal_mode = WAL');
    _db.pragma('foreign_keys = ON');
    initSchema(_db);
  }
  return _db;
}

function initSchema(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS sectors (
      id TEXT PRIMARY KEY,
      name_en TEXT NOT NULL,
      name_ar TEXT,
      torch_bearer_en TEXT,
      torch_bearer_ar TEXT,
      status TEXT DEFAULT 'Active',
      sector_lead_id TEXT REFERENCES sector_leads(id)
    );

    CREATE TABLE IF NOT EXISTS organizations (
      id TEXT PRIMARY KEY,
      sector_id TEXT REFERENCES sectors(id),
      name_en TEXT NOT NULL,
      name_ar TEXT,
      org_type TEXT DEFAULT 'Service Provider',
      contact_email TEXT,
      contact_phone TEXT,
      status TEXT DEFAULT 'Active'
    );

    CREATE TABLE IF NOT EXISTS platforms (
      id TEXT PRIMARY KEY,
      org_id TEXT REFERENCES organizations(id),
      government_entity TEXT,
      target_platform_name TEXT NOT NULL,
      current_domain TEXT,
      domain_status TEXT DEFAULT 'Active',
      main_platform TEXT,
      new_domain TEXT,
      expected_completion TEXT,
      implementation_status TEXT DEFAULT 'Planning',
      current_challenges TEXT,
      dga_support_required TEXT,
      sector_lead_id TEXT REFERENCES sector_leads(id),
      last_update_date TEXT,
      progress INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS services (
      id TEXT PRIMARY KEY,
      platform_id TEXT REFERENCES platforms(id),
      name TEXT NOT NULL,
      description TEXT,
      service_owner TEXT,
      user_type TEXT DEFAULT 'Citizens',
      sla_target TEXT,
      status TEXT DEFAULT 'Active'
    );

    CREATE TABLE IF NOT EXISTS sector_leads (
      id TEXT PRIMARY KEY,
      name_en TEXT NOT NULL,
      name_ar TEXT,
      email TEXT,
      phone TEXT,
      status TEXT DEFAULT 'Active',
      personality_notes TEXT
    );

    CREATE TABLE IF NOT EXISTS sector_lead_assignments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sector_lead_id TEXT REFERENCES sector_leads(id),
      sector_id TEXT REFERENCES sectors(id),
      UNIQUE(sector_lead_id, sector_id)
    );

    CREATE TABLE IF NOT EXISTS meetings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sector_lead_id TEXT REFERENCES sector_leads(id),
      org_id TEXT REFERENCES organizations(id),
      sector_id TEXT REFERENCES sectors(id),
      title TEXT NOT NULL,
      date TEXT NOT NULL,
      time TEXT,
      location TEXT,
      type TEXT DEFAULT 'check-in',
      status TEXT DEFAULT 'scheduled',
      purpose TEXT,
      notes TEXT,
      outcomes TEXT,
      next_steps TEXT,
      updates_entered INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS updates_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      entity_type TEXT NOT NULL,
      entity_id TEXT NOT NULL,
      field_changed TEXT,
      old_value TEXT,
      new_value TEXT,
      changed_by TEXT,
      changed_at TEXT DEFAULT (datetime('now')),
      notes TEXT
    );

    CREATE TABLE IF NOT EXISTS reminders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      meeting_id INTEGER REFERENCES meetings(id),
      type TEXT DEFAULT 'post_meeting_update',
      message TEXT,
      due_date TEXT,
      is_dismissed INTEGER DEFAULT 0
    );
  `);
}
