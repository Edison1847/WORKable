-- SQLite Schema

-- Drop existing tables
DROP TABLE IF EXISTS nlp_signals;
DROP TABLE IF EXISTS diagnostics;
DROP TABLE IF EXISTS employees;
DROP TABLE IF EXISTS roles;
DROP TABLE IF EXISTS departments;
DROP TABLE IF EXISTS companies;

-- Companies Table
CREATE TABLE companies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    industry TEXT,
    headcount TEXT,
    currency TEXT DEFAULT 'USD',
    financial_year TEXT,
    revenue_target REAL,
    total_salary_budget REAL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Departments Table
CREATE TABLE departments (
    id TEXT PRIMARY KEY,
    company_id INTEGER REFERENCES companies(id),
    name TEXT NOT NULL
);

-- Roles Table
CREATE TABLE roles (
    id TEXT PRIMARY KEY,
    department_id TEXT REFERENCES departments(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    grade TEXT,
    min_salary REAL,
    max_salary REAL
);

-- Employees Table
CREATE TABLE employees (
    id TEXT PRIMARY KEY,
    company_id INTEGER REFERENCES companies(id),
    name TEXT NOT NULL,
    role TEXT,
    manager TEXT,
    department_id TEXT REFERENCES departments(id) ON DELETE SET NULL,
    is_ai INTEGER DEFAULT 0
);

-- Diagnostics Data
CREATE TABLE diagnostics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    company_id INTEGER REFERENCES companies(id),
    type TEXT,
    employee_name TEXT,
    department_name TEXT,
    payload TEXT, -- Store as JSON string in SQLite
    is_ai INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- NLP Signals Table
CREATE TABLE nlp_signals (
    id               INTEGER PRIMARY KEY AUTOINCREMENT,
    company_id       INTEGER REFERENCES companies(id),
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
    is_ai            INTEGER DEFAULT 0,
    created_at       DATETIME DEFAULT CURRENT_TIMESTAMP
);
