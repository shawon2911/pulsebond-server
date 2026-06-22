const express = require('express');
const dotenv = require("dotenv");
const cors = require('cors');
dotenv.config();

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

app.get('/', (req, res) => {
  res.send('Pulse Bond Server Running');
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});