In NestJS and modern modular frameworks (like Angular), modules are the primary way to organize code into cohesive blocks. Here is a breakdown of each module type and pattern:

---

## 1. Feature Modules

A **Feature Module** encapsulates code related to a specific domain, business logic, or feature set (e.g., `UsersModule`, `OrdersModule`, `AuthModule`). It keeps code organized, maintainable, and clear by grouping relevant controllers, services, and entities together.

```typescript
// users.module.ts
@Module({
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService], // Exported so other modules can use UsersService
})
export class UsersModule {}

```

---

## 2. Shared Modules

A **Shared Module** exports reusable providers, components, or utilities that need to be consumed by multiple feature modules across the application (e.g., a `DatabaseModule`, `CommonUtilsModule`, or shared UI components).

Once imported into a feature module, that feature module gets access to all exported providers.

```typescript
// database.module.ts
@Module({
  providers: [DatabaseService],
  exports: [DatabaseService], // Any module importing DatabaseModule gets DatabaseService
})
export class DatabaseModule {}

```

---

## 3. Global Modules

When a module needs to be available **everywhere** (e.g., `LoggerModule`, `ConfigModule`), importing it into every single feature module creates boilerplate.

By decorating a module with `@Global()`, its exported providers are available across the entire application once it is imported into the root `AppModule`.

```typescript
// logger.module.ts
@Global()
@Module({
  providers: [LoggerService],
  exports: [LoggerService],
})
export class LoggerModule {}

```

> **Note:** Use global modules sparingly—making everything global leads to tightly coupled and harder-to-test code.

---

## 4. Dynamic Modules

A **Dynamic Module** allows you to pass configuration options or arguments at import time to customize provider behavior dynamically (e.g., `DatabaseModule.forRoot({ host: 'localhost' })`).

Instead of static metadata, dynamic modules return a module definition object via a static method (typically named `register`, `forRoot`, or `forFeature`).

```typescript
// database.module.ts
@Module({})
export class DatabaseModule {
  static register(options: { host: string; port: number }): DynamicModule {
    return {
      module: DatabaseModule,
      providers: [
        {
          provide: 'DATABASE_OPTIONS',
          useValue: options,
        },
        DatabaseService,
      ],
      exports: [DatabaseService],
    };
  }
}

// Usage in AppModule:
// imports: [DatabaseModule.register({ host: 'localhost', port: 5432 })]

```

---

## 5. Module Re-exporting

Modules can re-export other modules that they import. This acts as a bundle or aggregator, so importing a single "umbrella" module automatically gives access to all re-exported services/providers.

```typescript
// core.module.ts
@Module({
  imports: [DatabaseModule, LoggerModule],
  exports: [DatabaseModule, LoggerModule], // Re-exporting imported modules
})
export class CoreModule {}

```

Now, any feature module importing `CoreModule` automatically gains access to everything exported by both `DatabaseModule` and `LoggerModule`.

---