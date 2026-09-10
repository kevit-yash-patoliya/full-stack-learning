# PostgreSQL User & Permissions Command Reference

---

## 1. Create User / Role

```sql
-- Basic user with login + password
CREATE USER myuser WITH PASSWORD 'strongpassword123';

-- Equivalent using CREATE ROLE (CREATE USER = CREATE ROLE ... LOGIN)
CREATE ROLE myuser WITH LOGIN PASSWORD 'strongpassword123';

-- User who can also create databases
CREATE USER myuser WITH PASSWORD 'x' CREATEDB;

-- User who can create other roles
CREATE USER myuser WITH PASSWORD 'x' CREATEROLE;

-- Superuser (full admin — use with caution)
CREATE USER myuser WITH PASSWORD 'x' SUPERUSER;

-- User with password expiry
CREATE ROLE myuser LOGIN PASSWORD 'x' VALID UNTIL '2026-12-31';

-- User with connection limit
CREATE USER myuser WITH PASSWORD 'x' CONNECTION LIMIT 10;
```

---

## 2. What Permissions a New User Gets by Default

When you run `CREATE USER myuser WITH PASSWORD 'x';` with **no other options**, here's exactly what you get automatically:

| Permission | Default? | Notes |
|---|---|---|
| Can log in | ✅ Yes | `LOGIN` is implied by `CREATE USER` |
| Can connect to any database | ❌ No | Must be explicitly granted with `GRANT CONNECT` (except `template1`/default db owner rules) |
| Can create databases | ❌ No | Needs `CREATEDB` |
| Can create roles/users | ❌ No | Needs `CREATEROLE` |
| Is a superuser | ❌ No | Needs `SUPERUSER` |
| Access to `public` schema | ⚠️ Depends on PG version | **PostgreSQL ≥ 15:** No access by default. **PostgreSQL ≤ 14:** `USAGE` + `CREATE` on `public` granted to `PUBLIC` (i.e., everyone) by default |
| SELECT/INSERT/UPDATE/DELETE on any table | ❌ No | Table owner only has access until explicitly granted |
| Access to sequences | ❌ No | Must be granted separately |
| Bypass Row Level Security (RLS) | ❌ No | Only superusers/table owners bypass RLS by default |

**In short:** a freshly created user can log in but can do essentially **nothing** else until you grant `CONNECT`, `USAGE`, and table-level privileges. This is intentional — Postgres uses a "deny by default" model.

---

## 3. Grant Database & Schema Access

```sql
-- Allow connecting to a specific database
GRANT CONNECT ON DATABASE mydb TO myuser;

-- Allow usage of a schema (required before table grants work)
\c mydb
GRANT USAGE ON SCHEMA public TO myuser;

-- Allow creating objects (tables etc.) inside a schema
GRANT CREATE ON SCHEMA public TO myuser;

-- Give ownership of a schema
ALTER SCHEMA public OWNER TO myuser;
```

---

## 4. Grant Table-Level Permissions

```sql
-- Read only
GRANT SELECT ON ALL TABLES IN SCHEMA public TO myuser;

-- Read + write (no delete)
GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA public TO myuser;

-- Full read-write (typical app user)
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO myuser;

-- Full privileges including TRUNCATE, REFERENCES, TRIGGER
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO myuser;

-- Grant on ONE specific table
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE orders TO myuser;

-- Grant full control on a specific table
GRANT ALL PRIVILEGES ON TABLE orders TO myuser;

-- Grant on multiple specific tables at once
GRANT SELECT, INSERT ON TABLE orders, payments, invoices TO myuser;

-- Grant only specific columns of a table
GRANT SELECT (id, name, email) ON TABLE customers TO myuser;
GRANT UPDATE (status) ON TABLE orders TO myuser;
```

---

## 5. Grant Sequence Permissions (needed for SERIAL/IDENTITY columns)

```sql
-- All sequences
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO myuser;

-- One specific sequence
GRANT USAGE, SELECT ON SEQUENCE orders_id_seq TO myuser;
```

---

## 6. Apply Permissions to FUTURE Tables/Sequences Automatically

```sql
-- Future tables get read-write automatically
ALTER DEFAULT PRIVILEGES IN SCHEMA public
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO myuser;

-- Future sequences
ALTER DEFAULT PRIVILEGES IN SCHEMA public
GRANT USAGE, SELECT ON SEQUENCES TO myuser;

-- Future functions
ALTER DEFAULT PRIVILEGES IN SCHEMA public
GRANT EXECUTE ON FUNCTIONS TO myuser;
```

> ⚠️ `ALTER DEFAULT PRIVILEGES` only affects objects created **after** this command is run, by the role that ran it (or the role specified with `FOR ROLE`). It does not retroactively apply to existing tables.

---

## 7. Revoke Permissions (Specific & Granular)

