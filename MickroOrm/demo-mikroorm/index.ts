import express, { Request, Response } from "express" 
import { MikroORM } from '@mikro-orm/sqlite';
import config from "./config/mikroorm.js"

const app = express()

const orm = await MikroORM.init(config)


app.get("/", (req:Request, res:Response) => {
    res.send("Hello World!")
})


// const orm = await MikroORM.init(config);

app.listen({port: 3000}, () => {
    console.log("Server started on port 3000")
})
