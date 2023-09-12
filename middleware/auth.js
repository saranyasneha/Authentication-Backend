const jwt = require("jsonwebtoken");

const auth = (req, res, next) => {
  console.log(req.cookies);
  const token =
    req.cookies.token ||
    req.header("Authorization").replace("Bearer ", "") ||
    req.body.token;
  if (!token) {
    return res.status(403).send("Token is missing");
  }
  try {
    const decode = jwt.verify(token, process.env.SECRET_KEY);
    console.log(decode);
  } catch (error) {
    return res.status(401).send("Invalid token");
  }
  return next();
};
module.exports = auth;
