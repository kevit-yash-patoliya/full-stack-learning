In **NestJS**, an **interceptor** is a class annotated with the `@Injectable()` decorator that implements the `NestInterceptor` interface. Interceptors are inspired by the Aspect-Oriented Programming (AOP) technique and allow you to execute custom logic **before and after** the execution of a route handler.

Common use cases for interceptors include:

* Binding extra behavior to a method execution (e.g., logging)
* Transforming the result returned from a function (Response Mapping)
* Transforming the exception thrown from a function
* Extending basic function behavior (e.g., Timeout, Caching)

---

## 1. Request Interceptors

An interceptor can inspect or modify the incoming request before it hits the route handler.

```typescript
// add-header.interceptor.ts
import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class AddHeaderInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    request.headers['x-custom-header'] = 'Hello from Interceptor';
    
    return next.handle(); // Pass control to the next layer
  }
}

```

---

## 2. Response Interceptors & Response Mapping

One of the most powerful features of interceptors is their ability to wrap or transform the data returned by your route handler using RxJS operators (like `map`).

```typescript
// transform.interceptor.ts
import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
  data: T;
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, Response<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<Response<T>> {
    return next.handle().pipe(
      map((data) => ({
        success: true,
        statusCode: context.switchToHttp().getResponse().statusCode,
        data,
      })),
    );
  }
}

```

---

## 3. Logging

Because interceptors wrap the execution flow, they can easily measure the time it takes for a request to be processed, making them ideal for performance logging.

```typescript
// logging.interceptor.ts
import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const method = request.method;
    const url = request.url;
    const now = Date.now();

    return next.handle().pipe(
      tap(() => {
        const responseTime = Date.now() - now;
        this.logger.log(`[${method}] ${url} - Execution took ${responseTime}ms`);
      }),
    );
  }
}

```

---

## 4. Timeout Interceptors

If a request takes too long (e.g., an external API call hangs), you can use the RxJS `timeout` operator inside an interceptor to automatically cancel it and throw a timeout error.

```typescript
// timeout.interceptor.ts
import { Injectable, NestInterceptor, ExecutionContext, CallHandler, RequestTimeoutException } from '@nestjs/common';
import { Observable, throwError, TimeoutError } from 'rxjs';
import { timeout, catchError } from 'rxjs/operators';

@Injectable()
export class TimeoutInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      timeout(5000), // Timeout after 5 seconds
      catchError((err) => {
        if (err instanceof TimeoutError) {
          return throwError(() => new RequestTimeoutException('Request timed out'));
        }
        return throwError(() => err);
      }),
    );
  }
}

```

---

## 5. Cache Interceptors

A cache interceptor can store response data for specific routes. If a subsequent request comes in with the exact same parameters, the interceptor can return the cached response directly **without** ever executing the actual route handler.

```typescript
// cache.interceptor.ts
import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class HttpCacheInterceptor implements NestInterceptor {
  private cache = new Map<string, any>();

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const key = request.url;

    // Check if data is already cached
    if (this.cache.has(key)) {
      return of(this.cache.get(key)); // Return cached data immediately
    }

    // Otherwise, execute handler and store result in cache
    return next.handle().pipe(
      tap((response) => {
        this.cache.set(key, response);
      }),
    );
  }
}

```

*(Note: NestJS also provides an official `@nestjs/cache-manager` package which includes a built-in `CacheInterceptor` for production-grade caching with Redis or memory stores).*