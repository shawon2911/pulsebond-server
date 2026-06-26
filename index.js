const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require("mongodb");
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
  },
});
async function run() {
  try {
    await client.connect();

    const db = client.db("pulse-bond");
    const userCollection = db.collection("user");
    const bloodReqCollection = db.collection("bloodReq");

    app.patch("/dashboard/profile-update", async (req, res) => {
      try {
        const { email, name, bloodGroup, district, upazila } = req.body;
        if (!email) {
          return res
            .status(400)
            .send({ message: "Email is required to update profile" });
        }
        const filter = { email: email };
        const updateDoc = {
          $set: {
            name,
            bloodGroup,
            district,
            upazila,
          },
        };
        const result = await userCollection.updateOne(filter, updateDoc);
        if (result.matchedCount === 0) {
          return res.status(404).send({ message: "User not found" });
        }
        res.send({
          success: true,
          message: "Profile updated successfully!",
          result,
        });
      } catch (error) {
        console.error("Update Error:", error);
        res.status(500).send({ message: "Internal server error" });
      }
    });

    app.post("/dashboard/blood-req", async (req, res) => {
      try {
        const data = req.body;

        if (
          !data.requesterEmail ||
          !data.recipientName ||
          !data.bloodGroup ||
          !data.recipientDistrict ||
          !data.hospitalName
        ) {
          return res.status(400).send({
            success: false,
            message:
              "Missing mandatory fields! Please fill up all required fields.",
          });
        }

        
        const finalDocument = {
          ...data,
          status: data.status || "pending", 
          createdAt: new Date(), 
        };

       
        const result = await bloodReqCollection.insertOne(finalDocument);

        
        res.status(201).send({
          success: true,
          message: "Emergency blood donation request created successfully!",
          insertedId: result.insertedId,
        });
      } catch (error) {
        console.error(
          "Blood request submission process layer crash error:",
          error,
        );
        res.status(500).send({
          success: false,
          message:
            "Internal server error! Failed to post blood donation request.",
        });
      }
    });

    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!",
    );
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Pulse Bond Server Running");
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
