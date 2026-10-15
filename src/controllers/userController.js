const { ObjectId } = require("mongodb");
const { getDb } = require("../config/db");

exports.updateProfile = async (req, res) => {
  try {
    const { userCollection } = await getDb(); // Fetch Collection Context
    const { email, name, bloodGroup, district, upazila } = req.body;
    if (!email) return res.status(400).send({ message: "Email is required" });
    const filter = { email: email };
    const updateDoc = { $set: { name, bloodGroup, district, upazila } };
    const result = await userCollection.updateOne(filter, updateDoc);
    res.send({ success: true, message: "Profile updated successfully!", result });
  } catch (error) {
    res.status(500).send({ message: "Internal server error" });
  }
};

exports.searchDonor = async (req, res) => {
  try {
    const { userCollection } = await getDb();
    const { bloodGroup, district, upazila } = req.query;
    const filter = {};
    if (bloodGroup) filter.bloodGroup = bloodGroup;
    if (district) filter.district = district;
    if (upazila) filter.upazila = upazila;
    const result = await userCollection.find(filter).toArray();
    return res.status(200).json({ success: true, count: result.length, data: result });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const { userCollection } = await getDb();
    const { status } = req.query;
    let filter = { role: { $ne: "admin" } };
    if (status && status !== "all") filter.status = { $in: [status] };
    const result = await userCollection.find(filter).toArray();
    return res.status(200).json({ success: true, count: result.length, data: result });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

exports.updateUserStatus = async (req, res) => {
  try {
    const { userCollection } = await getDb();
    const { id } = req.params;
    const { role, status } = req.body;
    const filter = { _id: new ObjectId(id) };
    const updateFields = {};
    if (role) updateFields.role = role;
    if (status) updateFields.status = status;
    const result = await userCollection.updateOne(filter, { $set: updateFields });
    res.send({ success: true, message: "User privileges updated!", result });
  } catch (error) {
    res.status(500).send({ success: false, message: "Internal server error" });
  }
};
