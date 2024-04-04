import express from 'express';
import  cors from 'cors'
import cookieParser from 'cookie-parser';


const app = express();

app.use(cors({
    origin:process.env.CORS_ORIGIN,
    credentials:true
}))


app.use(express.json({}))

app.use(express.urlencoded({extended:false}))
app.use(express.static('public'))
app.use(cookieParser())  //by this we can access cookies anywhere just using req.cookies



//routes import

import userRouter from './routes/user.routes.js'

//router declaration
app.use('/api/v1/users',userRouter)

export {app}