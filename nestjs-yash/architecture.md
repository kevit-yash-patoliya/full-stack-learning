# NestJS Architecture 

NestJS is a progressive Node.js framework designed to solve one of the biggest problems in JavaScript backend development: **architecture**. While standard Node.js frameworks like Express give you complete freedom, they can easily become disorganized as an application scales.

NestJS solves this by enforcing a highly opinionated, modular structure heavily inspired by Angular. It uses TypeScript natively and relies on object-oriented programming, functional programming, and dependency injection.

---

## The Three Core Pillars

At the heart of any NestJS application are three fundamental building blocks: **Modules**, **Controllers**, and **Providers**.

### 1. Modules (The Organizers)

A module is a self-contained box that groups related code together to form a specific feature boundary. Every NestJS app has at least one root module (usually `AppModule`), but real-world apps are broken down into multiple feature modules.

For example, an e-commerce app might have:

* `UsersModule` (handles accounts)
* `OrdersModule` (handles checkout and tracking)
* `ProductsModule` (handles inventory)

Modules define what controllers they own, what providers they use, and what parts of themselves they export to be used by other modules in the application.

### 2. Controllers (The Traffic Directors)

Controllers are responsible exclusively for handling incoming HTTP requests and returning responses to the client. They act as the entry and exit points for your API.

* **What they do:** Define routes (e.g., `GET /users`), validate incoming data, and return HTTP status codes.
* **What they DON'T do:** Controllers should **never** contain business logic or database queries. Instead, they delegate the actual work to Services.

Controllers rely heavily on TypeScript decorators like `@Controller()`, `@Get()`, and `@Post()` to map routes.

### 3. Providers / Services (The Heavy Lifters)

Providers are the backbone of NestJS. The most common type of provider is a **Service**. This is where your actual business logic lives.

If a Controller receives a request to "Create a new user," it passes the data to the `UsersService`. The Service then hashes the password, saves the user to the database, and returns the result. Separating this logic makes the code highly reusable and much easier to test.

Providers are marked with the `@Injectable()` decorator, meaning NestJS can automatically inject them wherever they are needed.

---

## The Glue: Dependency Injection (DI)

Dependency Injection is the design pattern that connects these three pillars. Instead of manually creating instances of your services (e.g., `const userService = new UsersService()`), NestJS handles it for you.

When a Controller needs a Service, you simply declare it in the Controller's constructor:

```typescript
@Controller('users')
export class UsersController {
  // NestJS automatically injects the UsersService here
  constructor(private readonly usersService: UsersService) {}
}

```

This decoupling makes it incredibly easy to swap out dependencies (like mocking a database during unit testing) without changing the core code.

---

## The Request Lifecycle Layers

Beyond the core pillars, NestJS provides five specialized layers to handle the lifecycle of an HTTP request, ensuring concerns like security and validation are kept separate from your business logic:

| Layer | Purpose | Common Use Case |
| --- | --- | --- |
| **Middleware** | Runs before anything else; can modify the request/response objects. | Logging requests, extracting user tokens. |
| **Guards** | Determines if a request is allowed to proceed to the controller. | Authentication and Authorization (e.g., "Is this user an Admin?"). |
| **Interceptors** | Intercepts the flow to add extra logic before or after a method executes. | Caching responses, transforming data, or measuring performance. |
| **Pipes** | Transforms or validates incoming data before it hits the controller. | Validating that a payload matches a specific DTO (Data Transfer Object). |
| **Exception Filters** | Catches unhandled errors and formats the HTTP response. | Returning a clean, standardized JSON error message when something crashes. |


# Guard vs Interceptors

While both Guards and Interceptors sit in the request pipeline of a NestJS application, they have completely different responsibilities, capabilities, and positions in the request lifecycle.

Think of a **Guard** as a bouncer at a club, and an **Interceptor** as the waiter who takes your order and brings your food.

Here is the exact breakdown:

### 1. Guards (The Bouncers)

Guards have a single, strict responsibility: **Determine whether a request will be handled by the route handler or not.**

