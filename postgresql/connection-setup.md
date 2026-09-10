# Connect to a database as a specific user within current session

```bash
\c mydb myuser
```
# connect with new session id
```bash
psql -U myuser -d mydb -h localhost -W
```

```
-U myuser → connect as that user
-d mydb → target database
-h localhost → important: forces TCP/IP connection (password auth), otherwise Postgres may try "peer" authentication which checks your OS username instead
-W → force password prompt
```




