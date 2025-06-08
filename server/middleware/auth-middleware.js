const jwt = require("jsonwebtoken");

const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  const verifyToken = (token, secretKey) => {
    return jwt.verify(token, secretKey);
  };

  if (!authHeader) {
    console.log("No authorization header found.");
    return res.status(401).json({
      success: false,
      message: "User is Not Authenticated",
    });
  }

  const token = authHeader.split(" ")[1];
  const payload = verifyToken(token, "JWT_SECRET");

  req.user = payload;
  next();
};

module.exports = authenticate;
