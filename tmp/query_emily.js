const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.resolve(__dirname, 'server', 'workable.db');
const db = new sqlite3.Database(dbPath);

console.log('Querying for Emily...');
const query = "SELECT payload FROM diagnostics WHERE employee_name LIKE 'Emily%' AND type = 'worker' ORDER BY created_at DESC LIMIT 1";

db.get(query, [], (err, row) => {
    if (err) {
        console.error('Error:', err.message);
    } else if (row) {
        console.log('--- FOUND RECORD ---');
        console.log(JSON.stringify(JSON.parse(row.payload), null, 4));
    } else {
        console.log('No record found for Emily.');
        // Check all workers to see what's available
        db.all("SELECT employee_name FROM diagnostics WHERE type = 'worker'", [], (err, rows) => {
             if (rows && rows.length > 0) {
                 console.log('Available workers:', rows.map(r => r.employee_name).join(', '));
             }
        });
    }
    db.close();
});
