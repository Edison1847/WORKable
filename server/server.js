const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const db = require('./db');
const nlp = require('./nlp');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());

// ── Create nlp_signals table on startup (temporary store, non-destructive) ──
db.exec(`
  CREATE TABLE IF NOT EXISTS nlp_signals (
    id               INTEGER PRIMARY KEY AUTOINCREMENT,
    company_id       INTEGER,
    employee_name    TEXT,
    department_name  TEXT,
    diagnostic_type  TEXT,
    question         TEXT,
    question_label   TEXT,
    raw_text         TEXT,
    sentiment        TEXT,
    sentiment_score  REAL,
    sentiment_detail TEXT,
    urgency          TEXT,
    urgency_score    REAL,
    urgency_detail   TEXT,
    signal           TEXT,
    signal_emoji     TEXT,
    signal_label     TEXT,
    interpretation   TEXT,
    created_at       DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`).catch(err => console.error('Failed to create nlp_signals table:', err));

// Helper to initialize DB (for prototype ease)
app.post('/api/init-db', async (req, res) => {
    try {
        const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
        await db.exec(schema);
        res.json({ success: true, message: 'Database schema initialized.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to init DB' });
    }
});

// GET debug John Brown
app.get('/api/debug/john-brown', async (req, res) => {
    try {
        const row = await db.query("SELECT payload FROM diagnostics WHERE employee_name LIKE 'John Brown%' AND type = 'worker' ORDER BY created_at DESC LIMIT 1");
        if (row.rows[0]) {
            res.json(JSON.parse(row.rows[0].payload));
        } else {
            res.status(404).json({ error: 'John Brown not found' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET company setup
app.get('/api/company-setup', async (req, res) => {
    try {
        res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
        const companyRes = await db.query('SELECT * FROM companies LIMIT 1');
        if (companyRes.rows.length === 0) return res.json({});

        const company = companyRes.rows[0];
        const deptsRes = await db.query('SELECT * FROM departments WHERE company_id = $1', [company.id]);
        const employeesRes = await db.query('SELECT * FROM employees WHERE company_id = $1', [company.id]);
        
        const departments = await Promise.all(deptsRes.rows.map(async (dept) => {
            const rolesRes = await db.query('SELECT * FROM roles WHERE department_id = $1', [dept.id]);
            return {
                id: dept.id,
                name: dept.name,
                roles: rolesRes.rows.map(r => ({
                    id: r.id,
                    title: r.title,
                    grade: r.grade,
                    minSalary: r.min_salary,
                    maxSalary: r.max_salary
                }))
            };
        }));

        const diagnosticsRes = await db.query('SELECT type, employee_name, payload FROM diagnostics WHERE company_id = $1', [company.id]);

        // Helper to get type if legacy null
        const parseType = (row) => {
            if (row.type) return row.type;
            const p = typeof row.payload === 'string' ? JSON.parse(row.payload) : row.payload;
            if (!p) return null;
            if (p.supervisorRole || p.q1_orgHealth !== undefined) return 'supervisor';
            if (p.q4_energyScore !== undefined || p.experienceYears !== undefined) return 'worker';
            return null;
        };

        const diagnostics = diagnosticsRes.rows.map(row => {
            const parsedPayload = typeof row.payload === 'string' ? JSON.parse(row.payload) : row.payload;
            return {
                employee_name: row.employee_name,
                type: parseType(row),
                payload: parsedPayload
            };
        });

        res.json({
            company: {
                name: company.name,
                industry: company.industry,
                headcount: company.headcount,
                currency: company.currency,
                financialYear: company.financial_year
            },
            financials: {
                revenueTarget: company.revenue_target,
                totalSalaryBudget: company.total_salary_budget
            },
            departments,
            employees: employeesRes.rows.map(e => ({
                id: e.id,
                name: e.name,
                role: e.role,
                manager: e.manager,
                departmentId: e.department_id,
                is_ai: e.is_ai === 1
            })),
            diagnostics
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch company setup' });
    }
});

// Save company setup with departments and roles
app.post('/api/company-setup', async (req, res) => {
    try {
        await db.query('BEGIN IMMEDIATE');
        const { company, financials, departments, employees } = req.body;

        // 1. Upsert Company (Assuming single company for now)
        await db.query(
            `INSERT INTO companies (id, name, industry, headcount, currency, financial_year, revenue_target, total_salary_budget)
             VALUES (1, $1, $2, $3, $4, $5, $6, $7)
             ON CONFLICT (id) DO UPDATE SET 
             name = EXCLUDED.name, industry = EXCLUDED.industry, headcount = EXCLUDED.headcount, currency = EXCLUDED.currency, financial_year = EXCLUDED.financial_year, revenue_target = EXCLUDED.revenue_target, total_salary_budget = EXCLUDED.total_salary_budget`,
            [company.name, company.industry, company.headcount, company.currency, company.financialYear, financials.revenueTarget, financials.totalSalaryBudget]
        );
        const companyId = 1;

        // 2. Clear old structure for this company
        // Explicitly delete roles first because SQLite foreign key cascade is off by default
        await db.query('DELETE FROM roles WHERE department_id IN (SELECT id FROM departments WHERE company_id = $1)', [companyId]);
        await db.query('DELETE FROM departments WHERE company_id = $1', [companyId]);
        await db.query('DELETE FROM employees WHERE company_id = $1', [companyId]);

        // 3. Insert Departments & Roles
        for (const dept of departments) {
            await db.query(
                'INSERT INTO departments (id, company_id, name) VALUES ($1, $2, $3)',
                [dept.id, companyId, dept.name]
            );

            for (const role of dept.roles) {
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
        res.json({ success: true });
    } catch (err) {
        await db.query('ROLLBACK');
        console.error(err);
        res.status(500).json({ error: 'Failed to save company setup' });
    }
});

// DEBUG: Get all raw data
app.get('/api/debug-data', async (req, res) => {
    try {
        const companies = await db.query('SELECT * FROM companies');
        const departments = await db.query('SELECT * FROM departments');
        const roles = await db.query('SELECT * FROM roles');
        const employees = await db.query('SELECT * FROM employees');
        const diagnostics = await db.query('SELECT * FROM diagnostics');
        
        res.json({
            companies: companies.rows,
            departments: departments.rows,
            roles: roles.rows,
            employees: employees.rows,
            diagnostics: diagnostics.rows.map(d => ({ ...d, payload: typeof d.payload === 'string' ? JSON.parse(d.payload) : d.payload }))
        });
    } catch (err) {
        console.error('Debug API Error:', err);
        res.status(500).json({ error: 'Failed to fetch debug data', details: err.message });
    }
});

// GET diagnostics data
app.get('/api/intake', async (req, res) => {
    try {
        res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
        
        // Fetch all diagnostics, most recent first
        const allRes = await db.query('SELECT * FROM diagnostics ORDER BY created_at DESC');
        
        const parse = (row) => {
            if (!row) return null;
            const payload = typeof row.payload === 'string' ? JSON.parse(row.payload) : row.payload;
            return {
                ...payload,
                employee_name: row.employee_name,
                type: row.type || (payload.supervisorRole ? 'supervisor' : 'worker')
            };
        };

        const allMapped = allRes.rows.map(parse);

        // Find latest supervisor and worker (latest index-0 of their respective types)
        const latestSupervisor = allMapped.find(p => p.type === 'supervisor');
        const latestWorker = allMapped.find(p => p.type === 'worker');

        res.json({ 
            supervisor: latestSupervisor,
            worker: latestWorker,
            all_diagnostics: allMapped,
            mocks: [] 
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed' });
    }
});

// GET external market signals (Strategic Competitive Intelligence)
app.get('/api/market-signals', (req, res) => {
    const signals = [
        {
            source: "Forrester Research",
            text: "High-maturity firms outperforming peers by 22% through real-time data democratization and self-service BI.",
            category: "MARKET ALPHA"
        },
        {
            source: "McKinsey Global Institute",
            text: "Organizational productivity in 2025 is driven by 'AI-driven business transformation' vs simple tool adoption.",
            category: "TECH TREND"
        },
        {
            source: "Gartner Strategy",
            text: "72% of leading firms are prioritizing 'Strategic Technology Utilization' to eliminate low-value task congestion.",
            category: "OPERATIONAL"
        },
        {
            source: "Market Signal",
            text: "Global workforce trends show 'Focus Time' optimization is now more valuable than physical presence for ROI.",
            category: "CULTURAL"
        },
        {
            source: "Economic Forecast",
            text: "Competitive advantage in Q3 will belong to firms that bridge the AI-skill gap through proactive upskilling.",
            category: "STRATEGIC"
        }
    ];
    res.json(signals);
});

// POST new intake data
app.post('/api/intake', async (req, res) => {
    try {
        const { company_id = 1, type, intake_data, supervisor_diagnostic, worker_diagnostic, worker_profile } = req.body;

        // Final payload depending on who submitted
        let payload = intake_data;
        if (supervisor_diagnostic) {
            payload = supervisor_diagnostic;
        } else if (worker_diagnostic || worker_profile) {
            payload = { ...(worker_profile || {}), ...(worker_diagnostic || {}) };
        }

        const name = payload?.name || 'anonymous';
        const dept = payload?.dept || 'default';
        const type_tag = type || (supervisor_diagnostic ? 'supervisor' : 'worker');

        await db.query('BEGIN IMMEDIATE');
        try {
            // Check if an existing draft exists to merge
            const existingRes = await db.query(
                'SELECT payload FROM diagnostics WHERE employee_name = $1 AND type = $2',
                [name, type_tag]
            );
            
            if (existingRes.rows.length > 0) {
                let existingPayload = {};
                try {
                    existingPayload = typeof existingRes.rows[0].payload === 'string' 
                        ? JSON.parse(existingRes.rows[0].payload) 
                        : existingRes.rows[0].payload;
                } catch (e) {}
                // Merge the new incoming fields with the existing fields (ideal for progressive multi-page saves)
                payload = { ...existingPayload, ...payload };
            }

            // Remove old diagnostic record for this person + type to keep only the latest merged one
            await db.query(
                'DELETE FROM diagnostics WHERE employee_name = $1 AND type = $2',
                [name, type_tag]
            );

            await db.query(
                'INSERT INTO diagnostics (company_id, type, employee_name, department_name, payload, is_ai) VALUES ($1, $2, $3, $4, $5, 0)',
                [company_id, type_tag, name, dept, JSON.stringify(payload)]
            );
            await db.query('COMMIT');
        } catch (innerErr) {
            await db.query('ROLLBACK');
            throw innerErr;
        }

        // ── NLP analysis on Q9, Q11, Q14 free-text fields (Only if marked complete or has those fields) ──────────────────

        const nlpResults = nlp.analysePayload(payload);

        if (nlpResults.length > 0) {
            // Remove previous NLP signals for this person (keep only latest)
            await db.query(
                'DELETE FROM nlp_signals WHERE employee_name = $1 AND diagnostic_type = $2',
                [name, type_tag]
            );

            for (const r of nlpResults) {
                await db.query(
                    `INSERT INTO nlp_signals
                       (company_id, employee_name, department_name, diagnostic_type,
                        question, question_label, raw_text,
                        sentiment, sentiment_score, sentiment_detail,
                        urgency, urgency_score, urgency_detail,
                        signal, signal_emoji, signal_label, interpretation, is_ai)
                     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17, 0)`,
                    [
                        company_id, name, dept, type_tag,
                        r.question, r.question_label, r.raw_text,
                        r.sentiment, r.sentiment_score, r.sentiment_detail,
                        r.urgency, r.urgency_score, r.urgency_detail,
                        r.signal, r.signal_emoji, r.signal_label, r.interpretation,
                    ]
                );
                console.log(`[NLP] ${name} · ${r.question} → ${r.signal_emoji} ${r.signal_label} | sentiment: ${r.sentiment} | urgency: ${r.urgency}`);
            }
        }

        res.json({ success: true, message: 'Latest record saved and old records purged.', nlp_signals: nlpResults.length });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed' });
    }
});

// Purge incomplete drafts if the user abandons the flow
app.delete('/api/intake/drafts/cleanup', async (req, res) => {
    try {
        const { employee_name, type } = req.body;
        if (!employee_name || !type) return res.status(400).json({ error: 'Missing name or type' });

        const existingRes = await db.query(
            'SELECT id, payload FROM diagnostics WHERE employee_name = $1 AND type = $2 AND is_ai = 0',
            [employee_name, type]
        );

        if (existingRes.rows.length > 0) {
            let payload = {};
            try {
                payload = typeof existingRes.rows[0].payload === 'string' 
                    ? JSON.parse(existingRes.rows[0].payload) 
                    : existingRes.rows[0].payload;
            } catch (e) {}
            
            if (payload.status === 'draft') {
                await db.query('DELETE FROM diagnostics WHERE id = $1', [existingRes.rows[0].id]);
                // Ensure no NLP signals are left behind for this draft
                await db.query('DELETE FROM nlp_signals WHERE employee_name = $1 AND diagnostic_type = $2 AND is_ai = 0', [employee_name, type]);
                return res.json({ success: true, message: 'Incomplete draft purged.' });
            }
        }
        res.json({ success: true, message: 'No draft to purge.' });
    } catch (err) {
        console.error('Draft cleanup error:', err);
        res.status(500).json({ error: 'Failed to purge draft' });
    }
});

// GET NLP signals — all or filtered by employee
app.get('/api/nlp-signals', async (req, res) => {
    try {
        res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
        const { employee, signal, question } = req.query;

        let sql    = 'SELECT * FROM nlp_signals WHERE 1=1';
        const params = [];
        let idx = 1;

        if (employee) { sql += ` AND employee_name = $${idx++}`; params.push(employee); }
        if (signal)   { sql += ` AND signal = $${idx++}`;        params.push(signal); }
        if (question) { sql += ` AND question = $${idx++}`;       params.push(question); }

        sql += ' ORDER BY created_at DESC';

        const result = await db.query(sql, params);
        res.json({ signals: result.rows, count: result.rows.length });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch NLP signals' });
    }
});

// AI Synthetic Workforce Generation Endpoint
app.post('/api/synthesize-workforce', async (req, res) => {
    try {
        const companyRes = await db.query('SELECT * FROM companies LIMIT 1');
        if (companyRes.rows.length === 0) return res.status(404).json({ error: 'Company not found' });
        
        const companyId = companyRes.rows[0].id;
        const targetHeadcount = parseInt(companyRes.rows[0].headcount) || 25;
        
        // 1. Get current real employees and diagnostics
        const employeesRes = await db.query('SELECT * FROM employees WHERE company_id = $1', [companyId]);
        const diagnosticsRes = await db.query('SELECT * FROM diagnostics WHERE company_id = $1', [companyId]);
        const deptsRes = await db.query('SELECT * FROM departments WHERE company_id = $1', [companyId]);
        const rolesRes = await db.query('SELECT * FROM roles WHERE department_id IN (SELECT id FROM departments WHERE company_id = $1)', [companyId]);

        const existingEmployees = employeesRes.rows;
        const existingDiagnostics = diagnosticsRes.rows;
        const depts = deptsRes.rows;
        const validRoles = rolesRes.rows.filter(r => r.title.toUpperCase() !== 'CEO');

        if (depts.length === 0 || validRoles.length === 0) {
            return res.status(400).json({ error: 'No departments or roles available for synthesis.' });
        }

        const firstNames = ['John', 'Jane', 'Michael', 'Sarah', 'David', 'Emma', 'James', 'Emily', 'Daniel', 'Olivia', 'Chris', 'Anna', 'Lucas', 'Mia', 'Ethan', 'Sophia'];
        const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson'];
        const generateName = () => `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
        
        const nlpPhrases = {
            blockers: ['Lack of cross-functional resources', 'Legacy tooling is slowing us down', 'Unclear target definitions', 'Too many meetings', 'Communication gaps between teams', 'Resource delays'],
            innovation: ['Incorporate more AI automation', 'Streamline the approval process', 'Better internal documentation', 'Upgrade our core stack', 'More flexible working hours', 'Direct feedback loops'],
            aspiration: ['Leading the market with AI-driven products', 'Seamless execution across regions', 'Highly automated and efficient core', 'Culture of rapid experimentation', 'Scale to 100+ nodes globally']
        };

        const batchUuid = `batch_${Date.now()}`;
        let syntheticEmployees = [];
        let syntheticDiagnostics = [];
        const existingNames = existingEmployees.map(e => e.name);

        // --- PART A: Fill audit gaps for EXISTING employees ---
        for (const emp of existingEmployees) {
            // CEO (usually no manager) doesn't need worker/supervisor self-audit in the same way, or maybe they do?
            // In our system, CEO is the "top" node.
            const isCEO = emp.role?.toUpperCase() === 'CEO' || !emp.manager || emp.manager === 'None';
            if (isCEO) continue;

            const name = emp.name;
            const dept = depts.find(d => d.id === emp.department_id) || { name: 'Operations' };
            const manager = emp.manager || 'CEO';
            
            // Check if worker/supervisor audits exist for this specific person
            const hasWorker = existingDiagnostics.some(d => d.employee_name === name && d.type === 'worker');
            const hasSupervisor = existingDiagnostics.some(d => d.employee_name === name && d.type === 'supervisor');

            if (!hasWorker) {
                syntheticDiagnostics.push({
                    company_id: companyId,
                    type: 'worker',
                    employee_name: name,
                    department_name: dept.name,
                    payload: JSON.stringify(generateAuditPayload('worker', name, dept.name, emp.role, manager, nlpPhrases, batchUuid)),
                    is_ai: 1
                });
            }
            if (!hasSupervisor) {
                syntheticDiagnostics.push({
                    company_id: companyId,
                    type: 'supervisor',
                    employee_name: name,
                    department_name: dept.name,
                    payload: JSON.stringify(generateAuditPayload('supervisor', name, dept.name, emp.role, manager, nlpPhrases, batchUuid)),
                    is_ai: 1
                });
            }
        }

        // --- PART B: Generate NEW employees to fill headcount GAP ---
        const currentCount = existingEmployees.length;
        const remainingToTarget = Math.max(0, targetHeadcount - currentCount);

        for (let i = 0; i < remainingToTarget; i++) {
            let name = generateName();
            while (existingNames.includes(name)) name = `${name} ${i}`; 
            existingNames.push(name);

            const role = validRoles[Math.floor(Math.random() * validRoles.length)];
            const dept = depts.find(d => d.id === role.department_id);
            const possibleManagers = [...existingNames.filter(n => n !== name)];
            const manager = possibleManagers.length > 0 ? possibleManagers[Math.floor(Math.random() * possibleManagers.length)] : 'CEO';

            const empId = `ai_${Date.now()}_${i}`;
            syntheticEmployees.push({
                id: empId,
                name: name,
                role: role.title,
                manager: manager,
                department_id: dept.id,
                is_ai: 1
            });

            // Every new AI employee gets both audits
            syntheticDiagnostics.push({
                company_id: companyId, type: 'worker', employee_name: name, department_name: dept.name,
                payload: JSON.stringify(generateAuditPayload('worker', name, dept.name, role.title, manager, nlpPhrases, batchUuid)),
                is_ai: 1
            });
            syntheticDiagnostics.push({
                company_id: companyId, type: 'supervisor', employee_name: name, department_name: dept.name,
                payload: JSON.stringify(generateAuditPayload('supervisor', name, dept.name, role.title, manager, nlpPhrases, batchUuid)),
                is_ai: 1
            });
        }

        if (req.body.preview) {
            return res.json({ 
                success: true, 
                createdEmployees: syntheticEmployees.length,
                backfilledAudits: syntheticDiagnostics.length - (syntheticEmployees.length * 2),
                syntheticEmployees, 
                syntheticDiagnostics, 
                batchUuid 
            });
        }

        // --- PART C: COMMIT (Wait, this is un-previewed mode, should we commit? Yes) ---
        // Robust transaction with manual lock/retry or just sequential
        // To be SAFE from "SQLITE_BUSY", we'll do it all at once if possible or just rely on the existing BEGIN/COMMIT
        try {
            await db.query('BEGIN IMMEDIATE');
            for (const emp of syntheticEmployees) {
                await db.query(
                    'INSERT INTO employees (id, company_id, name, role, manager, department_id, is_ai) VALUES ($1, $2, $3, $4, $5, $6, 1)',
                    [emp.id, companyId, emp.name, emp.role, emp.manager, emp.department_id]
                );
            }
            for (const diag of syntheticDiagnostics) {
                await db.query(
                    'INSERT INTO diagnostics (company_id, type, employee_name, department_name, payload, is_ai) VALUES ($1, $2, $3, $4, $5, 1)',
                    [companyId, diag.type, diag.employee_name, diag.department_name, diag.payload]
                );
            }
            await db.query('COMMIT');
            res.json({ success: true, createdCount: syntheticEmployees.length, batchUuid });
        } catch (txErr) {
            await db.query('ROLLBACK').catch(() => {});
            throw txErr;
        }

    } catch (err) {
        console.error('Synthesis Error:', err);
        res.status(500).json({ error: err.message || 'Failed to synthesize workforce' });
    }
});

// Helper for generating payloads
function generateAuditPayload(type, name, deptName, roleTitle, manager, phrases, batchUuid) {
    const activitiesList = ['Resource Allocation', 'Project Oversight', 'Technical Leadership', 'Stakeholder Management', 'Process Refinement', 'Code Review', 'Client Interaction', 'Strategy Sync'];
    const myActivities = [
        activitiesList[Math.floor(Math.random() * activitiesList.length)],
        activitiesList[Math.floor(Math.random() * activitiesList.length)],
        activitiesList[Math.floor(Math.random() * activitiesList.length)]
    ].filter((v, i, a) => a.indexOf(v) === i); // unique

    if (type === 'worker') {
        const activityDetails = myActivities.map(act => ({
            name: act,
            contrib: ['High', 'Med', 'Low'][Math.floor(Math.random() * 3)],
            percentTime: Math.floor(Math.random() * 30) + 10,
            energy: Math.floor(Math.random() * 5) + 1,
            successClear: Math.random() > 0.3,
            skillMatch: ['Match', 'Stretched', 'Overqualified'][Math.floor(Math.random() * 3)]
        }));

        return {
            name, dept: deptName, roleTitle, supervisorName: manager, status: 'complete',
            p1: {
                orgHealth: Math.floor(Math.random() * 5) + 5,
                targetClarity: Math.floor(Math.random() * 4) + 6,
                weeklyHrs: Math.floor(Math.random() * 10) + 40,
                burnout: Math.floor(Math.random() * 3) + 1,
                capGap: Math.floor(Math.random() * 5) + 3,
                legacyBurden: Math.floor(Math.random() * 30) + 10
            },
            activities: myActivities,
            activityDetails,
            p4: {
                realistic: ['Achievable', 'Neutral', 'Unrealistic'][Math.floor(Math.random() * 3)],
                reviewer: manager,
                freq: 'Weekly',
                blockers: phrases.blockers[Math.floor(Math.random() * phrases.blockers.length)],
                changes: phrases.innovation[Math.floor(Math.random() * phrases.innovation.length)],
                meetingRatio: Math.floor(Math.random() * 40) + 20,
                enthusiasm: Math.floor(Math.random() * 20) + 5 // "How many days this month did you feel genuinely energetic"
            },
            is_ai: true, batch_uuid: batchUuid
        };
    } else {
        // Supervisor Audit for 'name' conducted by 'manager'
        const activityDetails = myActivities.map(act => ({
            name: act,
            criticality: ['High', 'Med', 'Low'][Math.floor(Math.random() * 3)],
            percentTime: Math.floor(Math.random() * 30) + 10,
            engaged: ['Active', 'Neutral', 'Disengaged'][Math.floor(Math.random() * 3)],
            goodDefined: 'Yes',
            skillMatch: ['Match', 'Stretch', 'Mismatch'][Math.floor(Math.random() * 3)]
        }));

        return {
            name, dept: deptName, supervisorName: manager, supervisorRole: roleTitle, status: 'complete',
            p1: { 
                orgHealth: Math.floor(Math.random() * 4) + 6,
                targetClarity: Math.floor(Math.random() * 4) + 6,
                weeklyHrs: Math.floor(Math.random() * 15) + 40,
                burnout: Math.floor(Math.random() * 3) + 1,
                capGap: Math.floor(Math.random() * 4) + 2,
                enthusiasm: Math.floor(Math.random() * 20) + 5
            },
            globalOrgHealth: Math.floor(Math.random() * 4) + 6,
            activities: myActivities,
            activityDetails,
            p3: {
                targetsAchievable: ['Neutral', 'Achievable', 'Unrealistic'][Math.floor(Math.random() * 3)],
                whoReviews: manager,
                reviewFrequency: 'Weekly',
                blockers: phrases.blockers[Math.floor(Math.random() * phrases.blockers.length)],
                improvements: phrases.innovation[Math.floor(Math.random() * phrases.innovation.length)],
                meetingsVsFocus: Math.floor(Math.random() * 50) + 20,
                enthusiasm: Math.floor(Math.random() * 20) + 5 // Energetic days
            },
            is_ai: true, batch_uuid: batchUuid
        };
    }
}

app.post('/api/commit-synthetic-workforce', async (req, res) => {
    try {
        const companyRes = await db.query('SELECT * FROM companies LIMIT 1');
        const companyId = companyRes.rows[0] ? companyRes.rows[0].id : 1;
        const { syntheticEmployees, syntheticDiagnostics } = req.body;

        if (!syntheticEmployees || !syntheticDiagnostics) return res.status(400).json({ error: 'Missing payloads' });

        // We wrap everything in a single transaction.
        // To avoid "SQLITE_BUSY", we do it sequentially but in one block.
        await db.query('BEGIN IMMEDIATE');
        try {
            for (const emp of syntheticEmployees) {
                await db.query(
                    'INSERT INTO employees (id, company_id, name, role, manager, department_id, is_ai) VALUES ($1, $2, $3, $4, $5, $6, 1)',
                    [emp.id, companyId, emp.name, emp.role, emp.manager, emp.department_id]
                );
            }
            for (const diag of syntheticDiagnostics) {
                await db.query(
                    'INSERT INTO diagnostics (company_id, type, employee_name, department_name, payload, is_ai) VALUES ($1, $2, $3, $4, $5, 1)',
                    [companyId, diag.type, diag.employee_name, diag.department_name, diag.payload]
                );
            }
            await db.query('COMMIT');
            res.json({ success: true });
        } catch (e) {
            await db.query('ROLLBACK').catch(() => {});
            throw e;
        }
    } catch (err) {
        console.error('Commit Error:', err);
        res.status(500).json({ error: 'Failed to commit AI workforce' });
    }
});


// Purge AI Data Endpoint
app.delete('/api/purge-ai-data', async (req, res) => {
    try {
        await db.query('BEGIN IMMEDIATE');
        await db.query('DELETE FROM nlp_signals WHERE is_ai = 1');
        await db.query('DELETE FROM diagnostics WHERE is_ai = 1');
        await db.query('DELETE FROM employees WHERE is_ai = 1');
        await db.query('COMMIT');
        res.json({ success: true, message: 'Synthetic workforce purged successfully' });
    } catch (err) {
        await db.query('ROLLBACK');
        console.error(err);
        res.status(500).json({ error: 'Failed to purge AI data' });
    }
});

// Strategic Snapshot (Full Backups before wipe)
app.get('/api/backup', async (req, res) => {
    try {
        console.log('[Backup Start] Initiating system-wide snapshot...');
        
        const backupDir = path.join(__dirname, 'backups');
        if (!fs.existsSync(backupDir)) {
            console.log('[Backup Trace] Creating missing backups directory...');
            fs.mkdirSync(backupDir, { recursive: true });
        }

        const fetchTable = async (name) => {
            try {
                const res = await db.query(`SELECT * FROM ${name}`);
                console.log(`[Backup Trace] Table Read: ${name} (${res.rows.length} records)`);
                return res.rows;
            } catch (e) {
                console.warn(`[Backup Warn] Could not read ${name}, skipping or empty.`);
                return [];
            }
        };

        const companies = await fetchTable('companies');
        const departments = await fetchTable('departments');
        const roles = await fetchTable('roles');
        const employees = await fetchTable('employees');
        const diagnostics = await fetchTable('diagnostics');
        const nlp = await fetchTable('nlp_signals');
        
        const safeDiagnostics = diagnostics.map(d => {
            let parsed = {};
            try {
                if (d.payload) {
                    parsed = typeof d.payload === 'string' ? JSON.parse(d.payload) : d.payload;
                }
            } catch (e) {
                console.warn(`[Backup Warn] Malformed payload for diag ID ${d.id}, including as string instead.`);
                parsed = { __raw: d.payload, __error: "JSON mapping failure" };
            }
            return { ...d, payload: parsed };
        });

        const backupData = {
            snapshot_version: "5.1",
            timestamp: new Date().toISOString(),
            raw: {
                companies,
                departments,
                roles,
                employees,
                diagnostics: safeDiagnostics,
                nlp
            }
        };

        const filename = `snapshot_${Date.now()}.json`;
        const savePath = path.join(backupDir, filename);
        
        fs.writeFileSync(savePath, JSON.stringify(backupData, null, 2));

        console.log(`[Backup Success] Strategic Archive generated: ${filename}`);
        res.json({ success: true, filename, message: 'Archive successfully generated in server/backups/' });
    } catch (err) {
        console.error('[Backup Fatal Failure]', err);
        res.status(500).json({ error: 'Failed' });
    }
});

// Restore Snapshot (Atomic Re-hydration from Archive)
app.post('/api/restore', async (req, res) => {
    try {
        const backupDir = path.join(__dirname, 'backups');
        if (!fs.existsSync(backupDir)) return res.status(404).json({ error: 'No backups found.' });

        const files = fs.readdirSync(backupDir).filter(f => f.startsWith('snapshot_') && f.endsWith('.json'));
        if (files.length === 0) return res.status(404).json({ error: 'No snapshots available.' });

        // Sort to find the absolute latest
        const latestFile = files.sort().reverse()[0];
        const rawData = JSON.parse(fs.readFileSync(path.join(backupDir, latestFile), 'utf8'));
        const { raw } = rawData;

        await db.query('BEGIN IMMEDIATE');
        try {
            // 1. Wipe current state
            await db.query('DELETE FROM nlp_signals');
            await db.query('DELETE FROM diagnostics');
            await db.query('DELETE FROM employees');
            await db.query('DELETE FROM roles');
            await db.query('DELETE FROM departments');
            await db.query('DELETE FROM companies');
            await db.query("DELETE FROM sqlite_sequence");

            // 2. Re-hydrate structure
            for (const c of raw.companies) {
                await db.query('INSERT INTO companies (id, name, industry, headcount, currency, financial_year, revenue_target, total_salary_budget) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)',
                    [c.id, c.name, c.industry, c.headcount, c.currency, c.financial_year, c.revenue_target, c.total_salary_budget]);
            }
            for (const d of raw.departments) {
                await db.query('INSERT INTO departments (id, company_id, name) VALUES ($1,$2,$3)', [d.id, d.company_id, d.name]);
            }
            for (const r of raw.roles) {
                await db.query('INSERT INTO roles (id, department_id, title, grade, min_salary, max_salary) VALUES ($1,$2,$3,$4,$5,$6)',
                    [r.id, r.department_id, r.title, r.grade, r.min_salary, r.max_salary]);
            }
            for (const e of raw.employees) {
                await db.query('INSERT INTO employees (id, company_id, name, role, manager, department_id, is_ai) VALUES ($1,$2,$3,$4,$5,$6,$7)',
                    [e.id, e.company_id, e.name, e.role, e.manager, e.department_id, e.is_ai]);
            }
            for (const dg of raw.diagnostics) {
                await db.query('INSERT INTO diagnostics (company_id, type, employee_name, department_name, payload, is_ai) VALUES ($1,$2,$3,$4,$5,$6)',
                    [dg.company_id, dg.type, dg.employee_name, dg.department_name, JSON.stringify(dg.payload), dg.is_ai]);
            }
            for (const ns of raw.nlp) {
                await db.query(`INSERT INTO nlp_signals (id, company_id, employee_name, department_name, diagnostic_type, question, question_label, raw_text, sentiment, sentiment_score, sentiment_detail, urgency, urgency_score, urgency_detail, signal, signal_emoji, signal_label, interpretation, is_ai) VALUES 
                    ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19)`,
                    [ns.id, ns.company_id, ns.employee_name, ns.department_name, ns.diagnostic_type, ns.question, ns.question_label, ns.raw_text, ns.sentiment, ns.sentiment_score, ns.sentiment_detail, ns.urgency, ns.urgency_score, ns.urgency_detail, ns.signal, ns.signal_emoji, ns.signal_label, ns.interpretation, ns.is_ai]);
            }

            await db.query('COMMIT');
            console.log(`[Restore Success] System re-hydrated from ${latestFile}`);
            res.json({ success: true, message: `System re-hydrated from latest snapshot: ${latestFile}` });
        } catch (innerErr) {
            await db.query('ROLLBACK').catch(() => {});
            throw innerErr;
        }
    } catch (err) {
        console.error('[Restore Failure]', err);
        res.status(500).json({ error: 'Failed to restore snapshot.' });
    }
});

// Refresh endpoint: clears ALL data (full system reset)
app.post('/api/refresh', async (req, res) => {
    try {
        await db.query('BEGIN IMMEDIATE');
        await db.query('DELETE FROM nlp_signals');
        await db.query('DELETE FROM diagnostics');
        await db.query('DELETE FROM employees');
        await db.query('DELETE FROM roles');
        await db.query('DELETE FROM departments');
        await db.query('DELETE FROM companies');
        // Reset autoincrement sequence
        await db.query("DELETE FROM sqlite_sequence WHERE name IN ('nlp_signals', 'diagnostics', 'companies')");
        await db.query('COMMIT');
        console.log('[System Reset] All database tables have been cleared.');
        res.json({ success: true, message: 'All data cleared successfully' });
    } catch (err) {
        await db.query('ROLLBACK').catch(() => {});
        console.error('[System Reset Error]', err);
        res.status(500).json({ error: 'Failed to clear system' });
    }
});

// Auto-restore logic for prototype persistence
async function autoRestoreFromJSON() {
    try {
        const companyRes = await db.query('SELECT * FROM companies LIMIT 1');
        if (companyRes.rows.length === 0 || !companyRes.rows[0].name) {
            console.log('[Auto-Restore] Company table is empty. Loading from company_data.json...');
            const dataPath = path.join(__dirname, 'company_data.json');
            if (fs.existsSync(dataPath)) {
                const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
                const { company, financials, departments, employees } = data;
                await db.query('BEGIN IMMEDIATE');
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
                await db.query('DELETE FROM roles WHERE department_id IN (SELECT id FROM departments WHERE company_id = $1)', [companyId]);
                await db.query('DELETE FROM departments WHERE company_id = $1', [companyId]);
                await db.query('DELETE FROM employees WHERE company_id = $1', [companyId]);
                for (const dept of departments) {
                    await db.query('INSERT INTO departments (id, company_id, name) VALUES ($1, $2, $3)', [dept.id, companyId, dept.name]);
                    for (const role of (dept.roles || [])) {
                        await db.query('INSERT INTO roles (id, department_id, title, grade, min_salary, max_salary) VALUES ($1, $2, $3, $4, $5, $6)',
                            [role.id, dept.id, role.title, role.grade, role.minSalary, role.maxSalary]);
                    }
                }
                for (const emp of employees) {
                    await db.query('INSERT INTO employees (id, company_id, name, role, manager, department_id) VALUES ($1, $2, $3, $4, $5, $6)',
                        [emp.id, companyId, emp.name, emp.role, emp.manager, emp.departmentId]);
                }
                await db.query('COMMIT');
                console.log('[Auto-Restore] Successfully synchronized organization context.');
            }
        }
    } catch (err) {
        await db.query('ROLLBACK').catch(() => {});
        console.error('[Auto-Restore] Failed:', err);
    }
}

autoRestoreFromJSON().then(() => {
    app.listen(PORT, () => {
        console.log(`SQLite Backend running at http://localhost:${PORT}`);
    });
});