* **How they work:** They return a boolean (`true` or `false`). If `true`, the request proceeds. If `false` (or if they throw an exception), the request is immediately denied, and a `403 Forbidden` (or similar) response is sent back.
* **What they can access:** The `ExecutionContext`, which means they know exactly what route is being called, what class it belongs to, and what the request looks like.
* **When to use them:**
* **Authentication:** Is the user logged in? (Validating a JWT token).
* **Authorization:** Does the logged-in user have the "Admin" role required to hit this specific endpoint?



### 2. Interceptors (The Middlemen)

Interceptors are vastly more powerful and complex. Inspired by Aspect-Oriented Programming (AOP), they wrap around your route handler. They can execute code *before* the controller method runs, and *after* the controller method returns data.

* **How they work:** They use RxJS `Observables`. They intercept the request on the way in, and they intercept the response (the stream of data) on the way out.
* **What they can access/do:** They can mutate the incoming request, mutate the outgoing response, completely override the controller method, or catch and transform errors.
* **When to use them:**
* **Response Transformation:** Taking the raw data your service returns and wrapping it in a standard JSON format (e.g., `{ data: [...], meta: {...} }`).
* **Caching:** Checking a Redis cache before the controller runs, and returning the cached data immediately (completely skipping the controller logic).
* **Logging & Profiling:** Starting a timer before the controller runs, and logging the total execution time after the response is sent.
* **Data Masking:** Stripping out sensitive fields (like passwords) from a user object before sending it to the client.



---

### Side-by-Side Comparison

| Feature | Guards | Interceptors |
| --- | --- | --- |
| **Primary Purpose** | Access control (Yes/No). | Extra logic (Before/After) & Data transformation. |
| **Execution Order** | Runs **before** Interceptors and Pipes. | Runs **after** Guards, wrapping the Controller. |
| **Can Modify Request?** | No (Should be read-only). | Yes. |
| **Can Modify Response?** | No (Only blocks or allows). | Yes (Using RxJS operators like `map`). |
| **Return Type** | `boolean` or `Promise<boolean>`. | `Observable<any>`. |
| **Complexity** | Simple (Boolean logic). | Complex (Requires RxJS knowledge). |


# Interceptors 

To understand how RxJS Observables work in NestJS Interceptors, it helps to think of an HTTP request and response as a continuous "stream" of events. RxJS is a library designed specifically for handling asynchronous streams of data, making it the perfect tool for intercepting and manipulating those streams.

In NestJS, the magic happens entirely around one specific method: `next.handle()`.

## The `next.handle()` Boundary

When you create an Interceptor, you are required to implement an `intercept` method. This method receives a `CallHandler` object, which represents the actual controller method that is about to run.

Here is the golden rule of Interceptors:

* Anything you write **before** calling `next.handle()` executes on the incoming **Request**.
* The `next.handle()` method itself executes the controller logic and returns an **RxJS Observable**.
* Anything you chain to that Observable using `.pipe()` executes on the outgoing **Response**.

## A Practical Example: The Logging Interceptor

Let's look at how this works in practice to measure how long a request takes to process:

```typescript
import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    
    // 1. THIS RUNS FIRST (The Request Phase)
    console.log('Request has arrived...');
    const startTime = Date.now();

    // 2. THIS CALLS THE CONTROLLER
    return next.handle().pipe(
      
      // 3. THIS RUNS LAST (The Response Phase)
      tap(() => {
        const duration = Date.now() - startTime;
        console.log(`Response sent in ${duration}ms`);
      }),
    );
  }
}

```

