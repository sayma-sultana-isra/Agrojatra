import express from "express";
import dotenv from "dotenv";
dotenv.config();

const app=  express();



app.get("/", (req,res) => {
    res.send("Server is ready");
});


 app.listen(8080, () => {

    console.log("Server started at http://localhost:8080");
 });
  
 
