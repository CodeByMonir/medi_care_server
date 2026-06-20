const express = require("express");
const cors = require('cors');
const app = express();
const { MongoClient, ServerApiVersion } = require("mongodb");
require ('dotenv').config();
const port = 5000;


app.use(cors());
app.use(express.json());




app.get("/", (req, res) => {
  res.send("Hello World!");
});




const uri = process.env.MONGO_DB_URI;


const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();


    const database = client.db("MediCare");
    const doctorCollection = database.collection("doctors");

    app.get('/api/doctors', async(req, res) => {
      const query = {};
      if(req.query.doctorId){
        query.doctorId = req.query.doctorId;
      }
      if(req.query.verification){
        query.verification = req.query.verification;
      }

      const cursor = doctorCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    })

    app.post('/api/doctors', async(req, res) =>{
        const doctor = req.body;
        const result = await doctorCollection.insertOne(doctor);
        res.send(result);
    })


    
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!",
    );
  } finally {
    
    // await client.close();
  }
}
run().catch(console.dir);





app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
