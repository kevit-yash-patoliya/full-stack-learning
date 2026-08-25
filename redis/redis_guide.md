# Redis Complete Reference Guide

Redis (Remote Dictionary Server) is an open-source, in-memory key-value data store used as a database, cache, message broker, and database accelerator.

---

## 1. Key-Value & Data Types

Unlike relational databases, Redis stores data as key-value pairs where values can be structured data types:

* **Strings:** Binary-safe strings up to 512MB (used for raw text, HTML fragments, or serialized JSON objects).
* **Lists:** Linked lists of strings sorted by insertion order (great for queues/stacks).
* **Sets:** Unordered collections of unique strings (good for unique visitors or tags).
* **Sorted Sets (ZSets):** Non-repeating collections of strings, where every member is associated with a numeric score (ideal for leaderboards).
* **Hashes:** Maps between string fields and string values (ideal for representing objects like a `User` profile).

---

## 2. TTL (Time to Live) & Expiration

TTL determines how long a key remains in Redis before being automatically deleted.
* **Why it matters:** Prevents memory exhaustion by cleaning up stale data (e.g., temporary login codes, active session tokens).
* **Eviction Policies:** When Redis runs out of memory, it deletes keys based on configuration (e.g., `volatile-lru` (Least Recently Used with TTL) or `allkeys-lru`).

```bash
# Set key with 60-second TTL
SET session:123 "active" EX 60

# Check remaining life (in seconds)
TTL session:123
```

---

## 3. Caching & Database Load Reduction

### The Cache-Aside Pattern (Standard Web Architecture)

```
                       [ User / Client ]
                               │
                               ▼
                        [ API Gateway ]
                               │
            ┌──────────────────┴──────────────────┐
     (1) Is it cached?                     (3) Cache Miss
            ▼                                     ▼
     [ Redis Cache ] ──(2) Yes (Cache Hit)──► [ Return Data ]
            │                                     │
            │ (Not found)                         ▲
            └────────────────► [ Database ] ──────┘ (4) Fetch and write to Redis
```

### Flow Steps:
1. The **API** receives a request for user profile data.
2. The **API** checks if the data exists in **Redis** (Cache Hit). If yes, returns it immediately.
3. If not in **Redis** (Cache Miss), the **API** queries the **Database** (disk-based, slow).
4. The **API** writes the database result into **Redis** with a TTL (e.g., 1 hour) and returns the data to the client.

### Why this reduces Database load:
* **Memory vs. Disk:** Redis reads are in-memory (nanoseconds), whereas DB reads require disk I/O (milliseconds).
* **High Throughput:** A single Redis instance can handle 100K+ reads per second easily, mitigating DB CPU spikes.
* **Lower Connection Count:** Decreases active DB connections, preventing database thread starvation.

---

## 4. Pub/Sub & Streams

### Pub/Sub (Publish/Subscribe)
An ephemeral message distribution pattern where publishers send messages to channels without knowing who the subscribers are.
* *Limitation:* Messages are "fire-and-forget". If a subscriber is offline, it misses the message. Excellent for chat servers or live notifications.

### Streams
A persistent, append-only log data structure. 
* *Benefit:* Message brokers can read historical messages, track which consumer processed which item (Consumer Groups), and recover from crashes.

---

## 5. Distributed Locks

In multi-server environments, standard code-level locks do not prevent race conditions. Distributed locks coordinate access to a shared resource (e.g., inventory checkouts).

### The Redlock Algorithm
1. **Acquire Lock:** Use a unique key with a short TTL (safety net if process crashes) and a unique value (to ensure only the lock owner can release it).
   ```bash
   SET resource_lock "unique_uuid" NX PX 30000
   # NX: Only set if key doesn't exist
   # PX: Expiration time of 30,000ms
   ```
2. **Release Lock:** Run a Lua script on the Redis server that verifies the unique value matches before deleting the key. This prevents Server A from accidentally deleting a lock acquired by Server B.

---

## 6. Rate Limiting

Redis handles high-frequency writes efficiently, making it the industry standard for API rate limiting.

### Sliding Window Log Algorithm
1. Save each request timestamp in a Sorted Set (ZSet) with the key as the user's IP.
2. Remove elements in the ZSet older than the rate limit window (e.g., 1 minute ago).
3. Query the number of elements left in the ZSet. If it exceeds the limit, block the request.
4. If not, add the new timestamp to the set.
