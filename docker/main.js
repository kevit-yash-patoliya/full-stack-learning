import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

mongoose.connect("mongodb://db:27017/demo-1").then(() => {
    console.log("Connected to MongoDB");
    
    app.get("/", (req, res) => {
        res.send("Hello World!");
    });
    
    app.listen(port, () => {
        console.log(`App is running on port ${port}`);
    });
    
}).catch((err) => {
    console.log(err);
});
