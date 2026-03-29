const { query } = require('./db.js');

async function revert() {
    try {
        console.log('--- Reverting Data Recovery ---');
        
        await query('BEGIN');
        
        // Clear recovered structure
        await query('DELETE FROM roles');
        await query('DELETE FROM employees');
        await query('DELETE FROM departments');
        await query('DELETE FROM companies');

        // Restore the original "empty" state I saw earlier
        // Company ID 1 with empty strings
        await query('INSERT INTO companies (id, name, industry, headcount, currency, financial_year, created_at) VALUES (1, "", "", "", "USD", "Jan-Dec", "2026-03-27 23:49:41")');

        // Restore default departments
        const depts = [
            { id: 'd1', name: 'Operations' },
            { id: 'd2', name: 'Engineering' },
            { id: 'd3', name: 'Sales' },
            { id: 'd4', name: 'Marketing' },
            { id: 'd5', name: 'HR' }
        ];
        for (const d of depts) {
            await query('INSERT INTO departments (id, company_id, name) VALUES ($1, 1, $2)', [d.id, d.name]);
        }

        // Restore default employee
        await query('INSERT INTO employees (id, company_id, name, role, manager, department_id) VALUES ("e1", 1, "Alice Smith", "CEO", "None", "d1")');

        await query('COMMIT');
        console.log('--- Revert Complete ---');
        
    } catch (err) {
        await query('ROLLBACK').catch(() => {});
        console.error('Revert failed:', err);
    }
}

revert();
