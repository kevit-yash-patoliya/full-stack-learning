## PostgreSQL Replication — Quick Revision

### 1. Architecture

```text
             WRITE
               ↓
       ┌────────────────┐
       │    PRIMARY     │
       │ PostgreSQL:5432│
       └───────┬────────┘
               │
              WAL
               ↓
       ┌────────────────┐
       │    STANDBY     │
       │ PostgreSQL:5433│
       └────────────────┘
              READ
```

**Primary** → accepts writes
**Standby** → receives WAL and replays changes

---

### 2. Create Docker network

```bash
docker network create pg-network
```

Allows containers to communicate using names like:

```text
postgres-primary
```

---

### 3. Primary configuration

Important PostgreSQL settings:

```conf
wal_level = replica
max_wal_senders = 10
```

`wal_level = replica` → generates WAL information needed for physical replication.

---

### 4. Create replication user

```sql
CREATE USER replicator
WITH REPLICATION
PASSWORD 'replica_password';
```

The important permission is:

```text
REPLICATION
```

Check it with:

```sql
SELECT rolname, rolreplication
FROM pg_roles
WHERE rolname = 'replicator';
```

Expected:

```text
replicator | t
```

---

### 5. Allow the standby to connect

In `pg_hba.conf`:

```text
host replication replicator 0.0.0.0/0 scram-sha-256
```

Then:

```sql
SELECT pg_reload_conf();
```

---

### 6. Create empty standby volume
```

```bash
docker volume create postgres-standby-data

Important: `pg_basebackup` requires the target directory to be **empty**.

If you get:

```text
directory exists but is not empty
```

do:

```bash
docker volume rm postgres-standby-data
docker volume create postgres-standby-data
```

---

### 7. Copy primary → standby

The key command is:

```bash
docker run --rm \
  --network pg-network \
  -e PGPASSWORD=replica_password \
  -v postgres-standby-data:/var/lib/postgresql/data \
  postgres:16 \
  pg_basebackup \
  -h postgres-primary \
  -D /var/lib/postgresql/data \
  -U replicator \
  -Fp \
  -Xs \
  -P \
  -R
```

Remember:

```text
pg_basebackup
     ↓
Initial copy of Primary database
     ↓
Standby data directory
```

`-R` → automatically creates standby connection configuration.

`-Xs` → includes WAL required for the backup.

---

### 8. Start standby

```bash
docker run -d \
  --name postgres-standby \
  --network pg-network \
  -e POSTGRES_PASSWORD=postgres \
  -p 5433:5432 \
  -v postgres-standby-data:/var/lib/postgresql/data \
  postgres:16
```

---

### 9. Verify replication

On primary:

```sql
SELECT client_addr, state, sync_state
FROM pg_stat_replication;
```

You want:

```text
state
---------
streaming
```

On standby:

```sql
SELECT pg_is_in_recovery();
```

Expected:

```text
t
```

---

### 10. Test

Primary:

```sql
INSERT INTO users (name) VALUES ('Yash');
```

Standby:

```sql
SELECT * FROM users;
```

The new row should appear.

### The whole concept in one line

```text
Primary → WAL → Standby
```

And the setup sequence to remember:

```text
Docker Network
      ↓
Primary
      ↓
Replication User
      ↓
wal_level + pg_hba.conf
      ↓
Empty Standby Volume
      ↓
pg_basebackup
      ↓
Start Standby
      ↓
Check pg_stat_replication
      ↓
streaming ✅
```
