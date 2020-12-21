const express = require("express");
const mongoose = require("mongoose");
const postsSchema = require("./Models/postSchema");
const app = express();
const verifyToken = require("./middleware/verifyToken");
const jwt = require("jsonwebtoken");
const userSchema = require("./Models/userSchema");
const getInfo = require("./middleware/getInfo");
mongoose
  .connect("mongodb://localhost/PostDB", {
    useUnifiedTopology: true,
    useNewUrlParser: true,
  })
  .then(() => console.log("Connected To mongodb"))
  .catch((err) => console.log("Exception Occured ", err));

mongoose.set("useFindAndModify", false);

const Post = mongoose.model("Post", postsSchema);
const User = mongoose.model("User", userSchema);
app.use(express.json());

app.post("/post", verifyToken, (req, res) => {
  const post = new Post(req.body);
  post
    .save()
    .then((post) => res.send(post))
    .catch((err) => console.log("Exception Occured ", err));
});

app.patch("/posts/comment", verifyToken, async (req, res) => {
  const userId = req.query.userId;
  const postId = req.query.postId;
  let name = "";
  const date = new Date();
  await User.findById(userId)
    .select("username")
    .then((result) => {
      if (!result) {
        res.status(404).send("User does not exist");
        return;
      }
      name = result.username;
    });

  Post.findByIdAndUpdate(
    postId,

    {
      $push: {
        comments: {
          $each: [
            {
              postedBy: name,
              comments: req.body.comments,
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
      res.status(404).send("Post does not exist");
      return;
    }
    res.send(result);
  });
});

app.patch("/posts", verifyToken, async (req, res) => {
  const userId = req.query.userId;
  const postId = req.query.postId;
  let name = "";
  const date = new Date();
  await User.findById(userId)
    .select("username")
    .then((result) => {
      if (!result) {
        res.status(404).send("User does not exist");
        return;
      }
      name = result.username;
    });

  Post.findByIdAndUpdate(
    postId,

    {
      $inc: { likes: 1 },
      $push: {
        likeDetails: {
          $each: [
            {
              likedBy: name,
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
      res.status(404).send("Post does not exist");
      return;
    }
    res.send(result);
  });
});

app.delete("/posts", verifyToken, (req, res) => {
  const id = req.query._id;
  Post.findByIdAndDelete(id).then((result) => {
    if (!result) {
      res.status(404).send("Post not found");
      return;
    }
    res.send(result);
  });
});

app.get("/posts", [getInfo, verifyToken], (req, res) => {
  Post.find().then((result) => {
    if (!result) {
      res.status(404).send("There is no posts in database");
      return;
    }
    res.send(result);
  });
});

app.post("/users", (req, res) => {
  const user = new User(req.body);
  var token = jwt.sign({ userid: req.body._id }, process.env.secret, {
    expiresIn: 86400, // expires in 24 hours
  });

  user
    .save()
    .then((user) => res.send(user + "\n" + token))
    .catch((err) => console.log("Exception Occured ", err));
});

app.get("/users", verifyToken, (req, res) => {
  const senderId = req.query.senderId;
  const receiverId = req.query.receiverId;
  if (senderId) {
    User.findById(senderId).then((result) => {
      if (!result) {
        res.status(404).send("No message send by this user");
        return;
      } else {
        res.send(result.senderMsgDetails);
      }
    });
  } else if (receiverId) {
    User.findById(receiverId).then((result) => {
      if (!result) {
        res.status(404).send("No message received by this user");
        return;
      } else {
        res.send(result.receiverMsgDetails);
      }
    });
  }
});

// function sortFunction(a, b) {
//   var dateA = new Date(a.date).getTime();
//   var dateB = new Date(b.date).getTime();
//   return dateA > dateB ? -1 : 1;
// }

app.get("/users/message", (req, res) => {
  const id = req.query._id;
  User.findById(id).then((result) => {
    if (!result) {
      res.status(404).send("No message send/receive by this user");
      return;
    } else {
      // let msgDetail=result.msgDetails;
      // let receiverMsgDetail=result.receiverMsgDetails;

      //  Array.prototype.push.apply(msgDetail,receiverMsgDetail);
      //  msgDetail.sort(sortFunction)
      res.send(result.msgDetails);
    }
  });
});

app.patch("/users/message", verifyToken, async (req, res) => {
  const senderId = req.query.senderId;
  const receiverId = req.body.receiverId;
  const message = req.body.message;
  const date = new Date();
  let output,
    senderName = "",
    receiverName = "";

  await User.findById(receiverId)
    .select("username")
    .then((result) => {
      if (!result) {
        res.status(404).send("User does not exist");
        return;
      }
      receiverName = result.username;
    });

  await User.findById(senderId)
    .select("username")
    .then((result) => {
      if (!result) {
        res.status(404).send("User does not exist");
        return;
      }
      senderName = result.username;
    });

  User.findByIdAndUpdate(
    senderId,
    {
      $push: {
        msgDetails: {
          $each: [
            {
              id: receiverId,
              receiverName: receiverName,
              message: message,
              date: date,
            },
          ],
          $position: 0,
        },
        senderMsgDetails: {
          $each: [
            {
              id: receiverId,
              name: receiverName,
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
      res.status(404).send("User does not exist");
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
              senderName: senderName,
              message: message,
              date: date,
            },
          ],
          $position: 0,
        },
        receiverMsgDetails: {
          $each: [
            {
              id: senderId,
              name: senderName,
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
        res.status(404).send("User does not exist");
        return;
      }
      output += "\n" + result;
    })
    .then(() => {
      res.send(output);
    });
});

app.listen(3000, () => console.log("Listening"));
