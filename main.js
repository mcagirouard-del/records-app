const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');

let mainWindow;
let db;

const dbDir = path.join(__dirname, 'src/db');
const dbPath = path.join(dbDir, 'p-records.db');

function initDatabase() {
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }
  db = new Database(dbPath);
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
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 700,
    webPreferences: {
      preload: path.join(__dirname, 'src/preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173'); // Vite dev server
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, 'dist/index.html'));
  }
}

app.whenReady().then(() => {
  initDatabase();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// IPC Handlers
ipcMain.handle('search-records', async (event, term) => {
  if (!db) return [];
  const query = term && term.trim()
    ? `SELECT * FROM records WHERE 
         full_name LIKE ? OR email LIKE ? OR web_address LIKE ? OR 
         username LIKE ? OR home_address LIKE ? OR optional_info LIKE ?
         ORDER BY created_at DESC`
    : `SELECT * FROM records ORDER BY created_at DESC`;
  const stmt = db.prepare(query);
  const params = term && term.trim() ? Array(6).fill(`%${term.trim()}%`) : [];
  return stmt.all(...params);
});

ipcMain.handle('save-record', async (event, record) => {
  if (!db) throw new Error('DB not initialized');
  if (!record.full_name || !record.full_name.trim()) {
    throw new Error('Full Name is required');
  }
  const fields = ['full_name', 'email', 'web_address', 'username', 'password', 'home_address', 'optional_info'];
  if (record.id) {
    const setClause = fields.map(f => `${f} = ?`).join(', ');
    const stmt = db.prepare(`UPDATE records SET ${setClause} WHERE id = ?`);
    stmt.run(record.full_name, record.email || null, record.web_address || null, record.username || null, record.password || null, record.home_address || null, record.optional_info || null, record.id);
    return { success: true, id: record.id };
  } else {
    const placeholders = fields.map(() => '?').join(', ');
    const stmt = db.prepare(`INSERT INTO records (${fields.join(', ')}) VALUES (${placeholders})`);
    const info = stmt.run(record.full_name, record.email || null, record.web_address || null, record.username || null, record.password || null, record.home_address || null, record.optional_info || null);
    return { success: true, id: info.lastInsertRowid };
  }
});