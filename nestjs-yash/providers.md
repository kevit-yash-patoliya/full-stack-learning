# providers


These concepts represent the advanced machinery behind NestJS's Dependency Injection (DI) system. They give you complete control over how objects are created, how long they live, and how they interact.

Here is the breakdown of each concept:

## 1. Injectable Providers

In NestJS, almost everything is a provider (Services, Repositories, Helpers). To tell the NestJS Inversion of Control (IoC) container that it should manage a class, you use the `@Injectable()` decorator.

```typescript
@Injectable()
export class UsersService {}

```

By adding this decorator, NestJS knows it can inject this class into a Controller's constructor, and it will handle creating the instance automatically.

## 2. Provider Scopes (Lifetime Scopes)

By default, NestJS creates one instance of a provider and shares it across the entire application. However, you can change how long a provider "lives" in memory using Scopes.

| Scope | Behavior | When to use |
| --- | --- | --- |
| **DEFAULT (Singleton)** | One single instance is shared across the entire app. It is cached after the first request. | **Default choice.** Best for performance and memory. |
| **REQUEST** | A brand new instance is created exclusively for each incoming HTTP request, and garbage-collected afterward. | When a service needs request-specific data (like the logged-in user's ID) stored directly on the class. *(Warning: Lowers performance).* |
| **TRANSIENT** | A brand new instance is created every single time it is injected into a different class. | When you want an isolated, fresh state for every class that uses the provider. |

**How to set it:**

```typescript
import { Injectable, Scope } from '@nestjs/common';

@Injectable({ scope: Scope.REQUEST })
export class UsersService {}

```

---

## 3. Custom Providers

Normally, when you register a provider in a module, you use a shortcut:
`providers: [UsersService]`

Under the hood, NestJS expands this into a full object:

```typescript
providers: [
  {
    provide: UsersService, // The "Token" (How we ask for it)
    useClass: UsersService // The "Recipe" (What NestJS actually creates)
  }
]

```

**Custom Providers** let you override this behavior. You can change the "Recipe" using `useValue`, `useFactory`, or `useExisting`.

### 4. Value Providers (`useValue`)

Used when you want to inject a constant value, an external library, or a mock object instead of instantiating a class. It is heavily used in unit testing.

```typescript
const mockDatabase = {
  find: () => ['user1', 'user2']
};

providers: [
  {
    provide: 'DATABASE_CONNECTION', // We use a string token here
    useValue: mockDatabase,
  }
]

```

*Note: Because the token is a string (not a class), you must use the `@Inject('DATABASE_CONNECTION')` decorator in your constructor to receive it.*

### 5. Factory Providers (`useFactory`)

Used when provider creation is dynamic, relies on complex logic, or needs to be asynchronous (like connecting to a database before the app finishes booting). A factory can also inject other providers.

```typescript
providers: [
  {
    provide: 'ASYNC_CONNECTION',
    useFactory: async (configService: ConfigService) => {
      const db = await createDatabaseConnection(configService.get('DB_URL'));
      return db; // This returned value is what gets injected
    },
    inject: [ConfigService], // Tells NestJS to pass this into the factory
  }
]

```

### 6. Existing Providers (`useExisting`)

Used to create an alias for a provider that already exists, so you don't accidentally create two instances of the same thing.

```typescript
providers: [
  LegacyLoggerService,
  {
    provide: 'NEW_LOGGER_TOKEN',
    useExisting: LegacyLoggerService, // Points to the exact same instance in memory
  }
]

```

---

## 7. Circular Dependencies

A circular dependency happens when Class A needs Class B, but Class B also needs Class A.

```typescript
// Service A
constructor(private b: ServiceB) {}

// Service B
constructor(private a: ServiceA) {}

```

When NestJS tries to start, it gets stuck in an infinite loop trying to resolve them and crashes.

**The Solution: `forwardRef()**`
You use the `forwardRef()` utility function to delay the resolution of the classes until after both have been instantiated. You must apply this on **both sides** of the circular dependency.

```typescript
import { Inject, forwardRef, Injectable } from '@nestjs/common';

@Injectable()
export class ServiceA {
  constructor(
    @Inject(forwardRef(() => ServiceB))
    private b: ServiceB
  ) {}
}

```



# how factory and value works?

### 1. The `useValue` Clarification

You mentioned `useValue` *extracts* params. It’s actually the opposite: `useValue` **registers** (or stores) the params into the NestJS Dependency Injection (DI) system.
Think of it like taking the `options` object you typed in your code and putting it into a named locker so the Factory can find it later.

### 2. The Timeline (When does the Factory run?)

NestJS providers are **Singletons** by default. This means NestJS builds them once, keeps them in memory, and shares that exact same instance with every controller that asks for it.

Here is the exact timeline of what happens when you type `npm run start`:

**Phase 1: Bootstrapping (App Startup)**

1. NestJS reads your module and sees `useValue`. It puts your `options` in a locker called `'DATABASE_OPTIONS'`.
2. NestJS sees `useFactory`. It takes the options from the locker, runs the factory function, and connects to the database. **(The factory runs right now!)**
3. The database connection is successful. NestJS takes that live connection and puts it in a locker called `'DATABASE_CONNECTION'`.
4. The server finishes starting up and says: *"Application is listening on port 3000"*.

**Phase 2: The Request Lifecycle (App is running)**
5. A user makes a `GET /users` request to your Controller.
6. The Controller needs the database. Does it run the factory? **No.** It just walks over to the `'DATABASE_CONNECTION'` locker, grabs the connection that was *already built* during Phase 1, and uses it.

# Custom Providers

Using Custom Providers in NestJS always boils down to **two steps**:

1. **Register the provider** in your `@Module()` using a `provide` token and a provider strategy (`useValue`, `useClass`, `useFactory`, or `useExisting`).
2. **Inject the provider** in your Controller or Service using `@Inject('TOKEN')` (for string/symbol tokens) or normal constructor injection (for class tokens).

Here is a practical guide showing how to define and inject each type of custom provider.

---

### Step-by-Step Examples

#### 1. Value Provider (`useValue`)

Use `useValue` to inject static objects, API keys, external library instances, or configuration objects.

**In the Module (`app.module.ts`):**

```typescript
import { Module } from '@nestjs/common';

const APP_CONFIG = {
  apiUrl: 'https://api.example.com',
  timeout: 5000,
};

@Module({
  providers: [
    {
      provide: 'APP_CONFIG', // Token name
      useValue: APP_CONFIG,  // Value to store
    },
  ],
})
export class AppModule {}

```

**In the Service (`users.service.ts`):**

```typescript
import { Injectable, Inject } from '@nestjs/common';

@Injectable()
export class UsersService {
  constructor(
    // Use @Inject() with the exact string token name
    @Inject('APP_CONFIG') private readonly config: Record<string, any>,
  ) {
    console.log(this.config.apiUrl); // Output: https://api.example.com
  }
}

```

---

#### 2. Class Provider (`useClass`)

Use `useClass` when you want to dynamically choose which class to instantiate—for example, using a `MockPaymentService` in testing/development and a `StripePaymentService` in production.

**In the Module (`payment.module.ts`):**

```typescript
import { Module } from '@nestjs/common';
import { StripePaymentService } from './stripe-payment.service';
import { MockPaymentService } from './mock-payment.service';

@Module({
  providers: [
    {
      provide: 'PAYMENT_SERVICE',
      // Dynamically select class based on environment
      useClass: process.env.NODE_ENV === 'production' 
        ? StripePaymentService 
        : MockPaymentService,
    },
  ],
})
export class PaymentModule {}

```

**In the Controller (`payment.controller.ts`):**

```typescript
import { Controller, Post, Inject } from '@nestjs/common';

@Controller('payment')
export class PaymentController {
  constructor(
    @Inject('PAYMENT_SERVICE') private readonly paymentService: any,
  ) {}

  @Post()
  process() {
    return this.paymentService.charge(100);
  }
}

```

---

#### 3. Factory Provider (`useFactory`)

Use `useFactory` when creating the provider requires dynamic logic, running async code, or injecting other existing providers first.

**In the Module (`database.module.ts`):**

```typescript
import { Module } from '@nestjs/common';
import { ConfigService } from './config.service';

@Module({
  providers: [
    ConfigService,
    {
      provide: 'ASYNC_CONNECTION',
      // 1. Factory function receives injected dependencies in exact order
      useFactory: async (configService: ConfigService) => {
        const dbUrl = configService.getDbUrl();
        // Run any async/dynamic logic here
        return await connectToDatabase(dbUrl); 
      },
      // 2. Specify which dependencies to pass into useFactory
      inject: [ConfigService], 
    },
  ],
})
export class DatabaseModule {}

```

**In the Service (`orders.service.ts`):**

```typescript
import { Injectable, Inject } from '@nestjs/common';

@Injectable()
export class OrdersService {
  constructor(
    @Inject('ASYNC_CONNECTION') private readonly dbConnection: any,
  ) {}
}

```

---

#### 4. Existing Provider (`useExisting`)

Use `useExisting` to create an alias for a provider that is already registered in the DI container without creating a duplicate instance.

**In the Module (`logger.module.ts`):**

```typescript
import { Module } from '@nestjs/common';
import { ConsoleLoggerService } from './console-logger.service';

@Module({
  providers: [
    ConsoleLoggerService, // Registered primary provider
    {
      provide: 'ALIAS_LOGGER', // Alias token
      useExisting: ConsoleLoggerService, // Reuses the exact same instance in memory
    },
  ],
})
export class LoggerModule {}

```

**In the Service (`audit.service.ts`):**

```typescript
import { Injectable, Inject } from '@nestjs/common';

@Injectable()
export class AuditService {
  constructor(
    @Inject('ALIAS_LOGGER') private readonly logger: any,
  ) {}
}

```

---

### Golden Rules for Custom Providers

| Token Type | Defining in `@Module()` | Injecting in Class |
| --- | --- | --- |
| **String Token** | `{ provide: 'MY_TOKEN', useValue: ... }` | Must use `@Inject('MY_TOKEN')` |
| **Symbol Token** | `{ provide: Symbol('MY_TOKEN'), ... }` | Must use `@Inject(Symbol('MY_TOKEN'))` |
| **Class Token** | `{ provide: MyService, useClass: ... }` | Standard injection: `constructor(private myService: MyService)` |




Provider Type,Syntax Property,Primary Purpose,Example Use Case
Class Provider,useClass,Swaps out implementations dynamically.,Replacing a RealDatabaseService with a MockDatabaseService during testing.
Value Provider,useValue,"Registers constant values, configurations, or external libraries.","Storing API keys, configuration objects, or third-party client instances."
Factory Provider,useFactory,Generates dependencies dynamically at startup.,Asynchronously connecting to a database or calculating settings before injecting.
Existing Provider,useExisting,Creates an alias for an already-registered provider.,Reusing a single instance under multiple token names without duplicating memory.