const jwt = require("jsonwebtoken");
require("dotenv").config();
const User = require("../model/userSchema");
function verifyToken(req, res, next) {
  const bearerHeader = req.headers["authorization"];
  if (typeof bearerHeader !== "undefined") {
    const bearer = bearerHeader.split(" ");
    req.token = bearer[1];
    jwt.verify(req.token, process.env.secret, (err, decodedToken) => {
      if (err) {
        res.json({ result: err });
      } else {
        const id = decodedToken.userid;
        User.findOne({ _id: id }).then((result) => {
          if (!result) {
            res.status(404).send({ message: "user doesn't exist" });
            return;
          } else {
            next();
          }
        });
      }
    });
  } else {
    res.send({ result: "token not provided" });
  }
}
module.exports = verifyToken;
