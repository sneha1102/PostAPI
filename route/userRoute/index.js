const jwt = require("jsonwebtoken");
const User = require("../../model/userSchema");
const Message = require("../../model/messageSchema");

//to create new user
exports.addNewUser = function (req, res) {
  const user = new User(req.body);
  user
    .save()
    .then((user) => res.send({ user: user, token: token }))
    .catch((err) => res.send({ error: err }));
  var token = jwt.sign({ userid: user.id }, process.env.secret, {
    expiresIn: 86400, // expires in 24 hours
  });
};

//to get all message by time
exports.getAllMessageByTime = function (req, res) {
  const userId = req.params.userId;
  Message.find({ $or: [{ senderId: userId }, { receiverId: userId }] }, null, {
    sort: { createdAt: -1 },
  })

    .populate("receiverId")
    .populate("senderId")
    .then((result) => {
      if (!result) {
        res
          .status(404)
          .send({ message: "No message send/receive by this user" });
        return;
      } else {
        res.send({ result: result });
      }
    });
};

//to send message
exports.sendMessage = function (req, res) {
  const senderId = req.params.senderId;
  req.body.senderId = senderId;
  const message = new Message(req.body);
  message
    .save()
    .then((message) => res.send({ message: message }))
    .catch((err) => res.send({ error: err }));
};
