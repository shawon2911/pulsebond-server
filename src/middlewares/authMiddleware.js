const { jwtVerify, createRemoteJWKSet } = require("jose-cjs");

const CLIENT_URL = process.env.CLIENT_URL;
const JWKS = createRemoteJWKSet(new URL(`${CLIENT_URL}/api/auth/jwks`));

const verifyToken = async (req, res, next) => {
  const authHeader = req?.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: "unauthorized" });
  }
  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "unauthorized" });
  }
  try {
    const { payload } = await jwtVerify(token, JWKS);
    req.user = payload; // Global user schema parsing layer inject 
    next();
  } catch (error) {
    return res.status(403).json({ message: "Forbidden" });
  }
};

module.exports = verifyToken;
