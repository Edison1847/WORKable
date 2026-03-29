const { query, exec } = require('./db.js');

async function recover() {
    try {
        console.log('--- Starting Data Recovery ---');
        
        // 1. Fetch all diagnostics
        const { rows } = await query('SELECT * FROM diagnostics');
        if (rows.length === 0) {
            console.log('No diagnostics found to recover from.');
            return;
        }

        const companyName = "Analogy"; // Derived from project path
        const depts = new Map(); // name -> id
        const roles = new Map(); // deptId+title -> role
        const employees = new Map(); // name -> emp

        // 2. Process payloads to extract structure
        for (const row of rows) {
            const payload = typeof row.payload === 'string' ? JSON.parse(row.payload) : row.payload;
            const name = row.employee_name;
            const deptName = row.department_name && row.department_name !== 'default' ? row.department_name : (payload.dept || 'Operations');
            const roleTitle = payload.supervisorRole || payload.roleTitle || (row.type === 'supervisor' ? 'Supervisor' : 'Worker');
            
            // Collect Dept
            if (!depts.has(deptName)) {
                depts.set(deptName, `d${depts.size + 1}`);
            }
            const deptId = depts.get(deptName);

            // Collect Role
            const roleKey = `${deptId}:${roleTitle}`;
            if (!roles.has(roleKey)) {
                roles.set(roleKey, { id: `r${roles.size + 1}`, deptId, title: roleTitle });
            }

            // Collect Employee
            if (!employees.has(name)) {
                employees.set(name, { id: `e${employees.size + 1}`, name, role: roleTitle, deptId });
            }
        }

        // 3. Perform atomic restoration
        await query('BEGIN');
        
        // Clear current structure (but not diagnostics!)
        await query('DELETE FROM roles');
        await query('DELETE FROM employees');
        await query('DELETE FROM departments');
        await query('DELETE FROM companies');

        // Insert Company
        await query('INSERT INTO companies (id, name, industry, headcount, currency) VALUES (1, $1, $2, $3, $4)', 
            [companyName, 'Consulting', '51-200', 'USD']);

        // Insert Depts
        for (const [name, id] of depts.entries()) {
            await query('INSERT INTO departments (id, company_id, name) VALUES ($1, 1, $2)', [id, name]);
        }

        // Insert Roles
        for (const role of roles.values()) {
            await query('INSERT INTO roles (id, department_id, title) VALUES ($1, $2, $3)', [role.id, role.deptId, role.title]);
        }

        // Insert Employees
        for (const emp of employees.values()) {
            // Re-map managers if possible (CEO has no manager)
            const manager = emp.role.toLowerCase().includes('ceo') ? 'None' : 'Alice Smith'; 
            await query('INSERT INTO employees (id, company_id, name, role, manager, department_id) VALUES ($1, $2, $3, $4, $5, $6)', 
                [emp.id, 1, emp.name, emp.role, manager, emp.deptId]);
        }

        await query('COMMIT');
        console.log('--- Recovery Complete ---');
        console.log(`Recovered: ${depts.size} departments, ${roles.size} roles, ${employees.size} employees.`);
        
    } catch (err) {
        await query('ROLLBACK').catch(() => {});
        console.error('Recovery failed:', err);
    }
}

recover();
