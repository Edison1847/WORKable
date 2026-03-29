const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('workable.db');

console.log('--- FINAL DATABASE PERSISTENCE CHECK ---');

db.serialize(() => {
    // 1. Diagnostics (Manager Audits)
    db.all("SELECT type, COUNT(*) as count FROM diagnostics GROUP BY type", (err, rows) => {
        if (err) console.error('Error reading diagnostics:', err);
        else console.log('Diagnostics:', rows);
    });

    // 2. Company Structure
    db.get("SELECT COUNT(*) as count FROM companies", (err, row) => {
        console.log('Company Records:', row ? row.count : 0);
    });
    db.get("SELECT COUNT(*) as count FROM departments", (err, row) => {
        console.log('Departments:', row ? row.count : 0);
    });
    db.get("SELECT COUNT(*) as count FROM roles", (err, row) => {
        console.log('Roles:', row ? row.count : 0);
    });
    db.get("SELECT COUNT(*) as count FROM employees", (err, row) => {
        console.log('Employees:', row ? row.count : 0);
    });

    // 3. Last 5 Activity Entries
    db.all("SELECT employee_name, type, created_at FROM diagnostics ORDER BY id DESC LIMIT 5", (err, rows) => {
        if (!err) {
            console.log('Latest Activity:');
            rows.forEach(r => console.log(` - ${r.employee_name} (${r.type}) at ${r.created_at}`));
        }
    });
});

db.close(() => console.log('--- VERIFICATION COMPLETE ---'));
