const { ObjectId } = require("mongodb");
const { getDb } = require("../config/db");

exports.createBloodReq = async (req, res) => {
  try {
    const { bloodReqCollection } = await getDb();
    const data = req.body;
    const finalDocument = { ...data, status: data.status || "pending", createdAt: new Date() };
    const result = await bloodReqCollection.insertOne(finalDocument);
    res.status(201).send({ success: true, insertedId: result.insertedId });
  } catch (error) {
    res.status(500).send({ success: false });
  }
};

exports.getBloodRequests = async (req, res) => {
  try {
    const { bloodReqCollection } = await getDb();
    const { email, status } = req.query;
    let filter = {};
    if (email) filter.requesterEmail = email;
    if (status && status !== "all") filter.status = { $in: [status] };
    const result = await bloodReqCollection.find(filter).sort({ createdAt: -1 }).toArray();
    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    return res.status(500).json({ success: false });
  }
};

exports.getBloodReqDetails = async (req, res) => {
  try {
    const { bloodReqCollection } = await getDb();
    const query = { _id: new ObjectId(req.params.id) };
    const requestDetails = await bloodReqCollection.findOne(query);
    return res.status(200).json({ success: true, data: requestDetails });
  } catch (error) {
    return res.status(500).json({ success: false });
  }
};

exports.patchBloodReq = async (req, res) => {
  const { bloodReqCollection } = await getDb();
  const { status, donorName, donorEmail } = req.body;
  const result = await bloodReqCollection.updateOne({ _id: new ObjectId(req.params.id) }, { $set: { status, donorName, donorEmail } });
  res.json({ success: true, data: result });
};

exports.editBloodReq = async (req, res) => {
  const { bloodReqCollection } = await getDb();
  const { recipientName, hospitalName, fullAddress, donationDate, donationTime, requestMessage, bloodGroup, recipientDistrict, recipientUpazila } = req.body;
  const result = await bloodReqCollection.updateOne({ _id: new ObjectId(req.params.id) }, {
    $set: { recipientName, hospitalName, fullAddress, donationDate, donationTime, requestMessage, bloodGroup, recipientDistrict, recipientUpazila }
  });
  res.json({ success: true, data: result });
};

exports.deleteBloodReq = async (req, res) => {
  const { bloodReqCollection } = await getDb();
  await bloodReqCollection.deleteOne({ _id: new ObjectId(req.params.id) });
  res.json({ success: true, message: "Deleted" });
};

exports.getAdminAllBloodRequests = async (req, res) => {
  try {
    const { bloodReqCollection } = await getDb();
    const { status } = req.query;
    const filter = status && status !== "all" ? { status } : {};
    const result = await bloodReqCollection.find(filter).sort({ createdAt: -1 }).toArray();
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false });
  }
};

exports.getStats = async (req, res) => {
  const { userCollection, bloodReqCollection } = await getDb();
  const totalDonors = await userCollection.countDocuments({ role: "donor" });
  const totalRequests = await bloodReqCollection.countDocuments();
  res.json({ totalDonors, totalRequests });
};
