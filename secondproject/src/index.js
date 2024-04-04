
//require('dotenv').config({path: './env'})  // we can also write like this way no issue it will run 


import  dotenv from 'dotenv'  //second approach



import mongoose from 'mongoose';
import { DB_NAME } from './constants.js';
import connectDB from './db/db.js';
import {app} from './app.js';



dotenv.config({            //second approach
    path: './env'
})


connectDB()
.then(()=>{
    app.listen(process.env.PORT || 8000,()=>{
        console.log(`App is listening on : ${process.env.PORT}`)
    })
})
.catch((err)=>{
    console.log("MONGODB connection failed",err)
})






//1st approach 
/*
import express from 'express';
import { error } from 'console';
const app =express()

;( async()=>{
    try{
       await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`)   // database connect
       app.on("error",(error)=>{
        console.log("ERRRR:",error)
        throw error
       })
       app.listen(process.env.PORT,()=>{
        console.log(`App is listening on  ${process.env.PORT}`)
       })
    }catch(error){
        console.log(error);
        throw err
    }
})()



//connecting the server with database

*/