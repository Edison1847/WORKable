const db = require('./db');
const fs = require('fs');
const path = require('path');

async function runSnapshot() {
    try {
        console.log('--- Manual Snapshot Start ---');
        const tables = ['companies', 'departments', 'roles', 'employees', 'diagnostics', 'nlp_signals'];
        const results = {};
        
        for (const table of tables) {
            console.log(`Reading ${table}...`);
            const res = await db.query(`SELECT * FROM ${table}`);
            results[table] = res.rows;
            console.log(`Read ${table}: ${res.rows.length} rows.`);
        }

        const data = {
            version: "5.1-MANUAL",
            timestamp: new Date().toISOString(),
            raw: results
        };

        const filename = `manual_recovery_${Date.now()}.json`;
        const dir = path.join(__dirname, 'backups');
        if (!fs.existsSync(dir)) fs.mkdirSync(dir);

        fs.writeFileSync(path.join(dir, filename), JSON.stringify(data, null, 2));
        console.log(`--- Snapshot Success: ${filename} ---`);
        process.exit(0);
    } catch (err) {
        console.error('Snapshot failed:', err);
        process.exit(1);
    }
}

runSnapshot();
