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


  const logger= (req, res) => {
    console.log('logger logged', req.params);

    next();
  }



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
const userCollection = database.collection("users");
const doctorCollection = database.collection("doctors");
const appointmentCollection = database.collection("appointments");
const paymentCollection = database.collection("payments");
const reviewCollection = database.collection("reviews");
const prescriptionCollection = database.collection("prescriptions");

// created for doctors verification application.
app.post("/api/users", async (req, res) => {
  const user = req.body;
  const result = await userCollection.insertOne(user);
  res.send(result);
});


// created for 
app.get("/api/users", async (req, res) => {
  try {
    const sessionId = req.query.sessionId;

    if (!sessionId) {
      return res
        .status(400)
        .json({ error: "Session ID parameter is required" });
    }

    const result = await userCollection.findOne({
      patientId: sessionId,
    });

    // CRITICAL: If result is null, send a clear JSON error instead of an empty body
    if (!result) {
      return res.status(404).json({ error: "User profile not found" });
    }

    // Always use res.json() instead of res.send() to guarantee clean JSON formatting
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});



app.delete("/api/users/:id", async (req, res) => {
  const id = req.params.id;
  const query = {
    _id: new ObjectId(id),
  };

  const result = await userCollection.deleteOne(query);
  res.send(result);
});



app.patch("/api/users",  async (req, res) => {
  try {
    const { userId } = req.query;

    const { role } = req.body;

    if (!userId) {
      return res.status(400).send({ message: "User ID is required" });
    }

    const query = { _id: new ObjectId(userId) };

    const result = await userCollection.updateOne(query, {
      $set: {
        role: role,
      },
    });

    res.send(result);
  } catch (error) {
    console.error("Backend Error:", error);
    res.status(500).send({ message: "Server error", error: error.message });
  }
});

// created for public to visits without login
app.get("/api/users/role", async (req, res) => {
  try {
    const result = await userCollection.find({}).toArray();

    res.json(result);
  } catch (error) {
    console.error("Data fetch failed:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

app.patch("/api/doctors/verify", async (req, res) => {
  try {
    const { userId } = req.query;

    const { verification } = req.body;

    if (!userId) {
      return res.status(400).send({ message: "User ID is required" });
    }

    const query = { _id: new ObjectId(userId) };

    const result = await doctorCollection.updateOne(query, {
      $set: {
        verification: verification,
      },
    });

    res.send(result);
  } catch (error) {
    console.error("Backend Error:", error);
    res.status(500).send({ message: "Server error", error: error.message });
  }
});

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

// created for public to visits without login
app.get("/api/allDoctors", async (req, res) => {
  try {
    const result = await doctorCollection.find({}).toArray();

    res.json(result);
  } catch (error) {
    console.error("Data fetch failed:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
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
    const { sessionId } = req.query;

    const query = {
      $or: [{ doctorId: sessionId }, { patientId: sessionId }],
    };

    const result = await appointmentCollection.find(query).toArray();
    // console.log(result);
    res.send(result);
  } catch (error) {
    res.status(500).send({ message: "Server error", error });
  }
});

// created for doctors so they can see appointments data
app.get("/api/appointments/:id", async (req, res) => {
  const targetId = req.params.id;

  const query = { _id: new ObjectId(targetId) };

  const result = await appointmentCollection.findOne(query);

  res.send(result);
});

// Created for doctors so they can see appointments data
app.get("/api/allAppointments", async (req, res) => {
  try {
    const result = await appointmentCollection.find({}).toArray();
    
    res.json(result); 
  } catch (error) {
    console.error("Data fetch failed:", error);
    res.status(500).json({ message: "Server error", error: error.message });
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

app.get("/api/allPayments", async (req, res) => {
  try {
    const result = await paymentCollection.find({}).toArray();

    res.json(result);
  } catch (error) {
    console.error("Data fetch failed:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

app.get("/api/payments", async (req, res) => {
  try {
    const { sessionId } = req.query;

    let query = { $or: [{ doctorId: sessionId }, { patientId: sessionId }] };

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


app.get("/api/allReviews", async (req, res) => {
  try {
    const result = await reviewCollection.find({}).toArray();

    res.json(result);
  } catch (error) {
    console.error("Data fetch failed:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

app.get("/api/reviews", async (req, res) => {
  try {
    // FIX: Extract the actual string value from the query object
    const { sessionId } = req.query;

    if (!sessionId) {
      return res
        .status(400)
        .send({ message: "sessionId query parameter is required" });
    }

    // Now the query targets a string value instead of an object
    let query = {
      $or: [{ doctorId: sessionId }, { patientId: sessionId }],
    };

    const result = await reviewCollection.find(query).toArray();
    // console.log("Database Result:", result);

    res.send(result);
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Server error", error });
  }
});

app.delete("/api/reviews/:id", async (req, res) => {
  const id = req.params.id;
  const query = {
    _id: new ObjectId(id),
  };

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

// created for doctors prescriptionData.
app.post("/api/prescriptions", async (req, res) => {
  const data = req.body;
  const result = await prescriptionCollection.insertOne(data);
  res.send(result);
});

app.get("/api/prescriptions", async (req, res) => {
  try {
    const { sessionId } = req.query;

    let query = { $or: [{ doctorId: sessionId }, { patientId: sessionId }] };

    const result = await prescriptionCollection.find(query).toArray();

    res.send(result);
  } catch (error) {
    res.status(500).send({ message: "Server error", error });
  }
});

app.patch("/api/prescriptions", async (req, res) => {
  try {
    const targetId = req.query.id || req.query._id;

    const updateFields = req.body;

    const query = { _id: new ObjectId(targetId) };

    const result = await prescriptionCollection.updateOne(query, {
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
