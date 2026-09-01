Here is the expanded, production-grade guide covering all requested files, key edge-case handling, and essential architectural updates.

---

### Key Architectural Enhancements Included

* **Environment Variable Asynchrony:** `JwtModule.registerAsync()` prevents `process.env.JWT_SECRET` from reading as `undefined` at module load time.
* **Database Schema Rigor:** Added `trim`, `lowercase`, and missing schema features.
* **Local Strategy Refinement:** Prevents local credentials from leaking into Google-linked accounts without passwords.
* **Separation of Concerns:** Isolated `UserModule` logic cleanly from `AuthModule`.

---

## 1. Setup & Dependencies

Ensure all runtime and developer dependencies are installed inside `nest_practice`:

```bash
npm install @nestjs/config @nestjs/jwt @nestjs/mongoose @nestjs/passport mongoose passport passport-jwt passport-local passport-google-oauth20 bcrypt class-validator class-transformer
npm install -D @types/bcrypt @types/passport-local @types/passport-jwt @types/passport-google-oauth20

```

---

## 2. Environment Setup

Create `.env` in the project root (and ensure `.env` is listed in `.gitignore`):

```env
PORT=3000
MONGO_URI=mongodb://127.0.0.1:27017/nest_auth
JWT_SECRET=super_secret_jwt_key_change_me_in_production_32_chars
JWT_EXPIRES_IN=1h
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback

```

---

## 3. Core Module & Application Setup

### `src/app.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('MONGO_URI'),
      }),
    }),
    AuthModule,
    UserModule,
  ],
})
export class AppModule {}

```

### `src/main.ts`

```typescript
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT') ?? 3000;

  await app.listen(port);
}
bootstrap();

```

---

## 4. Common Authorization Components

### `src/common/enums/role.ts`

```typescript
export enum Role {
  Admin = 'admin',
  User = 'user',
}

```

### `src/common/constants/common.ts`

```typescript
export const ROLES_KEY = 'roles';

```

### `src/common/decorators/roles.ts`

```typescript
import { SetMetadata } from '@nestjs/common';
import { Role } from '../enums/role';
import { ROLES_KEY } from '../constants/common';

export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);

```

### `src/common/guards/role.guard.ts`

```typescript
import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../constants/common';
import { Role } from '../enums/role';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.role) {
      throw new ForbiddenException('Access denied: No role assigned');
    }

    const hasRole = requiredRoles.includes(user.role);
    if (!hasRole) {
      throw new ForbiddenException('Access denied: Insufficient privileges');
    }

    return true;
  }
}

```

---

## 5. User Domain Implementation

### `src/user/schemas/user.schema.ts`

```typescript
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { Role } from '../../common/enums/role';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true, trim: true })
  username: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email: string;

  @Prop({ select: false })
  password?: string;

  @Prop({ unique: true, sparse: true })
  googleId?: string;

  @Prop({ type: String, enum: Role, default: Role.User })
  role: Role;
}

export const UserSchema = SchemaFactory.createForClass(User);

```

### `src/user/user.service.ts`

```typescript
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  async findById(id: string): Promise<UserDocument> {
    const user = await this.userModel.findById(id).exec();
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async remove(id: string): Promise<{ message: string }> {
    const deleted = await this.userModel.findByIdAndDelete(id).exec();
    if (!deleted) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return { message: 'User deleted successfully' };
  }
}

```

### `src/user/user.controller.ts`

```typescript
import {
  Controller,
  Delete,
  Get,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../common/decorators/roles';
import { Role } from '../common/enums/role';
import { RoleGuard } from '../common/guards/role.guard';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get('me')
  getSelfProfile(@Req() req: any) {
    return this.userService.findById(req.user.userId);
  }

  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Roles(Role.Admin)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(id);
  }
}

```

### `src/user/user.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schemas/user.schema';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService, MongooseModule],
})
export class UserModule {}

```

---

## 6. Auth Data Transfer Objects (DTOs)

### `src/auth/dto/register.dto.ts`

```typescript
import { IsEmail, IsString, Length, MinLength } from 'class-validator';

export class RegisterDto {
  @IsString()
  @Length(3, 30)
  username: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;
}

```

### `src/auth/dto/login.dto.ts`

```typescript
import { IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsString()
  username: string;

  @IsString()
  @MinLength(8)
  password: string;
}

```

---

## 7. Auth Repository & Service Layer

### `src/auth/auth.repo.ts`

```typescript
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../user/schemas/user.schema';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthRepo {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  async create(dto: RegisterDto, passwordHash: string): Promise<UserDocument> {
    const newUser = new this.userModel({
      ...dto,
      password: passwordHash,
    });
    return newUser.save();
  }

  async findByUsernameWithPassword(username: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ username }).select('+password').exec();
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async findByGoogleId(googleId: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ googleId }).exec();
  }

  async createGoogleUser(data: {
    username: string;
    email: string;
    googleId: string;
  }): Promise<UserDocument> {
    const newUser = new this.userModel(data);
    return newUser.save();
  }
}

