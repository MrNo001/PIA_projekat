import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose'
import path from 'path';
const { MongoClient, ServerApiVersion } = require('mongodb');

//Routers
import authRouter from './routers/auth.router'
import cottageRouter from './routers/cottages.router'
import userRouter from './routers/user.router'
import reservationRouter from './routers/reservation.router'
import ratingRouter from './routers/rating.router'
import adminRouter from './routers/admin.router'
import statisticsRouter from './routers/statistics.router'


const app = express()
app.use(cors())
app.use(express.json())


// Serve uploaded files
app.use('/uploads/cottage_photos', express.static(path.join(process.cwd(), 'uploads/cottage_photos')));
app.use('/uploads/profile_photos', express.static(path.join(process.cwd(), 'uploads/profile_photos')));


//mongoose.connect('mongodb://127.0.0.1:27017/projectPIA')

//const uri = "mongodb+srv://root_user:OGycDjSemxE4O3fd@cluster-pia.z05e793.mongodb.net/?appName=Cluster-PIA/projectPIA"

// MongoDB Atlas connection string - database name should be before query parameters
const uri = "mongodb+srv://root_user:OGycDjSemxE4O3fd@cluster-pia.z05e793.mongodb.net/projectPIA?appName=Cluster-PIA&retryWrites=true&w=majority"

// Connect to MongoDB
mongoose.connect(uri)

const conn = mongoose.connection
conn.once('open', ()=>{
    console.log("DB ok")
})


const router = express.Router()

router.use("/auth", authRouter)
router.use("/cottages",cottageRouter);
router.use("/users",userRouter);
router.use("/reservations",reservationRouter);
router.use("/ratings",ratingRouter);
router.use("/admin",adminRouter);
router.use("/statistics",statisticsRouter);

router.get("/test",(req,res) => {
    console.log("jupiii");
    res.json({message:"nesto"});
})

const PORT = process.env.PORT || 4000;

app.use('/', router)
app.listen(PORT, ()=>console.log(`Express running on port ${PORT}`))



const client = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    }
  });
  async function run() {
    try {
      // Connect the client to the server	(optional starting in v4.7)
      await client.connect();
      // Send a ping to confirm a successful connection
      await client.db("admin").command({ ping: 1 });
      console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
      // Ensures that the client will close when you finish/error
      await client.close();
    }
  }
  run().catch(console.dir);
