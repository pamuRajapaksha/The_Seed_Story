
import * as SQLite from 'expo-sqlite';

export const db = SQLite.openDatabaseSync('seedstory.db');

export function initializeDatabase() {
  db.execSync(`
    CREATE TABLE IF NOT EXISTS seeds (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      season TEXT,
      duration TEXT NOT NULL,
      description TEXT
    );

    CREATE TABLE IF NOT EXISTS plantings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      seed_id INTEGER NOT NULL,
      planting_date TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      notes TEXT,
      FOREIGN KEY (seed_id) REFERENCES seeds(id)
    );

    
    CREATE TABLE IF NOT EXISTS germinations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      planting_id INTEGER NOT NULL,
      germination_date TEXT NOT NULL,
      germinated_quantity INTEGER NOT NULL,
      status TEXT NOT NULL,
      notes TEXT,
      FOREIGN KEY (planting_id) REFERENCES plantings(id)
    );

    CREATE TABLE IF NOT EXISTS growth_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      planting_id INTEGER NOT NULL,
      log_date TEXT NOT NULL,
      height REAL,
      notes TEXT,
      FOREIGN KEY (planting_id) REFERENCES plantings(id)
    );

    CREATE TABLE IF NOT EXISTS harvests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      planting_id INTEGER NOT NULL,
      harvest_date TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      weight REAL,
      notes TEXT,
      FOREIGN KEY (planting_id) REFERENCES plantings(id)
    );
  `);
}
