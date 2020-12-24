const jwt = require("jsonwebtoken");
const User = require("../../model/userSchema");
const Message = require("../../model/messageSchema");
const mongoose = require("mongoose");
//to create new user
exports.addNewUser = function (req, res) {
  const user = new User(req.body);
  user
    .save()
    .then((user) => res.send({ user: user, token: token }))
    .catch((err) => res.send({ error: err }));
  var token = jwt.sign(
    { userid: user.id },
    process.env.secret
    //   {
    //   expiresIn: 86400, // expires in 24 hours
    // }
  );
};

//to get all message by time
exports.getAllMessageByTime = function (req, res) {
  Message.aggregate([
    {
      $match: {
        $or: [
          { senderId: mongoose.Types.ObjectId(req.params.userId) },
          { receiverId: mongoose.Types.ObjectId(req.params.userId) },
        ],
      },
    },
    {
      $project: {
        message: 1,
        senderId: 1,
        receiverId: 1,
        createdAt: 1,
        roomId: 1,
        _id: 0,
      },
    },
    { $sort: { createdAt: -1 } },

    {
      $lookup: {
        from: "users",
        localField: "senderId",
        foreignField: "_id",
        as: "resultingSenderUser",
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "receiverId",
        foreignField: "_id",
        as: "resultingReceiverUser",
      },
    },
    { $unwind: { path: "$resultingSenderUser" } },
    { $unwind: { path: "$resultingReceiverUser" } },

    {
      $group: {
        _id: "$roomId",
        message: { $first: "$message" },
        senderId: { $first: "$resultingSenderUser" },
        receiverId: { $first: "$resultingReceiverUser" },
        createdAt: { $first: "$createdAt" },
      },
    },

    { $sort: { createdAt: -1 } },
  ]).then((result) => {
    if (!result) {
      res.status(404).send({ message: "No message send/receive by this user" });
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
  const receiverId = req.body.receiverId;

  req.body.roomId = [senderId, receiverId].sort().join("");
  const message = new Message(req.body);
  message
    .save()
    .then((message) => res.send({ message: message }))
    .catch((err) => res.send({ error: err }));
};
