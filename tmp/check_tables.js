const sqlite3 = require('../server/node_modules/sqlite3').verbose();
const db = new sqlite3.Database('./workable.db');

const tables = ['companies', 'departments', 'roles', 'employees', 'diagnostics', 'nlp_signals'];
let done = 0;

tables.forEach(t => {
  db.get(`SELECT COUNT(*) as c FROM ${t}`, (err, row) => {
    if (err) {
      console.log(`${t}: ERROR - ${err.message}`);
    } else {
      console.log(`${t}: ${row.c}`);
    }
    done++;
    if (done === tables.length) {
      db.close();
    }
  });
});
