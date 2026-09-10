### table is exist then...dependent objects also removed
```sql
DROP TABLE Employee CASCADE;
```

### table is exist then...
```sql
DROP TABLE IF EXISTS Employee CASCADE;
```
### truncate 
```sql
TRUNCATE TABLE Employee RESTART IDENTITY;
```

