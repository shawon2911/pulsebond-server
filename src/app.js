const express = require("express");
const cors = require("cors");
const userRoutes = require("./routes/userRoutes");
const bloodReqRoutes = require("./routes/bloodReqRoutes");

const app = express();

app.use(
  cors({
    credentials: true,
    origin: [process.env.CLIENT_URL],
  })
);
app.use(express.json());

// Routes Mount Layer
app.use("/", userRoutes);
app.use("/", bloodReqRoutes);

app.get("/", (req, res) => {
  res.send("Pulse Bond Server Running");
});

module.exports = app;
