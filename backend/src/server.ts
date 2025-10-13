import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose'
import path from 'path';

//Routers
import authRouter from './routers/auth.router'
import testRouter from './routers/testing.router'
import vikendicaRouter from './routers/vikendica.router'
import userRouter from './routers/user.router'
import reservationRouter from './routers/reservation.router'


const app = express()
app.use(cors())
app.use(express.json())


// Serve uploaded files
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

mongoose.connect('mongodb://127.0.0.1:27017/projectPIA')
const conn = mongoose.connection
conn.once('open', ()=>{
    console.log("DB ok")
})


const router = express.Router()

router.use("/auth", authRouter)
router.use("/testing",testRouter);
router.use("/vikendice",vikendicaRouter);
router.use("/users",userRouter);
router.use("/reservations",reservationRouter);

router.get("/test",(req,res) => {
    console.log("jupiii");
    res.json({message:"nesto"});
})



app.use('/', router)
app.listen(4000, ()=>console.log('Express running on port 4000'))
