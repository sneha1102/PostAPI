const jwt=require('jsonwebtoken')
require('dotenv').config()

 function verifyToken(req, res, next) {
  const bearerHeader = req.headers["authorization"];
  if (typeof bearerHeader !== "undefined") {
    const bearer = bearerHeader.split(" ");
    req.token = bearer[1];
    jwt.verify(req.token, process.env.secret, (err, authData) => {
      if (err) {
        res.json({ result: err });
      } else {
        next();
      }
    });
  } else {
    res.send({ result: "token not provided" });
  }
}
module.exports=verifyToken;