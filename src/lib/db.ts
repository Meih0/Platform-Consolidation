import Database from 'better-sqlite3';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'data.db');

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
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT
    );

    CREATE TABLE IF NOT EXISTS entities (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sector_id INTEGER REFERENCES sectors(id),
      name TEXT NOT NULL,
      acronym TEXT,
      tier TEXT,
      notes TEXT
    );

    CREATE TABLE IF NOT EXISTS contacts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      entity_id INTEGER REFERENCES entities(id),
      name TEXT NOT NULL,
      role TEXT,
      email TEXT,
      phone TEXT,
      personality_notes TEXT
    );

    CREATE TABLE IF NOT EXISTS platforms (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      entity_id INTEGER REFERENCES entities(id),
      name TEXT NOT NULL,
      status TEXT DEFAULT 'active',
      action TEXT DEFAULT 'consolidate',
      deadline TEXT,
      progress INTEGER DEFAULT 0,
      target_platform TEXT,
      notes TEXT
    );

    CREATE TABLE IF NOT EXISTS meetings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      entity_id INTEGER REFERENCES entities(id),
      contact_id INTEGER REFERENCES contacts(id),
      title TEXT,
      date TEXT,
      time TEXT,
      location TEXT,
      status TEXT DEFAULT 'scheduled',
      purpose TEXT,
      notes TEXT,
      summary TEXT
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
