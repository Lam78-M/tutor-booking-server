const express = require('express')
const dontenv = require('dotenv')
const cors = require("cors")
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

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

async function run() {
  try {
    //adding to databashe with server
    await client.connect();
    const db = client.db('mediqueue')
    const addTutorCollection = db.collection('addtutors')
    const addTutorAllCollection = db.collection('tutorall')
    
//tyt dto dkiakdefjie iofehf

app.get('/tutor', async (req,res)=>{
 const result = await addTutorAllCollection.find().toArray();
 res.send(result)
})

  //  -------------------------------
   //get data  to the front end
   app.get('/add-tutor', async (req,res)=>{
    const result = await addTutorCollection.find().toArray()
    res.json(result)
   })

     
   // send to database
   app.post('/add-tutor',async (req, res) =>{
      const  addtutorData = req.body
      console.log(addtutorData)
      const result = await  addTutorCollection.insertOne(addtutorData)
      res.json(result) 
   })

   //data collect in details page 
   app.get("/homepagetutor/:id",  async(req, res)=>{
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
    await client.db("admin").command({ ping: 1 });
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