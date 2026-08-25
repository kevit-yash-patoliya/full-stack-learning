# NestJS Complete Learning Guide

NestJS is a progressive Node.js framework for building efficient, reliable, and scalable server-side applications using TypeScript. It enforces an opinionated modular structure inspired by Angular.

---

## 1. Core Architecture & Pillars

NestJS applications are built on three fundamental pillars tied together via **Dependency Injection (DI)**:

```
    Client ──► [Controller] ──► [Service / Provider] ──► [Database]
```

* **Modules (Organizers):** Group related code (controllers, providers) into a self-contained feature boundary. Every app has a root `AppModule`.
* **Controllers (Traffic Directors):** Handle incoming HTTP requests and return responses. They define routes but must contain **no business logic**.
* **Providers/Services (Heavy Lifters):** Injectable classes (annotated with `@Injectable()`) that contain business logic, calculations, and database operations.
* **Dependency Injection (DI):** Instead of manually creating instances, NestJS instantiates and injects them via the constructor (e.g., `constructor(private readonly service: MyService)`).

---

## 2. Request Lifecycle Layers

NestJS wraps the request-response lifecycle in five specialized, cross-cutting layers:

| Layer | Execution Order | Purpose | Use Case |
| :--- | :--- | :--- | :--- |
| **Middleware** | 1 (First) | Modify request/response objects before route handlers. | Request logging, extracting headers. |
| **Guards** | 2 | Determine if a request is authorized. Returns `boolean`. | Auth checks (JWT), role-based access (RBAC). |
| **Interceptors**| 3 | Intercept execution to bind extra behavior before/after. | Caching, logging response time, response mapping. |
| **Pipes** | 4 | Transform or validate incoming data. | Parsing ID to number, DTO validation. |
| **Filters** | 5 (On Error) | Catch unhandled exceptions and format client response. | Standardizing JSON error payloads. |

### Lifecycle Details & Code Blueprints

#### Middleware Configuration
Apply middleware selectively in the module using the `MiddlewareConsumer`:
```typescript
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes(CatsController);
    consumer.apply(AuthMiddleware).forRoutes(
      { path: 'users/profile', method: RequestMethod.GET }
    );
  }
}
```

#### Guards (RBAC Example)
Guards implement `CanActivate`. Role-based access control uses a custom `@Roles()` decorator and `Reflector` to retrieve metadata:
```typescript
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}
  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>('roles', [
      context.getHandler(), context.getClass()
    ]);
    if (!requiredRoles) return true;
    const { user } = context.switchToHttp().getRequest();
    return requiredRoles.some(role => user?.roles?.includes(role));
  }
}
```

#### Interceptors (RxJS Streams)
Interceptors use RxJS Observables. Logic written before `next.handle()` runs during the request phase, and operators in `.pipe()` run during the response phase:
```typescript
@Injectable()
export class TransformInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map(data => ({ success: true, statusCode: 200, data }))
    );
  }
}
```

#### Pipes (Validation & Transformation)
Pipes implement `PipeTransform` to validate (usually with `class-validator`) or transform:
```typescript
@Injectable()
export class UppercasePipe implements PipeTransform {
  transform(value: string) {
    return value.toUpperCase();
  }
}
// Usage: @Query('name', UppercasePipe) name: string
```

---

## 3. Advanced Dependency Injection & Providers

### Provider Scopes (Lifetime)
* **DEFAULT (Singleton):** One shared instance cached for the entire app. (Recommended for performance).
* **REQUEST:** Fresh instance created for every HTTP request. (Lowers performance).
* **TRANSIENT:** Fresh instance created for each injecting class.

### Custom Providers
Custom providers are used to override default instantiation behavior:

| Custom Type | Property | Purpose | Example |
| :--- | :--- | :--- | :--- |
| **Value Provider** | `useValue` | Registers constant values, configurations, or mocks. | `{ provide: 'API_KEY', useValue: '12345' }` |
| **Class Provider** | `useClass` | Swaps out implementations dynamically. | `{ provide: Logger, useClass: dev ? ConsoleLogger : FileLogger }` |
| **Factory Provider**| `useFactory`| Generates dependencies dynamically/asynchronously. | Connecting to database using dynamic configs. |
| **Existing Provider**| `useExisting`| Creates an alias for an already registered provider. | `{ provide: 'AliasService', useExisting: RealService }` |

### Circular Dependencies
If Service A and Service B inject each other, use `forwardRef()` on both sides:
```typescript
constructor(@Inject(forwardRef(() => ServiceB)) private b: ServiceB) {}
```

---

## 4. Module Patterns

* **Feature Modules:** Group logic for a specific domain (e.g., `UsersModule`).
* **Shared Modules:** Export providers to be reused across other modules.
* **Global Modules:** Marked with `@Global()` to make exported providers available globally without importing them everywhere.
* **Dynamic Modules:** Modules configured dynamically at import time via static methods (e.g., `DatabaseModule.forRoot({ host: 'localhost' })`):
```typescript
export class DatabaseModule {
  static register(options: DbOptions): DynamicModule {
    return {
      module: DatabaseModule,
      providers: [{ provide: 'DB_OPTIONS', useValue: options }, DatabaseService],
      exports: [DatabaseService]
    };
  }
}
```

---

## 5. JWT Authentication

To set up JWT authentication, install `@nestjs/jwt` and configure it within the `AuthModule`:

```typescript
@Module({
  imports: [
    UsersModule,
    JwtModule.register({
      global: true,
      secret: 'SECRET_KEY',
      signOptions: { expiresIn: '60s' },
    }),
  ],
  providers: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}
```

Generate tokens within the `AuthService`:
```typescript
const payload = { sub: user.id, username: user.username };
return {
  access_token: await this.jwtService.signAsync(payload),
};
```

---

## 6. Custom Class-Validator Decorators

Create custom validators using `class-validator` to implement complex validation rules:

```typescript
import { registerDecorator, ValidationOptions } from 'class-validator';

export function IsEven(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isEven',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any) {
          return typeof value === 'number' && value % 2 === 0;
        },
        defaultMessage() {
          return `${propertyName} must be an even number!`;
        }
      },
    });
  };
}
```

---

## 7. Recommended Production Directory Structure

Group by domain features first, keeping common code centralized:

```
src/
├── common/             # Guards, Interceptors, Pipes, Filters, Custom Decorators
├── shared/             # Database connection, Logger, Caching configurations
├── utils/              # Pure stateless helper functions (dates, slugs, etc.)
├── modules/            # Feature domains
│   ├── auth/           # Controllers, Services, DTOs, Entities for Auth
│   └── users/          # Controllers, Services, DTOs, Entities for Users
├── app.module.ts       # Root module
└── main.ts             # Application bootstrapper
```
