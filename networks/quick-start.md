## 🌐 Networking Quick Revision

### 1. IP Address

Identifies a device/interface on a network.

```text
Device → IP address → where to send packets
```

* Private IP: `192.168.1.10`
* Public IP: reachable over the Internet

---

### 2. NAT

**NAT = Network Address Translation**

Router translates private IP/port ↔ public IP/port.

```text
192.168.1.10:5000
        ↓ NAT
49.x.x.x:40001
```

Used commonly by home routers to allow many private devices to share one public IP.

---

### 3. TCP

**TCP = reliable, ordered byte stream.**

Provides:

* Reliable delivery
* Ordering
* Retransmission
* Flow control
* Congestion control

TCP connection starts with:

```text
SYN → SYN-ACK → ACK
```

---

### 4. UDP

UDP is simpler than TCP.

```text
UDP
├── No connection
├── No guaranteed delivery
├── No guaranteed ordering
└── Lower overhead
```

HTTP/3 uses **QUIC over UDP**.

---

### 5. Port

A port identifies a service/application on a machine.

Common examples:

```text
SSH    → TCP 22
HTTP   → TCP 80
HTTPS  → TCP 443
MongoDB → TCP 27017
```

---

### 6. Firewall

Firewall controls which network traffic is allowed/blocked.

Example:

```text
TCP 22    → ALLOW
TCP 80    → ALLOW
TCP 443   → ALLOW
TCP 27017 → BLOCK
```

---

### 7. SSH

**SSH = Secure Shell**

Used to remotely control a machine through a terminal.

```bash
ssh ubuntu@VPS_IP
```

Typical stack:

```text
SSH
 ↓
TCP :22
 ↓
IP
```

SSH maintains a long-lived TCP connection during the session.

```text
ssh
 ↓
TCP connection
 ↓
SSH authentication
 ↓
Remote shell
```

`exit` → closes the SSH session.

---

### 8. HTTP

HTTP is an **application-layer protocol** used for request/response communication.

Traditional:

```text
HTTP/1.1
   ↓
 TCP
   ↓
 IP
```

Example:

```text
Client ── GET /users ──→ Server
Client ←── response ─── Server
```

---

### 9. HTTPS

**HTTPS = HTTP + TLS**

```text
HTTP
 ↓
TLS
 ↓
TCP
 ↓
IP
```

Usually uses:

```text
TCP :443
```

TLS provides:

* Encryption
* Server authentication
* Integrity

---

### 10. TLS

TLS secures the connection.

Simplified:

```text
TCP connection
      ↓
TLS handshake
      ↓
Certificate verification
      ↓
Key exchange
      ↓
Shared encryption keys
      ↓
Encrypted communication
```

TLS uses asymmetric cryptography during the handshake and symmetric encryption for the actual data.

---

### 11. WebSocket

WebSocket provides **persistent, bidirectional communication**.

Common flow:

```text
HTTP/1.1 Upgrade
       ↓
WebSocket
       ↓
TCP
       ↓
IP
```

Unlike normal HTTP:

```text
HTTP:
Client → Request → Server
Client ← Response ← Server
```

WebSocket:

```text
Client ⇄ Server
```

Both sides can send data whenever needed.

---

### 12. HTTP/3

HTTP/3 does **not use TCP**.

```text
HTTP/3
  ↓
QUIC
  ↓
UDP
  ↓
IP
```

Usually UDP port `443`.

---

## 🔥 One Big Picture

```text
                    APPLICATION
 ┌─────────┬──────────┬──────────┬───────────┐
 │   SSH   │   HTTP   │WebSocket │  HTTP/3   │
 └────┬────┴────┬─────┴────┬─────┴─────┬─────┘
      │         │          │           │
     TCP       TCP        TCP         QUIC
      │         │          │           │
      │        TLS         │          UDP
      │         │          │           │
      └─────────┴──────────┴───────────┘
                         ↓
                        IP
                         ↓
                      Network
```

### 🧠 Remember these 5 lines

```text
SSH      → TCP :22
HTTP     → TCP :80
HTTPS    → TLS → TCP :443
WebSocket → TCP
HTTP/3   → QUIC → UDP :443
```

And:

> **IP finds the machine, port finds the service, TCP/UDP transports the data, and application protocols define what the data means.**
