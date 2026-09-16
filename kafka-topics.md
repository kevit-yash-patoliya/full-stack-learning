If you want to learn **Kafka with Node.js practically**, I’d recommend following this progression from fundamentals → real-world event-driven architecture.

## Kafka + Node.js Practical Roadmap

### 1. Kafka Fundamentals

Learn:

* What is Kafka?
* Kafka vs RabbitMQ
* Producer
* Consumer
* Broker
* Topic
* Partition
* Offset
* Consumer Group
* Replication
* Leader/Follower

**Practical Task 1**

> Run Kafka locally with Docker and create a topic.

```bash
docker compose up -d
```

Then:

* Create a topic called `orders`
* Create 2 partitions
* Produce messages
* Consume messages

---

### 2. Kafka CLI Practice

Learn the basic Kafka commands:

```bash
kafka-topics
kafka-console-producer
kafka-console-consumer
kafka-consumer-groups
```

**Practical Task 2**

Create:

```text
Topic: orders
Partitions: 3
```

Send:

```text
Order 101
Order 102
Order 103
Order 104
Order 105
```

Observe which partition receives each message.

---

### 3. Node.js Kafka Producer

Learn how Node.js communicates with Kafka.

Use a library such as **KafkaJS**.

Install:

```bash
npm install kafkajs
```

Learn:

```js
Kafka
Producer
connect()
send()
disconnect()
```

**Practical Task 3**

Create:

```text
producer.js
```

Your Node.js application should send:

```json
{
  "orderId": 101,
  "userId": 10,
  "amount": 500
}
```

to:

```text
orders
```

---

### 4. Node.js Kafka Consumer

Learn:

```js
consumer.connect()
consumer.subscribe()
consumer.run()
```

**Practical Task 4**

Create:

```text
consumer.js
```

It should consume messages from:

```text
orders
```

and print:

```text
New Order Received
Order ID: 101
User ID: 10
Amount: 500
```

---

### 5. Producer → Consumer Architecture

Understand:

```text
Node.js API
     │
     │ produce
     ▼
   Kafka
   orders
     │
     │ consume
     ▼
Order Service
```

**Practical Task 5**

Build:

```text
Order API
     ↓
Kafka
     ↓
Order Worker
```

When the API receives:

```http
POST /orders
```

it publishes an event.

The worker consumes the event and stores/processes the order.

---

### 6. Topics and Partitions

Deep dive into:

* Why partitions exist
* Partition ordering
* Partition keys
* Message distribution
* Partition count

**Practical Task 6**

Create:

```text
orders
```

with 3 partitions.

Send messages using:

```text
userId
```

as the Kafka message key.

For example:

```text
userId = 101
userId = 101
userId = 101
```

Check whether these messages go to the same partition.

Understand **why ordering matters**.

---

### 7. Consumer Groups

Learn the difference between:

```text
Consumer
```

and:

```text
Consumer Group
```

**Practical Task 7**

Create:

```text
consumer-1
consumer-2
consumer-3
```

with the same group:

```text
order-service
```

and topic:

```text
orders
```

Use 3 partitions.

Observe how Kafka distributes partitions among consumers.

Then create:

```text
payment-service
```

with another consumer group.

Understand why both services receive the same event.

---

### 8. Offset

Learn:

* Offset
* Current offset
* Committed offset
* Offset reset
* `earliest`
* `latest`

**Practical Task 8**

Send 10 messages.

Stop the consumer.

Send another 5 messages.

Start the consumer again.

Observe which messages it receives.

Then experiment with:

```js
fromBeginning: true
```

---

### 9. Message Keys

Learn why Kafka messages can have keys.

Example:

```js
await producer.send({
  topic: "orders",
  messages: [
    {
      key: "user-101",
      value: JSON.stringify({
        orderId: 1
      })
    }
  ]
});
```

**Practical Task 9**

Send:

```text
user-1 → order-1
user-1 → order-2
user-1 → order-3

user-2 → order-4
user-2 → order-5
```

Verify partition behavior.

---

### 10. Multiple Services

Now build a real event-driven system.

```text
                  ┌── Payment Service
                  │
Node API → Kafka ─┼── Email Service
                  │
                  └── Inventory Service
```

**Practical Task 10**

Create:

