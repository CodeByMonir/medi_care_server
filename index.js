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
    const appointmentCollection = database.collection("appointments");
    const paymentCollection = database.collection("payments");

    // created for public to visit doctors without login and only verified doctors will visible
    app.get("/api/doctors", async (req, res) => {
      const query = {};
      if (req.query.verification) {
        query.verification = req.query.verification;
      }

      const cursor = doctorCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });

    // created for public to visit doctors without login and only verified doctors will visible
    app.get("/api/doctor", async (req, res) => {
      const query = {};
      if (req.query.license) {
        query.license = req.query.license;
      }
      const cursor = doctorCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });

    // created for doctors verification application.
    app.post("/api/doctors", async (req, res) => {
      const doctor = req.body;
      const result = await doctorCollection.insertOne(doctor);
      res.send(result);
    });

    // created for doctors so they can see their profile
    app.get("/api/doctor/:doctorId", async (req, res) => {
      const doctorId = req.params.doctorId;

      const result = await doctorCollection.findOne({
        doctorId: doctorId,
      });

      res.send(result);
    });

    // created for doctors so they can update their profile
    app.patch("/api/doctor/:doctorId", async (req, res) => {
      const { doctorId } = req.params;
      const updatedData = req.body;

      const filter = { doctorId };

      const updateDoc = {
        $set: updatedData,
      };

      const result = await doctorCollection.updateOne(filter, updateDoc);

      res.send(result);
    });

    // created for collect appointments.
    app.post("/api/appointments", async (req, res) => {
      const doctor = req.body;
      const result = await appointmentCollection.insertOne(appointments);
      res.send(result);
    });


    // created for payments collections.
    app.post("/api/payments", async (req, res) => {
      const doctor = req.body;
      const result = await paymentCollection.insertOne(payments);
      res.send(result);
    });









    // don't know about you broh...

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
