const express = require('express')
const dontenv = require('dotenv')
const cors = require("cors")
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const { createRemoteJWKSet, jwtVerify } = require('jose-cjs');

dontenv.config()

const app = express()

app.use(cors())      
app.use(express.json())

const PORT = process.env.PORT || 5000;
const uri = process.env.MONGODB_URI
   

// name:mediqueuebookstore
// password: T9kuS5vBBa1UH2IAno

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

const JWKS =  createRemoteJWKSet( new URL(`${process.env.CLIENT_URL}/api/auth/jwks`))

const verifyToken = async (req, res, next)=>{
  const authHeader = req?.headers.authorization;
  if(!authHeader){
    return res.status(401).json({
      message: "Unauthorized"
    })
  }
const token = authHeader.split(" ")[1]
if(!token){
   return res.status(401).json({
      message: "Unauthorized"
    })
}
console.log(token)

try{
  const {payload} = await jwtVerify(token, JWKS ) 
  console.log(payload) 
  next()
}
catch(error){
  return res.status(403).json({
    message: "Forbidden"
  })
}


}

async function run() {
  try {
    //adding to databashe with server
    // await client.connect();
    const db = client.db('mediqueue')
    const addTutorCollection = db.collection('addtutors')
    const addTutorAllCollection = db.collection('tutorall')
    const bookingCollection = db.collection("bookings")

    //booking settings

app.post("/bookings", verifyToken, async (req, res) => {
  try {
    const booking = req.body;

    // 1. আগে slot কমাও (IMPORTANT PART)
    const tutorUpdate = await addTutorAllCollection.updateOne(
      {
        _id: new ObjectId(booking.tutorId),
        availableSlots: { $gt: 0 },
      },
      {
        $inc: { availableSlots: -1 },
      }
    );

    // 2. যদি slot না থাকে → stop
    if (tutorUpdate.modifiedCount === 0) {
      return res.json({ 
        success: false,
        message: "No slots available",
      });
    }

    // 3. তারপর booking save করো
    const result = await bookingCollection.insertOne(booking);

    // 4. response পাঠাও
    res.json({
      success: true,
      insertedId: result.insertedId,
    });

  } catch (error) {
    res.status(500).json({ success: false, error });
  }
});
//book get method
app.get("/bookings", verifyToken, async (req, res) => {
  try {
    const result = await bookingCollection.find().toArray();
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error });
  }
});
//tyt dto dkiakdefjie iofehf

app.get('/tutor', async (req, res) => {
  const { search = "", startDate, endDate } = req.query;

  let query = {};

  // Name Search (case insensitive)
  if (search) {
    query.tutorName = {
      $regex: search,
      $options: "i",
    };
  }

  // Date Filter
  if (startDate && endDate) {
    query.sessionStart = {
      $gte: new Date(startDate),
      $lte: new Date(endDate),
    };
  }

  const result = await addTutorAllCollection.find(query).toArray();

  res.send(result);
});


// 00000000000000000000000000000000000000000000


app.get("/tutor/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid ID" });
    }

    const tutor = await addTutorAllCollection.findOne({
      _id: new ObjectId(id),
    });

    if (!tutor) {
      return res.status(404).json({ message: "Tutor not found" });
    }

    res.json(tutor);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error", error });
  }
});


  //  -------------------------------
   //get data  to the front end
   app.get('/add-tutor',  async (req,res)=>{
    const result = await addTutorCollection.find().toArray()
    res.json(result)
   })

     
   // send to database
   app.post('/add-tutor', verifyToken,async (req, res) =>{
      const  addtutorData = {
    ...req.body,
    sessionStart: new Date(req.body.sessionStart),
  };
  
      const result = await  addTutorCollection.insertOne(addtutorData)
      res.json(result) 
   })

   //data collect in details page 
   app.get("/homepagetutor/:id", verifyToken,  async(req, res)=>{
    const {id} = req.params
    const result = await addTutorCollection.findOne({_id: new ObjectId(id)})
    res.json(result)
   })

   //patch api for only spcific edit

   app.patch("/add-tutor/:id", async(req, res)=>{
    const {id} = req.params
    const updatedData = req.body
    const result = await addTutorCollection.updateOne(
      {_id: new ObjectId(id)},
      {$set: updatedData}
    )
    res.json(result)
   })
   //--------delete

   app.delete("/add-tutor/:id", async(req, res)=>{
     const {id} = req.params;
     const result = await  addTutorCollection.deleteOne({_id: new ObjectId(id)})
     res.json(result)
   })

   

    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/',(req, res) =>{
    res.send("SERVER IS RUNNING VERY WELLY")
})

app.listen(PORT, ()=>{
    console.log(`Server is running on port ${PORT}`)
})