```text
order-service
payment-service
email-service
inventory-service
```

When an order is created:

```text
Order Created
     ↓
Kafka
     ↓
 ┌──────────┬──────────┬─────────────┐
 ↓          ↓          ↓
Payment   Email     Inventory
Service   Service   Service
```

Each service should have its own **consumer group**.

---

### 11. Event-Driven Architecture

Learn:

* Event-driven architecture
* Event producer
* Event consumer
* Event choreography
* Loose coupling
* Asynchronous processing

**Practical Task 11**

Implement:

```text
POST /orders
```

API response:

```json
{
  "message": "Order accepted"
}
```

Don't directly call:

```text
Payment Service
Email Service
Inventory Service
```

Instead:

```text
API
 ↓
Kafka
 ↓
Services
```

---

### 12. Retry and Error Handling

Learn:

* Consumer errors
* Retry
* Retry topics
* Failed messages
* Dead Letter Topic (DLT/DLQ)

**Practical Task 12**

Make your payment service intentionally fail for:

```text
orderId = 999
```

Implement:

```text
orders
   ↓
payment-service
   ↓
failure
   ↓
retry
   ↓
payment-service
   ↓
failure
   ↓
payment-dlq
```

---

### 13. Consumer Rebalancing

Learn:

* What happens when a consumer dies?
* What happens when a new consumer joins?
* Partition assignment
* Rebalancing

**Practical Task 13**

Run:

```text
3 partitions
3 consumers
```

Then kill one consumer.

Observe what Kafka does with its partitions.

---

### 14. Delivery Semantics

Learn the difference between:

```text
At-most-once
At-least-once
Exactly-once
```

**Practical Task 14**

Create a consumer that processes:

```text
payment
```

and intentionally crashes before/after committing the offset.

Observe duplicate processing.

Then design your application to handle duplicates using **idempotency**.

---

### 15. Idempotency

This is extremely important in real applications.

Example:

```text
Kafka sends payment event
        ↓
Payment Service
        ↓
Payment processed
        ↓
Consumer crashes
        ↓
Kafka sends event again
```

You don't want:

```text
₹500 charged
₹500 charged again
```

**Practical Task 15**

Create:

```text
payment_transactions
```

with a unique:

```text
transactionId
```

If the same Kafka event arrives twice, process it only once.

---

# Final Project 🚀

After completing the above tasks, build this:

```text
                    ┌─────────────────┐
                    │   Node.js API   │
                    └────────┬────────┘
                             │
                             ▼
                       ┌───────────┐
                       │   Kafka   │
                       └─────┬─────┘
                             │
              ┌──────────────┼──────────────┐
              ▼              ▼              ▼
        ┌──────────┐   ┌──────────┐   ┌───────────┐
        │ Payment  │   │ Inventory│   │   Email   │
        │ Service  │   │ Service  │   │  Service  │
        └────┬─────┘   └──────────┘   └───────────┘
             │
             ▼
        ┌──────────┐
        │ Payment  │
        │    DB    │
        └──────────┘
```

### Project requirements

Build an **e-commerce order system** with:

**Node.js + Kafka + Docker + PostgreSQL/MongoDB**

Implement:

1. `POST /orders`
2. `GET /orders/:id`
3. `orders` Kafka topic
4. 3 Kafka partitions
5. Order producer
6. Order consumer
7. Consumer groups
8. Payment service
9. Inventory service
10. Email service
11. Retry mechanism
12. Dead-letter topic
13. Offset handling
14. Idempotent payment processing
15. Docker Compose
16. Logging
17. Graceful shutdown

### Recommended learning order

```text
Kafka basics
    ↓
Topics
    ↓
Partitions
    ↓
Producer
    ↓
Consumer
    ↓
Offsets
    ↓
Consumer Groups
    ↓
Message Keys
    ↓
Node.js + KafkaJS
    ↓
Multiple Services
    ↓
Event-driven architecture
    ↓
Retries
    ↓
DLT
    ↓
Rebalancing
    ↓
Delivery Semantics
    ↓
Idempotency
    ↓
Final E-commerce Project
```

Since you're already practicing **Node.js + Docker + CI/CD**, this Kafka roadmap fits nicely as the next practical layer: **Node.js → Docker → Kafka → microservices → GitHub Actions → AWS deployment**.