```sql
-- Revoke all privileges on a specific table
REVOKE ALL PRIVILEGES ON TABLE orders FROM myuser;

-- Revoke only write access, leave read-only
REVOKE INSERT, UPDATE, DELETE ON TABLE audit_logs FROM myuser;
GRANT SELECT ON TABLE audit_logs TO myuser;

-- Revoke a single privilege type
REVOKE DELETE ON TABLE orders FROM myuser;

-- Revoke access to specific columns
REVOKE UPDATE (salary) ON TABLE employees FROM myuser;

-- Revoke schema usage (blocks access to everything inside it)
REVOKE USAGE ON SCHEMA public FROM myuser;

-- Revoke database connect privilege
REVOKE CONNECT ON DATABASE mydb FROM myuser;

-- Revoke on ALL tables in schema
REVOKE ALL PRIVILEGES ON ALL TABLES IN SCHEMA public FROM myuser;

-- Revoke sequence access
REVOKE USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public FROM myuser;

-- Remove future default privileges (undo step 6)
ALTER DEFAULT PRIVILEGES IN SCHEMA public
REVOKE SELECT, INSERT, UPDATE, DELETE ON TABLES FROM myuser;
```

---

## 8. Role Attribute Changes (Alter User)

```sql
-- Change password
ALTER USER myuser WITH PASSWORD 'newpass';

-- Remove login ability (disable account without deleting it)
ALTER USER myuser WITH NOLOGIN;

-- Re-enable login
ALTER USER myuser WITH LOGIN;

-- Revoke superuser status
ALTER USER myuser WITH NOSUPERUSER;

-- Revoke CREATEDB
ALTER USER myuser WITH NOCREATEDB;

-- Set a connection limit
ALTER USER myuser WITH CONNECTION LIMIT 5;

-- Set password expiry
ALTER USER myuser VALID UNTIL '2026-12-31';

-- Remove password expiry (never expires)
ALTER USER myuser VALID UNTIL 'infinity';
```

---

## 9. Drop / Remove User

```sql
-- Drop user (fails if user owns objects or has pending grants)
DROP USER myuser;

-- Safer: reassign owned objects first, then drop
REASSIGN OWNED BY myuser TO postgres;
DROP OWNED BY myuser;
DROP USER myuser;
```

---

## 10. Checking Current Permissions (Verification Commands)

```sql
-- List all roles/users
\du

-- List all databases and owners
\l

-- Show table-level access privileges
\dp tablename
-- or
\z tablename

-- Query all grants for a specific user
SELECT grantee, table_schema, table_name, privilege_type
FROM information_schema.role_table_grants
WHERE grantee = 'myuser';

-- Check schema-level privileges
SELECT nspname, nspacl FROM pg_namespace WHERE nspname = 'public';

-- Check database-level privileges
SELECT datname, datacl FROM pg_database WHERE datname = 'mydb';
```

---

## 11. Quick Reference Table

| Action | Command |
|---|---|
| Create user | `CREATE USER myuser WITH PASSWORD 'x';` |
| Allow DB connect | `GRANT CONNECT ON DATABASE mydb TO myuser;` |
| Allow schema use | `GRANT USAGE ON SCHEMA public TO myuser;` |
| Read-write all tables | `GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO myuser;` |
| Full control one table | `GRANT ALL PRIVILEGES ON TABLE t TO myuser;` |
| Read-only one table | `REVOKE INSERT, UPDATE, DELETE ON TABLE t FROM myuser;` |
| Revoke everything on table | `REVOKE ALL PRIVILEGES ON TABLE t FROM myuser;` |
| Revoke DB connect | `REVOKE CONNECT ON DATABASE mydb FROM myuser;` |
| Change password | `ALTER USER myuser WITH PASSWORD 'new';` |
| Disable login | `ALTER USER myuser WITH NOLOGIN;` |
| Delete user safely | `REASSIGN OWNED BY myuser TO postgres; DROP OWNED BY myuser; DROP USER myuser;` |
| Check grants | `SELECT * FROM information_schema.role_table_grants WHERE grantee='myuser';` |

---

## 12. Recommended Full Setup Example (Typical App User)

```sql
-- 1. Create user
CREATE USER app_user WITH PASSWORD 'strongpassword123';

-- 2. Grant DB + schema access
GRANT CONNECT ON DATABASE mydb TO app_user;
\c mydb
GRANT USAGE ON SCHEMA public TO app_user;

-- 3. Grant read-write on existing tables
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO app_user;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO app_user;

-- 4. Restrict one sensitive table to read-only
REVOKE INSERT, UPDATE, DELETE ON TABLE audit_logs FROM app_user;

-- 5. Give full control on one specific table
GRANT ALL PRIVILEGES ON TABLE orders TO app_user;

-- 6. Auto-apply to future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA public
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO app_user;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
GRANT USAGE, SELECT ON SEQUENCES TO app_user;
```

---

### Note
Always test grants with `\dp tablename` or the `information_schema.role_table_grants` query after applying them, to confirm the actual permission set matches your intent.