```

### `src/auth/auth.service.ts`

```typescript
import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserDocument } from '../user/schemas/user.schema';
import { AuthRepo } from './auth.repo';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly repo: AuthRepo,
    private readonly jwt: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existingUser = await this.repo.findByEmail(dto.email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);
    const user = await this.repo.create(dto, passwordHash);
    return this.safeUser(user);
  }

  async validateLocalUser(username: string, pass: string): Promise<UserDocument> {
    const user = await this.repo.findByUsernameWithPassword(username);

    // Guard against OAuth users without a password set attempting local login
    if (!user || !user.password) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isMatch = await bcrypt.compare(pass, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return user;
  }

  async login(user: UserDocument) {
    const payload = {
      sub: user._id.toString(),
      email: user.email,
      role: user.role,
    };

    return {
      accessToken: await this.jwt.signAsync(payload),
      user: this.safeUser(user),
    };
  }

  async validateGoogleUser(profile: {
    googleId: string;
    email: string;
    username: string;
  }): Promise<UserDocument> {
    const googleUser = await this.repo.findByGoogleId(profile.googleId);
    if (googleUser) {
      return googleUser;
    }

    const emailUser = await this.repo.findByEmail(profile.email);
    if (emailUser) {
      emailUser.googleId = profile.googleId;
      return emailUser.save();
    }

    return this.repo.createGoogleUser(profile);
  }

  private safeUser(user: UserDocument) {
    return {
      id: user._id.toString(),
      username: user.username,
      email: user.email,
      role: user.role,
    };
  }
}

```

---

## 8. Authentication Strategies

### `src/auth/strategies/passport-local.ts`

```typescript
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, 'local') {
  constructor(private readonly authService: AuthService) {
    super({
      usernameField: 'username',
      passwordField: 'password',
    });
  }

  async validate(username: string, pass: string) {
    return this.authService.validateLocalUser(username, pass);
  }
}

```

### `src/auth/strategies/jwt-strategy.ts`

```typescript
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET')!,
    });
  }

  async validate(payload: { sub: string; email: string; role: string }) {
    return {
      userId: payload.sub,
      email: payload.email,
      role: payload.role,
    };
  }
}

```

### `src/auth/strategies/google-strategy.ts`

```typescript
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-google-oauth20';
import { AuthService } from '../auth.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    configService: ConfigService,
    private readonly authService: AuthService,
  ) {
    super({
      clientID: configService.get<string>('GOOGLE_CLIENT_ID')!,
      clientSecret: configService.get<string>('GOOGLE_CLIENT_SECRET')!,
      callbackURL: configService.get<string>('GOOGLE_CALLBACK_URL')!,
      scope: ['email', 'profile'],
    });
  }

  async validate(_accessToken: string, _refreshToken: string, profile: Profile) {
    const email = profile.emails?.[0]?.value;
    if (!email) {
      throw new Error('No primary email found in Google account response');
    }

    return this.authService.validateGoogleUser({
      googleId: profile.id,
      email,
      username: profile.displayName || email.split('@')[0],
    });
  }
}

```

---

## 9. Auth Controller & Module

### `src/auth/auth.controller.ts`

```typescript
import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @UseGuards(AuthGuard('local'))
  @Post('login')
  login(@Body() _dto: LoginDto, @Req() req: any) {
    return this.authService.login(req.user);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('profile')
  getProfile(@Req() req: any) {
    return req.user;
  }

  @UseGuards(AuthGuard('google'))
  @Get('google')
  async googleAuth() {}

  @UseGuards(AuthGuard('google'))
  @Get('google/callback')
  googleAuthRedirect(@Req() req: any) {
    return this.authService.login(req.user);
  }
}

```

### `src/auth/auth.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { UserModule } from '../user/user.module';
import { AuthController } from './auth.controller';
import { AuthRepo } from './auth.repo';
import { AuthService } from './auth.service';
import { GoogleStrategy } from './strategies/google-strategy';
import { JwtStrategy } from './strategies/jwt-strategy';
import { LocalStrategy } from './strategies/passport-local';

@Module({
  imports: [
    UserModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRES_IN') ?? '1h',
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    AuthRepo,
    LocalStrategy,
    JwtStrategy,
    GoogleStrategy,
  ],
  exports: [AuthService],
})
export class AuthModule {}

```

---

## 10. API Verification Commands

### Start Server

```bash
npm run start:dev

```

### 1. Register Local User

```bash
curl -X POST http://localhost:3000/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"username":"dev_user","email":"dev@example.com","password":"securepassword123"}'

```

### 2. Login to Get Bearer JWT

```bash
curl -X POST http://localhost:3000/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"username":"dev_user","password":"securepassword123"}'

```

### 3. Query Protected Route

```bash
curl -X GET http://localhost:3000/auth/profile \
  -H 'Authorization: Bearer <PASTE_JWT_TOKEN_HERE>'

```

### 4. Query Self Profile

```bash
curl -X GET http://localhost:3000/users/me \
  -H 'Authorization: Bearer <PASTE_JWT_TOKEN_HERE>'

```

### 5. Attempt Admin Route (Fails with 403 Forbidden for `user` role)

```bash
curl -X DELETE http://localhost:3000/users/<USER_ID> \
  -H 'Authorization: Bearer <PASTE_JWT_TOKEN_HERE>'

```