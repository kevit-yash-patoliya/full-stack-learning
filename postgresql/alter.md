Yes — you can add, drop, or modify constraints on a column using `ALTER TABLE`. Here's how for each constraint type:

**1. NOT NULL constraint**
```sql
-- Drop NOT NULL (allow nulls now)
ALTER TABLE employees ALTER COLUMN email DROP NOT NULL;

-- Add NOT NULL back
ALTER TABLE employees ALTER COLUMN email SET NOT NULL;
```

**2. DEFAULT value**
```sql
-- Drop default
ALTER TABLE employees ALTER COLUMN status DROP DEFAULT;

-- Set/update default
ALTER TABLE employees ALTER COLUMN status SET DEFAULT 'active';
```

**3. CHECK constraint**
```sql
-- Add a check constraint (must be named)
ALTER TABLE employees ADD CONSTRAINT check_salary CHECK (salary > 0);

-- Drop it (need the constraint name)
ALTER TABLE employees DROP CONSTRAINT check_salary;

-- To "update" one: drop, then add the new version
ALTER TABLE employees DROP CONSTRAINT check_salary;
ALTER TABLE employees ADD CONSTRAINT check_salary CHECK (salary >= 1000);
```

**4. UNIQUE constraint**
```sql
-- Add
ALTER TABLE employees ADD CONSTRAINT unique_email UNIQUE (email);

-- Drop
ALTER TABLE employees DROP CONSTRAINT unique_email;
```

**5. PRIMARY KEY**
```sql
-- Add
ALTER TABLE employees ADD CONSTRAINT pk_employees PRIMARY KEY (id);

-- Drop
ALTER TABLE employees DROP CONSTRAINT pk_employees;
```

**6. FOREIGN KEY**
```sql
-- Add
ALTER TABLE orders ADD CONSTRAINT fk_customer 
FOREIGN KEY (customer_id) REFERENCES customers(id);

-- Drop
ALTER TABLE orders DROP CONSTRAINT fk_customer;
```

**7. Change column data type** (not a constraint exactly, but often done together)
```sql
ALTER TABLE employees ALTER COLUMN salary TYPE NUMERIC(10,2);
```

**Important: How to find a constraint's name if you don't know it**
```sql
-- List all constraints on a table
SELECT conname, contype, pg_get_constraintdef(oid)
FROM pg_constraint
WHERE conrelid = 'employees'::regclass;
```
or simply:
```sql
\d employees
```
This shows all constraints (PK, FK, CHECK, UNIQUE, NOT NULL) with their names, which you'll need for `DROP CONSTRAINT`.

**Key rule to remember:**
- **NOT NULL** and **DEFAULT** → use `ALTER COLUMN ... SET/DROP`
- **CHECK, UNIQUE, PRIMARY KEY, FOREIGN KEY** → use `ADD CONSTRAINT` / `DROP CONSTRAINT` (these are named, table-level constraints, not column-level syntax)

Want me to add this to the permissions `.md` file as a combined "PostgreSQL DDL cheat sheet," or keep it separate?