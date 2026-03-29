const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('workable.db');

console.log('--- DATABASE PERSISTENCE AUDIT ---');

db.serialize(() => {
    // Check Diagnostics
    db.all("SELECT type, COUNT(*) as count FROM diagnostics GROUP BY type", (err, rows) => {
        if (err) console.error('Error reading diagnostics:', err);
        else console.log('Diagnostics:', rows);
    });

    // Check Company Onboarding
    db.get("SELECT COUNT(*) as count FROM om_onboarding", (err, row) => {
        if (err) console.error('Error reading onboarding:', err);
        else console.log('Company Onboarding Records:', row ? row.count : 0);
    });

    // Check recent names for verification
    db.all("SELECT employee_name, type FROM diagnostics ORDER BY id DESC LIMIT 5", (err, rows) => {
        if (err) console.error('Error reading recent:', err);
        else {
            console.log('Most Recent Records:');
            rows.forEach(r => console.log(` - ${r.employee_name} (${r.type})`));
        }
    });
});

db.close(() => console.log('--- AUDIT COMPLETE ---'));
