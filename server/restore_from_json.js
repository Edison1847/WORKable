const db = require('./db');
const data = require('./company_data.json');

async function restore() {
  try {
    console.log('--- Restoring from company_data.json ---');
    const { company, financials, departments, employees } = data;

    await db.query('BEGIN');

    // 1. Upsert Company
    await db.query(
      `INSERT INTO companies (id, name, industry, headcount, currency, financial_year, revenue_target, total_salary_budget)
       VALUES (1, $1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (id) DO UPDATE SET 
       name = EXCLUDED.name, industry = EXCLUDED.industry, headcount = EXCLUDED.headcount, 
       currency = EXCLUDED.currency, financial_year = EXCLUDED.financial_year, 
       revenue_target = EXCLUDED.revenue_target, total_salary_budget = EXCLUDED.total_salary_budget`,
      [company.name, company.industry, company.headcount, company.currency, company.financialYear, financials.revenueTarget, financials.totalSalaryBudget]
    );
    const companyId = 1;

    // 2. Clear old structure
    await db.query('DELETE FROM roles WHERE department_id IN (SELECT id FROM departments WHERE company_id = $1)', [companyId]);
    await db.query('DELETE FROM departments WHERE company_id = $1', [companyId]);
    await db.query('DELETE FROM employees WHERE company_id = $1', [companyId]);

    // 3. Insert Departments & Roles
    for (const dept of departments) {
      await db.query('INSERT INTO departments (id, company_id, name) VALUES ($1, $2, $3)', [dept.id, companyId, dept.name]);
      for (const role of (dept.roles || [])) {
        await db.query(
          'INSERT INTO roles (id, department_id, title, grade, min_salary, max_salary) VALUES ($1, $2, $3, $4, $5, $6)',
          [role.id, dept.id, role.title, role.grade, role.minSalary, role.maxSalary]
        );
      }
    }

    // 4. Insert Employees
    for (const emp of employees) {
      await db.query(
        'INSERT INTO employees (id, company_id, name, role, manager, department_id) VALUES ($1, $2, $3, $4, $5, $6)',
        [emp.id, companyId, emp.name, emp.role, emp.manager, emp.departmentId]
      );
    }

    await db.query('COMMIT');

    // Verify
    const c = await db.query('SELECT count(*) as cnt FROM companies');
    const d = await db.query('SELECT count(*) as cnt FROM departments');
    const r = await db.query('SELECT count(*) as cnt FROM roles');
    const e = await db.query('SELECT count(*) as cnt FROM employees');
    console.log(`Companies: ${c.rows[0].cnt}, Departments: ${d.rows[0].cnt}, Roles: ${r.rows[0].cnt}, Employees: ${e.rows[0].cnt}`);
    console.log('--- Restore Complete! Refresh your browser. ---');
    process.exit(0);
  } catch (err) {
    await db.query('ROLLBACK').catch(() => {});
    console.error('Restore failed:', err);
    process.exit(1);
  }
}

restore();
