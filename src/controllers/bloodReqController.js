const { ObjectId } = require("mongodb");
const { bloodReqCollection, userCollection } = require("../config/db");

exports.createBloodReq = async (req, res) => {
  try {
    const data = req.body;
    if (!data.requesterEmail || !data.recipientName || !data.bloodGroup || !data.recipientDistrict || !data.hospitalName) {
      return res.status(400).send({ success: false, message: "Missing mandatory fields!" });
    }
    const finalDocument = { ...data, status: data.status || "pending", createdAt: new Date() };
    const result = await bloodReqCollection.insertOne(finalDocument);
    res.status(201).send({ success: true, message: "Request created successfully!", insertedId: result.insertedId });
  } catch (error) {
    res.status(500).send({ success: false, message: "Internal server error!" });
  }
};

exports.getBloodRequests = async (req, res) => {
  try {
    const { email, status } = req.query;
    let filter = {};
    if (email) filter.requesterEmail = email;
    if (status && status !== "all") filter.status = { $in: [status] };
    const result = await bloodReqCollection.find(filter).sort({ createdAt: -1 }).toArray();
    return res.status(200).json({ success: true, count: result.length, data: result });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

exports.getBloodReqDetails = async (req, res) => {
  try {
    const query = { _id: new ObjectId(req.params.id) };
    const requestDetails = await bloodReqCollection.findOne(query);
    if (!requestDetails) return res.status(404).json({ success: false, message: "No request found" });
    return res.status(200).json({ success: true, data: requestDetails });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

exports.patchBloodReq = async (req, res) => {
  const { status, donorName, donorEmail } = req.body;
  const filter = { _id: new ObjectId(req.params.id) };
  const updateFields = {};
  if (status) updateFields.status = status;
  if (donorName !== undefined) updateFields.donorName = donorName;
  if (donorEmail !== undefined) updateFields.donorEmail = donorEmail;
  
  const result = await bloodReqCollection.updateOne(filter, { $set: updateFields });
  res.json({ success: true, data: result });
};

exports.editBloodReq = async (req, res) => {
  const filter = { _id: new ObjectId(req.params.id) };
  const { recipientName, hospitalName, fullAddress, donationDate, donationTime, requestMessage, bloodGroup, recipientDistrict, recipientUpazila } = req.body;
  const result = await bloodReqCollection.updateOne(filter, {
    $set: { recipientName, hospitalName, fullAddress, donationDate, donationTime, requestMessage, bloodGroup, recipientDistrict, recipientUpazila }
  });
  res.json({ success: true, data: result });
};

exports.deleteBloodReq = async (req, res) => {
  await bloodReqCollection.deleteOne({ _id: new ObjectId(req.params.id) });
  res.json({ success: true, message: "Request deleted successfully" });
};

exports.getAdminAllBloodRequests = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status && status !== "all" ? { status } : {};
    const result = await bloodReqCollection.find(filter).sort({ createdAt: -1 }).toArray();
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

exports.getStats = async (req, res) => {
  const totalDonors = await userCollection.countDocuments({ role: "donor" });
  const totalRequests = await bloodReqCollection.countDocuments();
  res.json({ totalDonors, totalRequests });
};
