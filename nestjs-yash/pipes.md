In **NestJS**, pipes are classes used to **transform input data** and/or **validate input data** before it reaches your controller method.

## 7. Pipes

### 1. Built-in Pipes

NestJS provides several ready-made pipes:

* `ValidationPipe`
* `ParseIntPipe`
* `ParseFloatPipe`
* `ParseBoolPipe`
* `ParseArrayPipe`
* `ParseUUIDPipe`
* `DefaultValuePipe`

#### Example: `ParseIntPipe`

Suppose the route receives an ID:

```typescript
@Get(':id')
findUser(@Param('id', ParseIntPipe) id: number) {
  console.log(typeof id); // number
  return `User ID: ${id}`;
}
```

Request:

```text
GET /users/10
```

Without the pipe, `id` is a string `"10"`.

With `ParseIntPipe`, it becomes the number `10`.

If the request is:

```text
GET /users/abc
```

NestJS returns a **400 Bad Request** because `"abc"` cannot be converted to an integer.

---

## 2. Custom Pipes

A **custom pipe** is a pipe that you create yourself when the built-in pipes don't meet your requirements.

A pipe must implement `PipeTransform`.

### Example

```typescript
import {
  ArgumentMetadata,
  Injectable,
  PipeTransform,
} from '@nestjs/common';

@Injectable()
export class UppercasePipe implements PipeTransform {
  transform(value: string, metadata: ArgumentMetadata) {
    return value.toUpperCase();
  }
}
```

Use it in a controller:

```typescript
@Get()
getName(@Query('name', UppercasePipe) name: string) {
  return `Hello ${name}`;
}
```

Request:

```text
GET /users?name=john
```

Result:

```text
Hello JOHN
```

The custom pipe transformed `"john"` into `"JOHN"`.

---

## 3. Validation Pipe

`ValidationPipe` is used to **validate incoming data**.

It is commonly used with DTOs and `class-validator`.

### DTO

```typescript
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsEmail()
  email: string;
}
```

### Controller

```typescript
@Post()
createUser(@Body(new ValidationPipe()) user: CreateUserDto) {
  return user;
}
```

Valid request:

```json
{
  "name": "John",
  "email": "john@example.com"
}
```

Invalid request:

```json
{
  "name": "",
  "email": "hello"
}
```

The `ValidationPipe` detects that:

* `name` is empty
* `email` is not a valid email

and returns a **400 Bad Request**.

### Global ValidationPipe

Usually, it is better to configure it globally:

```typescript
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  await app.listen(3000);
}
```

---

## 4. Transformation Pipe

A transformation pipe changes the input into another format or type.

For example, converting a string to a number:

```typescript
@Get(':id')
getUser(@Param('id', ParseIntPipe) id: number) {
  return {
    id,
    type: typeof id,
  };
}
```

Request:

```text
GET /users/25
```

Output:

```json
{
  "id": 25,
  "type": "number"
}
```

Here:

```text
"25" → 25
```

So, **transformation pipes modify the input value**.

### Custom transformation example

```typescript
@Injectable()
export class TrimPipe implements PipeTransform {
  transform(value: string) {
    return value.trim();
  }
}
```

Usage:

```typescript
@Get()
getName(@Query('name', TrimPipe) name: string) {
  return name;
}
```

Request:

```text
GET /users?name=%20John%20
```

The pipe converts:

```text
" John " → "John"
```

---

## 5. Parsing Pipes

Parsing pipes convert a value from one type/representation into another and reject it when it cannot be parsed.

### `ParseIntPipe`

```typescript
@Get(':id')
getUser(@Param('id', ParseIntPipe) id: number) {
  return id;
}
```

```text
"123" → 123
```

### `ParseFloatPipe`

```typescript
@Get()
getPrice(@Query('price', ParseFloatPipe) price: number) {
  return price;
}
```

Request:

```text
GET /products?price=99.50
```

Result:

```text
99.5
```

### `ParseBoolPipe`

```typescript
@Get()
getProducts(
  @Query('active', ParseBoolPipe) active: boolean,
) {
  return active;
}
```

Request:

```text
GET /products?active=true
```

Result:

```text
true
```

### `ParseUUIDPipe`

```typescript
@Get(':id')
getUser(
  @Param('id', new ParseUUIDPipe()) id: string,
) {
  return id;
}
```

It checks whether the parameter is a valid UUID.

---

## Quick Difference

| Pipe type               | Purpose                               | Example           |
| ----------------------- | ------------------------------------- | ----------------- |
| **Built-in Pipe**       | Ready-made NestJS functionality       | `ParseIntPipe`    |
| **Custom Pipe**         | Your own pipe logic                   | `UppercasePipe`   |
| **Validation Pipe**     | Checks whether input is valid         | `ValidationPipe`  |
| **Transformation Pipe** | Changes input value/type              | `"25"` → `25`     |
| **Parsing Pipe**        | Parses a value into the required type | `"10.5"` → `10.5` |

### Easy way to remember

```text
Request
   ↓
Pipe
   ↓
Validate / Transform / Parse
   ↓
Controller
   ↓
Service
```

For example:

```text
GET /users/25
       ↓
ParseIntPipe
       ↓
"25" → 25
       ↓
Controller receives id = 25
```

**In short:** NestJS pipes sit between the incoming request and your controller handler, primarily for **validation and transformation**.
