const jwt = require("jsonwebtoken");
const JWT_SECRET = "Decipherproprietory";

const fetchUser = (req, res, next) => {
  const token = req.header("auth-token");
  if (!token) {
    return res.status(401).send({ error: "Please authenticate using a valid token" });
  }

  try {
    const data = jwt.verify(token, JWT_SECRET);
    if (!data || !data.user) {
      return res.status(401).send({ error: "Invalid token payload" });
    }
    req.user = data.user;
    next();
  } catch (error) {
    console.error("JWT verification failed:", error.message);
    return res.status(401).send({ error: "Please authenticate using a valid token" });
  }
};

module.exports = fetchUser;
