import { defineConfig } from '@mikro-orm/sqlite';
import { UserSchema } from '../entities/user.entity.js';

export default defineConfig({
  dbName: 'sqlite.db',
  entities: [UserSchema],
  debug: true,
});
