const express = require("express");
const cors = require("cors");
const app = express();
const { ObjectId, MongoClient, ServerApiVersion } = require("mongodb");
require("dotenv").config();
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

// async function run() {
//   try {
//     await client.connect();

client
  .connect(() => {
    console.log("connecting to MongoDB");
  })
  .catch(console.dir);

const database = client.db("MediCare");
const doctorCollection = database.collection("doctors");
const appointmentCollection = database.collection("appointments");
const paymentCollection = database.collection("payments");
const reviewCollection = database.collection("reviews");

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
  const appointments = req.body;
  const result = await appointmentCollection.insertOne(appointments);
  res.send(result);
});

// created for find doctor and patient appointments by their different doctorId and patientId.
// URL format: /api/appointments?doctorId=123 OR /api/appointments?patientId=456
app.get("/api/appointments", async (req, res) => {
  try {
    const { doctorId, patientId } = req.query;

    let query = {};

    if (doctorId || patientId) {
      query.$or = [];
      if (doctorId) query.$or.push({ doctorId: doctorId });
      if (patientId) query.$or.push({ patientId: patientId });
    }

    const result = await appointmentCollection.find(query).toArray();

    res.send(result);
  } catch (error) {
    res.status(500).send({ message: "Server error", error });
  }
});

// URL format: PATCH -> /api/appointments?doctorId=123 OR /api/appointments?patientId=456
app.patch("/api/appointments", async (req, res) => {
  try {
    const targetId = req.query.id || req.query._id;

    const updateFields = req.body;

    const query = { _id: new ObjectId(targetId) };

    const result = await appointmentCollection.updateOne(query, {
      $set: updateFields,
    });

    if (result.matchedCount === 0) {
      return res
        .status(404)
        .send({ message: "No records found matching the criteria." });
    }

    res.send(result);
  } catch (error) {
    console.error("Backend Error:", error);
    res.status(500).send({ message: "Server error", error: error.message });
  }
});

// created for payments collections.
app.post("/api/payments", async (req, res) => {
  const payments = req.body;
  const result = await paymentCollection.insertOne(payments);
  res.send(result);
});

app.get("/api/payments", async (req, res) => {
  try {
    const { doctorId, patientId } = req.query;

    let query = {};

    if (doctorId || patientId) {
      query.$or = [];
      if (doctorId) query.$or.push({ doctorId: doctorId });
      if (patientId) query.$or.push({ patientId: patientId });
    }

    const result = await paymentCollection.find(query).toArray();

    res.send(result);
  } catch (error) {
    res.status(500).send({ message: "Server error", error });
  }
});

app.post("/api/reviews", async (req, res) => {
  const review = req.body;
  // console.log(review);
  const result = await reviewCollection.insertOne(review);
  res.send(result);
});

app.get("/api/reviews", async (req, res) => {
  try {
    const { doctorId, patientId } = req.query;

    let query = {};

    if (doctorId || patientId) {
      query.$or = [];
      if (doctorId) query.$or.push({ doctorId: doctorId });
      if (patientId) query.$or.push({ patientId: patientId });
    }

    const result = await reviewCollection.find(query).toArray();

    res.send(result);
  } catch (error) {
    res.status(500).send({ message: "Server error", error });
  }
});


  app.delete("/api/reviews/:id", async (req, res) => {
    const id = req.params.id;
    const query = {
      _id: new ObjectId(id)
    }

    const result = await reviewCollection.deleteOne(query);
    res.send(result);
  });


  app.patch("/api/reviews", async (req, res) => {
    try {
      const targetId = req.query.id || req.query._id;

      const updateFields = req.body;

      const query = { _id: new ObjectId(targetId) };

      const result = await reviewCollection.updateOne(query, {
        $set: updateFields,
      });

      if (result.matchedCount === 0) {
        return res
          .status(404)
          .send({ message: "No records found matching the criteria." });
      }

      res.send(result);
    } catch (error) {
      console.error("Backend Error:", error);
      res.status(500).send({ message: "Server error", error: error.message });
    }
  });

// don't know about you broh...

//     await client.db("admin").command({ ping: 1 });
//     console.log(
//       "Pinged your deployment. You successfully connected to MongoDB!",
//     );
//   } finally {
//     // await client.close();
//   }
// }
// run().catch(console.dir);

app.listen(port, () => {
  console.log(`app is running on port ${port}`);
});

module.exports = app;
