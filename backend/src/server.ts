import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose'
import authRouter from './routers/auth.router'
import testRouter from './routers/testing.router'

const app = express()
app.use(cors())
app.use(express.json())

mongoose.connect('mongodb://127.0.0.1:27017/projectPIA')
const conn = mongoose.connection
conn.once('open', ()=>{
    console.log("DB ok")
})


const router = express.Router()
app.use("/auth", authRouter)


router.use("/testing",testRouter);


router.get("/test",(req,res) => {
    console.log("jupiii");
    res.json({message:"nesto"});
})



app.use('/', router)
app.listen(4000, ()=>console.log('Express running on port 4000'))
