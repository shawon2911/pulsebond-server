const express = require('express');
const dotenv = require("dotenv");
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
dotenv.config();

const uri = process.env.MONGODB_URI;

const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(
  cors({
    credentials: true,
    origin: [process.env.CLIENT_URL],
  }),
);
app.use(express.json());



const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});
async function run() {
  try {
   
    await client.connect();

    const db = client.db("pulse-bond");
    const userCollection = db.collection("user");

    app.patch("/dashboard/profile-update", async (req, res) => {
      try {
        const { email, name, bloodGroup, district, upazila } = req.body;
        if (!email) {
      return res.status(400).send({ message: "Email is required to update profile" });
        }
      const filter = { email: email };
      const updateDoc = {
      $set: {
        name,
        bloodGroup,
        district,
        upazila
      },
    };
    const result = await userCollection.updateOne(filter, updateDoc);
    if (result.matchedCount === 0) {
      return res.status(404).send({ message: "User not found" });
    }
    res.send({ success: true, message: "Profile updated successfully!", result });
    
      } catch (error) {
        console.error("Update Error:", error);
    res.status(500).send({ message: "Internal server error" });
      }
    });








   
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    
    // await client.close();
  }
}
run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('Pulse Bond Server Running');
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});