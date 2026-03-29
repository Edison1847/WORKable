const db = require('./db.js');

async function check() {
    try {
        console.log('--- Checking Audit Data ---');
        
        const dRes = await db.query('SELECT count(*) as cnt FROM diagnostics');
        const nRes = await db.query('SELECT count(*) as cnt FROM nlp_signals');
        
        const diagnosticsCount = dRes.rows[0].cnt;
        const nlpSignalsCount = nRes.rows[0].cnt;
        
        console.log(`Diagnostic Records: ${diagnosticsCount}`);
        console.log(`NLP Signal Records: ${nlpSignalsCount}`);
        
        if (diagnosticsCount > 0) {
            console.log('\n--- Sample Diagnostic (Latest) ---');
            const sampleD = await db.query('SELECT type, employee_name, created_at, payload FROM diagnostics ORDER BY created_at DESC LIMIT 1');
            const row = sampleD.rows[0];
            const payload = typeof row.payload === 'string' ? JSON.parse(row.payload) : row.payload;
            console.log(`Name: ${row.employee_name} | Type: ${row.type} | Created: ${row.created_at}`);
            console.log(`Payload Keys: ${Object.keys(payload).join(', ')}`);
        }
        
        if (nlpSignalsCount > 0) {
            console.log('\n--- Sample NLP Signal ---');
            const sampleN = await db.query('SELECT employee_name, question_label, signal_label, created_at FROM nlp_signals ORDER BY created_at DESC LIMIT 1');
            const row = sampleN.rows[0];
            console.log(`Name: ${row.employee_name} | Label: ${row.question_label} | Signal: ${row.signal_label} | Created: ${row.created_at}`);
        }
        
        process.exit(0);
    } catch (err) {
        console.error('Check failed:', err);
        process.exit(1);
    }
}

check();
