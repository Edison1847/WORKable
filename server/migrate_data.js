const sqlite3 = require('./node_modules/sqlite3');
const path = require('path');
const dbPath = path.resolve(__dirname, 'workable.db');
const db = new sqlite3.Database(dbPath);

console.log('Running Data Migration: Backfilling Energetic Days (Enthusiasm)...');

db.all("SELECT id, employee_name, payload, type FROM diagnostics", [], (err, rows) => {
    if (err) {
        console.error(err);
        return;
    }

    let updatedCount = 0;
    rows.forEach(row => {
        try {
            const payload = JSON.parse(row.payload);
            let updated = false;

            if (row.type === 'worker') {
                if (!payload.p4) payload.p4 = {};
                if (payload.p4.enthusiasm === undefined) {
                    const burnout = (payload.p1 && payload.p1.burnout) || 2;
                    payload.p4.enthusiasm = Math.floor(Math.random() * 5) + (25 - (burnout * 4)); 
                    updated = true;
                }
            } else if (row.type === 'supervisor') {
                 if (!payload.p3) payload.p3 = {};
                 if (payload.p3.enthusiasm === undefined) {
                    const burnout = (payload.p1 && payload.p1.burnout) || 2;
                    payload.p3.enthusiasm = Math.floor(Math.random() * 5) + (25 - (burnout * 4));
                    updated = true;
                 }
            }

            if (updated) {
                db.run("UPDATE diagnostics SET payload = ? WHERE id = ?", [JSON.stringify(payload), row.id]);
                updatedCount++;
            }
        } catch (e) {
            console.error(`Failed to parse payload for ID ${row.id}`);
        }
    });

    console.log(`Migration Complete. Updated ${updatedCount} records.`);
    setTimeout(() => db.close(), 1000);
});
