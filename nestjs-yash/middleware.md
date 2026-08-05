To apply different middlewares to different routes, you can make multiple separate calls to the `consumer` object within your `configure` method.

The `MiddlewareConsumer` builder allows you to chain and repeat `.apply().forRoutes()` as many times as you need.

### Example: Different Middlewares for Different Routes

```typescript
import { Module, NestModule, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { LoggerMiddleware } from './logger.middleware';
import { AuthMiddleware } from './auth.middleware';
import { CatsController } from './cats/cats.controller';
import { UsersController } from './users/users.controller';

@Module({
  controllers: [CatsController, UsersController],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // 1. Apply ONLY LoggerMiddleware to the entire CatsController
    consumer
      .apply(LoggerMiddleware)
      .forRoutes(CatsController);

    // 2. Apply ONLY AuthMiddleware to specific routes in UsersController
    consumer
      .apply(AuthMiddleware)
      .forRoutes(
        { path: 'users/profile', method: RequestMethod.GET },
        { path: 'users/settings', method: RequestMethod.PUT },
      );

    // 3. (Optional) You can even combine both on another route or controller
    consumer
      .apply(LoggerMiddleware, AuthMiddleware)
      .forRoutes('admin');
  }
}

```

### How it works:

* Each call to `consumer.apply(...)` starts a new configuration block.
* You can target entirely different controllers, specific string paths, or specific HTTP methods (`RequestMethod.GET`, `POST`, etc.) for each distinct middleware setup.