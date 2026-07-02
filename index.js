const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const { jwtVerify, createRemoteJWKSet } = require("jose-cjs");
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

const CLIENT_URL = process.env.CLIENT_URL; 

const JWKS = createRemoteJWKSet(
  new URL(`${CLIENT_URL}/api/auth/jwks`)
);

const verifyToken = async(req, res, next) => {
  const authHeader =  req?.headers.authorization
  // console.log(authHeader)
  if(!authHeader){
    return res.status(401).json({ message: "unauthorized" });
  }
  const token = authHeader.split(" ")[1]
  // console.log(token)
  if(!token){
    return res.status(401).json({ message: "unauthorized" });
  }
  try {
    const {payload} = await jwtVerify(token, JWKS);
    // console.log(payload);
  } catch (error) {
    return res.status(403).json({message: "Forbidden"});
  }
  // console.log(token);
  next()
}

async function run() {
  try {
    await client.connect();

// client.connect(()=>{
//   console.log('connecting to mongodb')
// }).catch(console.dir)

    const db = client.db("pulse-bond");
    const userCollection = db.collection("user");
    const bloodReqCollection = db.collection("bloodReq");

    app.patch("/dashboard/profile-update", verifyToken,  async (req, res) => {
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

    app.post("/dashboard/blood-req", verifyToken,  async (req, res) => {
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

    app.get("/bloodReq", async (req, res) => {
      try {
        const { email, status } = req.query;
        let filter = {};
        if (email) {
          filter.requesterEmail = email;
        }
        if (status && status !== "all") {
          filter.status = {
            $in: [status]
          }
        }
        const result = await bloodReqCollection
          .find(filter)
          .sort({ createdAt: -1 })
          .toArray();
        return res.status(200).json({
          success: true,
          count: result.length,
          data: result,
        });
      } catch (error) {
        console.error(" Express Backend Error:", error);
        return res.status(500).json({
          success: false,
          message: "Internal Server Error",
        });
      }
    });

    app.get("/bloodReq/:id",   async (req, res) => {
      try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const requestDetails = await bloodReqCollection.findOne(query);
        if (!requestDetails) {
          return res
            .status(404)
            .json({ success: false, message: "No request found with this ID" });
        }
        return res.status(200).json({
          success: true,
          data: requestDetails,
        });
      } catch (error) {
        console.error("🔥 Error fetching request details:", error);
        return res
          .status(500)
          .json({ success: false, message: "Internal Server Error" });
      }
    });

    app.patch("/bloodReq/:id", verifyToken,  async (req, res) => {
      const {status, donorName, donorEmail} = req.body;
      const {id} = req.params;
      const filter = {
        _id : new ObjectId(id),
      }
      const updateFields = {}
      if(status) updateFields.status = status;
      if(donorName !== undefined) updateFields.donorName = donorName;
      if(donorEmail !== undefined) updateFields.donorEmail = donorEmail;

      const updatedDoc = {
        $set : updateFields
      }
      const result = await bloodReqCollection.updateOne(filter, updatedDoc);
      res.json({success: true, data:result});
    });


    app.patch("/dashboard/bloodReq/edit/:id", verifyToken, async(req, res) => {
      const { id } = req.params;
      const filter = {_id : new ObjectId(id)};
      const {recipientName, hospitalName, fullAddress, donationDate, donationTime, requestMessage, bloodGroup, recipientDistrict, recipientUpazila} = req.body;

      const updatedDoc = {
        $set: {recipientName, hospitalName, fullAddress, donationDate, donationTime, requestMessage, bloodGroup, recipientDistrict, recipientUpazila}
      }
      const result = await bloodReqCollection.updateOne(filter, updatedDoc);
      res.json({ success: true, data: result });
    });

    app.delete("/bloodReq/:id", verifyToken, async(req, res) => {
      const {id} = req.params;
      const result = await bloodReqCollection.deleteOne({_id: new ObjectId(id)});
       res.json({ success: true, message: "Request deleted successfully" });
    })

    app.get("/searchDonor", async(req, res) => {
     try {
       const { bloodGroup, district, upazila } = req.query;
      const filter = {}
      if(bloodGroup){
        filter.bloodGroup = bloodGroup
      }
      if(district){
        filter.district = district
      }
      
      if(upazila){
        filter.upazila = upazila
      }
      const result = await userCollection.find(filter).toArray();
      return res.status(200).json({
          success: true,
          count: result.length,
          data: result,
        });
     } catch (error) {
      console.error(" Express Backend Error:", error);
        return res.status(500).json({
          success: false,
          message: "Internal Server Error",
        });
     }
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

app.get("/", (req, res) => {
  res.send("Pulse Bond Server Running");
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

// module.exports = app;
