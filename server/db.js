const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Use a local file workable.db instead of a server
const db = new sqlite3.Database(path.join(__dirname, 'workable.db'));

// Compatibility layer for pg patterns used in server.js
const queryWrapper = (text, params = []) => {
    // Convert $1, $2 to ? for SQLite
    const sqliteSql = text.replace(/\$\d+/g, '?');
    
    return new Promise((resolve, reject) => {
        // Simple heuristic to distinguish SELECT/RETURNING vs other commands
        const normalizedSql = sqliteSql.trim().toUpperCase();
        const isQuery = normalizedSql.startsWith('SELECT') || normalizedSql.includes('RETURNING') || normalizedSql.startsWith('PRAGMA');
        
        if (isQuery) {
            db.all(sqliteSql, params, (err, rows) => {
                if (err) reject(err);
                else resolve({ rows });
            });
        } else {
            db.run(sqliteSql, params, function(err) {
                if (err) reject(err);
                else {
                    resolve({ 
                        rows: [], 
                        lastID: this.lastID, 
                        changes: this.changes,
                        rowCount: this.changes // To mimic pg's rowCount
                    });
                }
            });
        }
    });
};

module.exports = {
  query: queryWrapper,
  exec: (text) => {
    return new Promise((resolve, reject) => {
        db.exec(text, (err) => {
            if (err) reject(err);
            else resolve();
        });
    });
  },
  // To mimic pooling for transactions
  connect: async () => {
    return {
       query: queryWrapper,
       release: () => {}
    };
  },
  pool: {
     connect: async () => {
        return {
           query: queryWrapper,
           release: () => {}
        };
     }
  }
};
