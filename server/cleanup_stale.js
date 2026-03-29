const db = require('./db.js');

async function cleanup() {
    const validNames = ['Alice Smith','George','Mark','Tom','Jez','Robert','Tanya','Rose','Andrew'];
    
    console.log('--- Before Cleanup ---');
    const before = await db.query('SELECT employee_name, type FROM diagnostics');
    before.rows.forEach(r => console.log('  ' + r.employee_name + ' | ' + r.type));
    console.log('Total:', before.rows.length);

    // Delete orphaned diagnostics
    const placeholders = validNames.map((_, i) => '$' + (i + 1)).join(',');
    await db.query('DELETE FROM diagnostics WHERE employee_name NOT IN (' + placeholders + ')', validNames);
    await db.query('DELETE FROM nlp_signals WHERE employee_name NOT IN (' + placeholders + ')', validNames);

    console.log('\n--- After Cleanup ---');
    const after = await db.query('SELECT employee_name, type FROM diagnostics');
    after.rows.forEach(r => console.log('  ' + r.employee_name + ' | ' + r.type));
    console.log('Total:', after.rows.length);

    const nlp = await db.query('SELECT count(*) as c FROM nlp_signals');
    console.log('NLP Signals remaining:', nlp.rows[0].c);

    process.exit(0);
}

cleanup().catch(e => { console.error(e); process.exit(1); });
