const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.resolve(__dirname, 'server', 'workable.db');
const db = new sqlite3.Database(dbPath);

console.log('Searching for John Brown...');
const query = "SELECT payload FROM diagnostics WHERE employee_name LIKE 'John Brown%' AND type = 'worker' ORDER BY created_at DESC LIMIT 1";

db.get(query, [], (err, row) => {
    if (err) {
        console.error('Error:', err.message);
    } else if (row) {
        const data = JSON.parse(row.payload);
        console.log('--- FOUND JOHN BROWN ---');
        console.log('Energetic Days Answer:', data.p4 ? data.p4.enthusiasm : 'Not in p4', '/ 30');
        console.log('Full p4 payload:', JSON.stringify(data.p4, null, 2));
    } else {
        console.log('No worker diagnostic found for John Brown. Searching all diagnostics...');
        db.all("SELECT employee_name, type FROM diagnostics WHERE employee_name LIKE 'John Brown%'", [], (err, rows) => {
             if (rows && rows.length > 0) {
                 console.log('Matches:', JSON.stringify(rows));
             } else {
                 console.log('No diagnostic at all for John Brown.');
             }
        });
    }
    db.close();
});
