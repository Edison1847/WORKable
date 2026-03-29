const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('workable.db');

console.log('--- PURGING WORKER DIAGNOSTIC DATA ---');

db.serialize(() => {
    // Delete worker diagnostics
    db.run("DELETE FROM diagnostics WHERE type = 'worker'", function(err) {
        if (err) console.error('Error deleting diagnostics:', err);
        else console.log(`Deleted ${this.changes} worker diagnostics.`);
    });

    // Delete related NLP signals
    db.run("DELETE FROM nlp_signals WHERE diagnostic_type = 'worker'", function(err) {
        if (err) console.error('Error deleting NLP signals:', err);
        else console.log(`Deleted ${this.changes} worker NLP signals.`);
    });
});

db.close(() => console.log('--- PURGE COMPLETE ---'));
