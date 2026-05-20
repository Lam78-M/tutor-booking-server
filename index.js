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
    // Connect the client to the server	(optional starting in v4.7)
    //adding to databashe with server
    await client.connect();
    const db = client.db('mediqueue')
    const addTutorCollection = db.collection('addtutors')

   //get data  to the front end
   app.get('/tutor', async (req,res)=>{
    const result = await addTutorCollection.find().toArray()
    res.json(result)
   })

   
   // send to database
   app.post('/tutor',async (req, res) =>{
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