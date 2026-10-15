const { MongoClient, ServerApiVersion } = require("mongodb");

const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error("Please add your Mongo URI to .env");
}

let client;
let clientPromise;

if (!global._mongoClientPromise) {
  client = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    },
  });
  global._mongoClientPromise = client.connect();
}
clientPromise = global._mongoClientPromise;

// Functional initialization helper models
const getDb = async () => {
  const connectedClient = await clientPromise;
  const db = connectedClient.db("pulse-bond");
  return {
    userCollection: db.collection("user"),
    bloodReqCollection: db.collection("bloodReq"),
  };
};

module.exports = { getDb };
