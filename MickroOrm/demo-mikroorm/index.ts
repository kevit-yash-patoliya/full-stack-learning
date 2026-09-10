import express, { type Request, type Response } from "express";
import { MikroORM } from "@mikro-orm/sqlite";
import config from "./config/mikroorm.js";
import { UserSchema } from "./entities/user.entity.ts";

const app = express();
const orm = await MikroORM.init(config);

// 1. Ensure the tables exist in SQLite
await orm.schema.update();

app.get("/", async (req: Request, res: Response) => {
  // 2. Fork EntityManager for request isolation
  const em = orm.em.fork();

  // 3. Create entity (synchronous) and persist
  const user = em.create(UserSchema, {
    firstName: "John",
    lastName: "Doe",
    email: "john@example.com",
  });
  await em.flush();
  console.log("Created user:", user);

  // 4. Query from identity map / DB
  const user2 = await em.findOne(UserSchema, { id: user.id });
  console.log("Same identity instance?", user2 === user);

  res.send("Hello World!");
});

app.listen(3000, () => {
  console.log("Server started on port 3000");
});