Because NestJS automatically wraps whatever your controller returns (whether it's a raw object, an array, or a Promise) into an Observable, you gain access to the massive ecosystem of RxJS operators to manipulate that data.

## Common RxJS Operators in Interceptors

By using the `.pipe()` method, you can string together multiple RxJS operators to manipulate the response stream before it reaches the user.

### 1. `map()`: The Data Transformer

If you want to standardize your API responses so every successful call is wrapped in a `{ data: ... }` object, you use `map`. It intercepts the data returned by the controller and transforms it.

```typescript
import { map } from 'rxjs/operators';

return next.handle().pipe(
  map(controllerData => {
    return {
      status: 'success',
      data: controllerData,
      timestamp: new Date().toISOString()
    };
  })
);

```

### 2. `tap()`: The Observer

If you want to do something *with* the data but don't want to change the data itself (like logging to an external service or sending metrics), you use `tap`. It peeks at the stream without altering it.

### 3. `catchError()`: The Error Handler

If your controller throws an exception, you can intercept that error before it hits the user and transform it, perhaps mapping a generic database error to a specific `404 Not Found` HTTP exception.

### 4. `timeout()`: The Safeguard

You can prevent hanging requests by forcing a timeout. If the controller takes longer than 5 seconds to respond, RxJS will automatically cancel the stream and throw a `RequestTimeoutException`.

```typescript
import { timeout } from 'rxjs/operators';

return next.handle().pipe(
  timeout(5000) // Cancels the request if it takes > 5 seconds
);

```

# Best Practices 

As a NestJS application grows, grouping files by their *type* (putting all controllers in one folder and all services in another) quickly becomes a nightmare.

To build a scalable application, the universally recommended approach is **Feature-Based** or **Domain-Driven** structure. This means you group everything related to a specific feature (like Users or Orders) into its own self-contained folder.

Here is the blueprint for a highly scalable, enterprise-grade NestJS project structure:

## The High-Level Architecture

The root of your `src/` directory should cleanly separate your global infrastructure from your feature-specific business logic.

```text
src/
├── common/             # 🛠️ Shared building blocks used everywhere
├── config/             # ⚙️ Environment and app configurations
├── core/               # 🧠 Global app-level setup (often imported only once)
├── modules/            # 📦 The actual business features (Domain boundaries)
├── app.module.ts       # 🌟 The root module that ties it all together
└── main.ts             # 🚀 The application entry point

```

### 1. `common/` (The Shared Toolkit)

This directory holds code that is agnostic to any specific business feature and can be reused anywhere in the app. If a utility only applies to "Users," it belongs in the Users module, not here.

* **`decorators/`** (e.g., `@CurrentUser()`)
* **`filters/`** (e.g., `http-exception.filter.ts`)
* **`guards/`** (e.g., `roles.guard.ts`)
* **`interceptors/`** (e.g., `logging.interceptor.ts`)
* **`middleware/`** (e.g., `logger.middleware.ts`)
* **`utils/`** or **`helpers/`** (e.g., `hash-password.util.ts`)

### 2. `config/` (The Environment Manager)

Keeps your configuration logic centralized and strictly typed.

* **`database.config.ts`** (TypeORM, Mongoose, or Prisma connection settings)
* **`app.config.ts`** (Port numbers, environment variables, API keys)

### 3. `core/` (The Global Backbone)

This is for things that are required to bootstrap the application and are usually only imported once into the `AppModule`.

* Global error handling setups.
* Core authentication strategies (e.g., Passport JWT setup).
* Logging providers (e.g., Winston or Pino integrations).

---

## The Feature Module Structure (`modules/`)

This is where your actual application lives. Every domain in your app gets its own folder inside `src/modules/`. Let's look at what a complete `users` module looks like:

```text
src/modules/users/
├── dto/                        # Data Transfer Objects (Input validation)
│   ├── create-user.dto.ts
│   └── update-user.dto.ts
├── entities/                   # Database schemas / models
│   └── user.entity.ts
├── interfaces/                 # TypeScript interfaces specific to users
│   └── user.interface.ts
├── users.controller.ts         # Handles GET, POST, PUT, DELETE requests
├── users.controller.spec.ts    # Unit tests for the controller
├── users.service.ts            # The business logic & database calls
├── users.service.spec.ts       # Unit tests for the service
└── users.module.ts             # Bundles this folder and exports the service

```

### Why this structure scales so well:

1. **Isolation:** If you need to completely rewrite how the `users` feature works, you only touch files inside the `users/` folder. The rest of the app doesn't care.
2. **Microservice Readiness:** Because each feature is a self-contained module, if your application gets too large and you need to extract "Users" into its own standalone microservice, the code is already perfectly bundled to be lifted and shifted.
3. **Onboarding:** A new developer can understand the entire lifecycle of a "User" request just by looking inside a single folder.


#