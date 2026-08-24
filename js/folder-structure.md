These are core architectural patterns used in NestJS applications. Many of them work together rather than competing with each other.

---

# 1. Feature-based Architecture (Recommended in NestJS)

Organize code by **business feature**, not by file type.

```
src/
│
├── users/
│   ├── dto/
│   ├── entities/
│   ├── users.controller.ts
│   ├── users.service.ts
│   ├── users.repository.ts
│   └── users.module.ts
│
├── auth/
│   ├── dto/
│   ├── guards/
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   └── auth.module.ts
│
└── app.module.ts
```

Instead of

```
controllers/
services/
models/
dto/
```

everything related to **Users** stays inside `users`.

### Advantages

* Easy to maintain
* Easy to scale
* Teams work independently
* Less coupling

Large companies almost always use feature-based organization.

---

# 2. Layered Architecture

Layered architecture separates responsibilities.

```
Controller
     ↓
Service
     ↓
Repository
     ↓
Database
```

Example

```
Client
   ↓
Controller
   ↓
Service
   ↓
Repository
   ↓
MongoDB
```

### Responsibilities

### Controller

* Receives HTTP request
* Validates input
* Calls service
* Returns response

```ts
@Post()
create(@Body() dto: CreateUserDto) {
    return this.userService.create(dto);
}
```

---

### Service

Contains business logic.

```ts
create(dto: CreateUserDto) {
    return this.userRepository.create(dto);
}
```

---

### Repository

Communicates with database.

```ts
create(dto: CreateUserDto) {
    return this.userModel.create(dto);
}
```

Repository knows database.

Service doesn't.

---

# 3. Repository Pattern

Repository hides database implementation.

Without repository

```
Controller
      ↓
Service
      ↓
MongoDB
```

Service directly writes

```ts
this.userModel.find();
```

With repository

```
Controller
      ↓
Service
      ↓
Repository
      ↓
MongoDB
```

Repository

```ts
@Injectable()
export class UserRepository {

    constructor(
        @InjectModel(User.name)
        private model: Model<UserDocument>,
    ) {}

    create(dto: CreateUserDto) {
        return this.model.create(dto);
    }

    findAll() {
        return this.model.find();
    }
}
```

Service

```ts
@Injectable()
export class UserService {

    constructor(private repo: UserRepository) {}

    create(dto: CreateUserDto) {
        return this.repo.create(dto);
    }
}
```

### Benefits

* Easy testing
* Easy database migration
* Cleaner service

---

# 4. Service Layer

The service contains business rules.

Example

User registration

```
Controller
↓

Service
    Check Email
    Hash Password
    Generate JWT
    Save User

↓

Repository
↓

MongoDB
```

Bad

```ts
controller -> repository
```

Good

```ts
controller -> service -> repository
```

---

# 5. DTO Layer

DTO = Data Transfer Object

DTO validates incoming data.

```
Request

↓

DTO

↓

Controller

↓

Service
```

Example

```ts
export class CreateUserDto {

    @IsString()
    name: string;

    @IsEmail()
    email: string;

    @IsInt()
    age: number;
}
```

Benefits

* Validation
* Documentation
* Type safety
* Cleaner controllers

---

# 6. Shared Module

Contains modules used by **multiple features**.

Example

```
shared/

    logger/
    database/
    redis/
    cache/
```

Example

```
Users
      ↘

       Shared Logger

Orders
      ↗
```

Shared module exports reusable providers.

```ts
@Module({
    providers: [LoggerService],
    exports: [LoggerService],
})
export class SharedModule {}
```

---

# 7. Common Module

A convention for **cross-cutting application code** that isn't tied to one feature.

Example

```
common/

    guards/
    decorators/
    filters/
    interceptors/
    pipes/
    constants/
    enums/
```

Example

```
common/

    filters/

        all-exception.filter.ts

    guards/

        jwt.guard.ts

    decorators/

        current-user.decorator.ts

    pipes/

        validation.pipe.ts
```

Difference from Shared Module:

* **Shared module** usually exports injectable services/modules for reuse.
* **Common** stores generic application building blocks (guards, pipes, decorators, filters, constants, etc.). It may or may not be a Nest module.

---

# 8. Utilities

Utility functions contain reusable logic that is usually stateless and doesn't need dependency injection.

Example

```
utils/

    hash.ts
    jwt.ts
    date.ts
    string.ts
    pagination.ts
```

Example

```ts
export function generateSlug(name: string) {
    return name.toLowerCase().replace(/\s+/g, "-");
}
```

Use

```ts
const slug = generateSlug(product.name);
```

Utilities are generally pure functions.

---

# 9. Exception Handling Strategy

Instead of throwing random errors everywhere, define a consistent strategy.

Example

```
Controller
      ↓
Service
      ↓
Repository

      ↓
Exception Filter

↓

Client
```

Service

```ts
if (!user) {
    throw new NotFoundException("User not found");
}
```

Global filter

```ts
@Catch()
export class AllExceptionFilter implements ExceptionFilter {

    catch(exception: unknown, host: ArgumentsHost) {

        const response = host.switchToHttp().getResponse();

        response.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
}
```

Every error gets the same response structure.

Example response

```json
{
    "success": false,
    "statusCode": 404,
    "message": "User not found",
    "timestamp": "2026-08-07T06:30:00.000Z"
}
```

---

# How they fit together

```
                Client
                   │
                   ▼
            Controller Layer
                   │
                   ▼
               DTO Layer
                   │
                   ▼
             Service Layer
         (Business Logic)
                   │
                   ▼
          Repository Pattern
                   │
                   ▼
              Database Layer

Cross-cutting concerns:
─────────────────────────────────
Common/
 • Guards
 • Pipes
 • Interceptors
 • Filters
 • Decorators

Shared/
 • Logger
 • Cache
 • Database
 • Redis

Utilities/
 • Helper functions
 • Date utilities
 • Pagination
 • Slug generation

Exception Handling
 • Global filters
 • Custom exceptions
 • Standardized error responses
```

## Recommended folder structure for a production NestJS application

```
src/
├── common/
│   ├── decorators/
│   ├── filters/
│   ├── guards/
│   ├── interceptors/
│   ├── pipes/
│   ├── constants/
│   └── enums/
│
├── shared/
│   ├── database/
│   ├── logger/
│   ├── cache/
│   └── redis/
│
├── utils/
│   ├── date.ts
│   ├── pagination.ts
│   └── slug.ts
│
├── auth/
│   ├── dto/
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   ├── auth.repository.ts
│   └── auth.module.ts
│
├── users/
│   ├── dto/
│   ├── schemas/
│   ├── users.controller.ts
│   ├── users.service.ts
│   ├── users.repository.ts
│   └── users.module.ts
│
└── app.module.ts
```

This structure combines **feature-based organization** with **layered architecture**, uses the **Repository Pattern** and **Service Layer** for separation of concerns, keeps validation in **DTOs**, centralizes reusable infrastructure in **Shared**, places cross-cutting code in **Common**, isolates stateless helpers in **Utilities**, and applies a consistent **exception handling strategy** across the application.
