const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('workable.db');

const sql = process.argv[2];

if (!sql) {
    console.log('Usage: node query.js "YOUR SQL HERE"');
    process.exit(1);
}

db.all(sql, [], (err, rows) => {
    if (err) {
        console.error('SQL Error:', err.message);
    } else {
        console.table(rows);
    }
    db.close();
});
