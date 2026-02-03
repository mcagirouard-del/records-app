const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
const dbDir = path.join(projectRoot, 'src', 'db');
const dbPath = path.join(dbDir, 'p-records.db');

if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new Database(dbPath);

// Create table matching app schema
db.exec(`
CREATE TABLE IF NOT EXISTS records (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  full_name TEXT NOT NULL,
  email TEXT,
  web_address TEXT,
  username TEXT,
  password TEXT,
  home_address TEXT,
  optional_info TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);
`);

// Verify table exists and print schema info
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
console.log('Tables:', tables.map(t => t.name));

const cols = db.prepare("PRAGMA table_info('records')").all();
console.log('records columns:');
cols.forEach(c => console.log(`  ${c.cid}: ${c.name} ${c.type} ${c.notnull ? 'NOT NULL' : ''} ${c.dflt_value ? `DEFAULT ${c.dflt_value}` : ''}`));

console.log('\nDatabase created at:', dbPath);

db.close();
