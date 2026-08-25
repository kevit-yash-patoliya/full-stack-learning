# Software Architecture & Design Principles Reference Guide

This document covers fundamental software design principles, pattern classifications, and major architectural styles used to build maintainable, decoupled, and scalable applications.

---

## 1. Core Software Design Principles

### SOLID Principles
SOLID is a set of five object-oriented design principles to make software designs more understandable, flexible, and maintainable.

| Principle | Description | Bad Example | Good Example |
| :--- | :--- | :--- | :--- |
| **S**ingle Responsibility | A class should have one, and only one, reason to change. | A `User` class that handles database queries AND prints PDF invoices. | A `UserService` for logic, a `UserRepository` for DB, and an `InvoicePrinter` for PDFs. |
| **O**pen/Closed | Software entities should be open for extension, but closed for modification. | Modifying a core `PaymentProcessor` class every time a new payment method (like Stripe) is added. | Creating a `PaymentMethod` interface and extending it for Stripe, PayPal, etc. |
| **Liskov Substitution** | Subtypes must be substitutable for their base types without breaking the app. | A `Ostrich` subclass inheriting from `Bird` but throwing an error on the `fly()` method. | Splitting into `FlyingBird` and `NonFlyingBird` classes. |
| **I**nterface Segregation | Clients should not be forced to depend on interfaces they do not use. | A large `Worker` interface containing both `code()` and `assembleHardware()` methods for all developers. | Splitting into separate `Coder` and `HardwareAssembler` interfaces. |
| **D**ependency Inversion | Depend on abstractions, not concretions. High-level modules shouldn't depend on low-level modules. | A controller directly instantiating a `MySQLDatabase` class inside its constructor. | Controller depending on a generic `IDatabase` interface injected via Constructor injection. |

---

### DRY, KISS, and Separation of Concerns

* **DRY (Don't Repeat Yourself):** Every piece of knowledge or logic must have a single, unambiguous representation within a system.
  * *How to achieve:* Extract repeating logic into reusable functions, helper utilities, or base classes.
* **KISS (Keep It Simple, Stupid):** Systems work best if they are kept simple rather than made complicated.
  * *How to achieve:* Avoid over-engineering. Do not build complex abstraction layers for features you do not need yet (YAGNI - You Aren't Gonna Need It).
* **Separation of Concerns (SoC):** Dividing a program into distinct sections, where each section addresses a separate concern.
  * *Example:* HTML controls structure, CSS controls presentation, and JavaScript controls behavior. In backends, routing is separated from business logic and database queries.

---

### Dependency Injection (DI)
DI is a design pattern used to implement **Dependency Inversion (DIP)**. Instead of a class creating its own dependencies, the dependencies are passed (injected) into the class from the outside (usually by a DI Container/Framework like NestJS or Spring).

* **Benefits:** Easier unit testing (dependencies can be easily mocked), loose coupling, and simplified lifecycle management.

---

## 2. Design Pattern Classifications

Design patterns are reusable solutions to commonly occurring problems in software design. They fall into three main categories:

```
                  ┌──────────────────────────────┐
                  │    Design Patterns Class     │
                  └──────────────┬───────────────┘
         ┌───────────────────────┼────────────────────────┐
         ▼                       ▼                        ▼
    [ Creational ]         [ Structural ]           [ Behavioral ]
  How objects are made.   How classes associate.  How objects communicate.
  - Singleton             - Adapter                - Observer
  - Factory Method        - Decorator              - Strategy
```

1. **Creational Patterns:** Focus on object creation mechanisms, trying to create objects in a manner suitable to the situation.
   * **Singleton:** Ensures a class has only one instance and provides a global access point to it (e.g., Database connection pool).
   * **Factory Method:** Provides an interface for creating objects in a superclass, but allows subclasses to alter the type of objects that will be created.
2. **Structural Patterns:** Focus on how classes and objects can be composed to form larger structures.
   * **Adapter:** Allows objects with incompatible interfaces to collaborate (e.g., mapping a third-party XML API response to JSON).
   * **Decorator:** Attaches new behaviors to objects dynamically by placing them inside special wrapper objects.
3. **Behavioral Patterns:** Focus on communication between objects and how responsibilities are assigned.
   * **Observer:** Defines a subscription mechanism to notify multiple objects about any events that happen to the object they’re observing (e.g., event listeners).
   * **Strategy:** Defines a family of algorithms, puts each of them into a separate class, and makes their objects interchangeable at runtime (e.g., choosing Stripe vs. PayPal payment strategy dynamically).

---

## 3. Architectural Styles

### Layered (n-Tier) Architecture
The most common architecture pattern. Code is organized into horizontal layers where each layer has a specific role and only communicates with the layer directly below it.

```
   [ Presentation Layer (Controllers / UI) ]
                     │
                     ▼
   [ Application / Business Logic Layer (Services) ]
                     │
                     ▼
   [ Data Access Layer (Repositories / DAOs) ]
                     │
                     ▼
   [ Database / Storage Layer ]
```

---

### Clean Architecture & Hexagonal Architecture

#### Clean Architecture (Robert C. Martin)
Focuses on making the business logic independent of frameworks, UI, databases, or any external agency. The dependencies only point **inwards** toward the core domain logic.

```
       ┌──────────────────────────────────────────────────┐
       │   Frameworks & Drivers (DB, Web, Devices)        │
       │     ┌──────────────────────────────────────┐     │
       │     │    Interface Adapters (Controllers)  │     │
       │     │     ┌──────────────────────────┐     │     │
       │     │     │   Use Cases (Services)   │     │     │
       │     │     │     ┌──────────────┐     │     │     │
       │     │     │     │   Entities   │     │     │     │
       │     │     │     └──────────────┘     │     │     │
       │     │     └──────────────────────────┘     │     │
       │     └──────────────────────────────────────┘     │
       └──────────────────────────────────────────────────┘
```

#### Hexagonal Architecture (Ports and Adapters)
Similar to Clean Architecture. The core business application is located inside a "hexagon" and interacts with external actors (databases, HTTP clients, message queues) through **Ports** (interfaces) and **Adapters** (concrete implementations of those interfaces).

* **Ports:** Interfaces defined *inside* the application core (e.g., `UserRepository` interface).
* **Adapters:** Code written *outside* the core implementing the ports (e.g., `MongoUserRepository` which uses Mongoose, or `MockUserRepository` for testing).

---

## 4. Domain-Driven Design (DDD) Basics

Domain-Driven Design is an approach to software development for complex needs by connecting the implementation to an evolving model of core business concepts.

### Key Tactical Patterns
* **Entity:** An object defined by its unique identity rather than its attributes (e.g., a `User` with an ID; even if they change their name, they are the same user).
* **Value Object:** An object that has no conceptual identity and is defined entirely by its attributes (e.g., an `Address` containing Street, City, and Zip. If you change the city, it is a different address. Value objects should be immutable).
* **Aggregate:** A cluster of associated objects (Entities and Value Objects) treated as a single unit for data changes. Every aggregate has an **Aggregate Root** (the single entry-point entity).
* **Bounded Context:** A boundary within which a particular domain model applies. In different contexts, the same word can mean different things (e.g., a "Product" in the *Sales Context* has prices and discounts, but in the *Shipping Context* it has weight and dimensions).
* **Ubiquitous Language:** A shared, common language defined and used by both technical developers and non-technical business domain experts to eliminate miscommunication.
