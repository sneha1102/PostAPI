const jwt = require("jsonwebtoken");
const User = require("../../model/userSchema");

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
  const id = req.params.userId;
  User.findOne({ _id: id })
    .populate("msgDetails.id")
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
  const receiverId = req.body.receiverId;
  const message = req.body.message;
  const date = new Date();
  let output;
  User.findByIdAndUpdate(
    senderId,
    {
      $push: {
        msgDetails: {
          $each: [
            {
              id: receiverId,
              // receiverName: receiverName,
              message: message,
              date: date,
            },
          ],
          $position: 0,
        },
      },
    },
    { new: true }
  ).then((result) => {
    if (!result) {
      res.status(404).send({ message: "User does not exist" });
      return;
    }
    output = result;
  });

  User.findByIdAndUpdate(
    receiverId,
    {
      $push: {
        msgDetails: {
          $each: [
            {
              id: senderId,
              //  senderName: senderName,
              message: message,
              date: date,
            },
          ],
          $position: 0,
        },
      },
    },
    { new: true }
  )
    .then((result) => {
      if (!result) {
        res.status(404).send({ message: "User does not exist" });
        return;
      }
      output += result;
    })
    .then(() => {
      res.send({ message: output });
    });
};
