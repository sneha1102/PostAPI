const express = require("express");
const Post = require("../model/postSchema");
const verifyToken = require("../middleware/verifyToken");
const jwt = require("jsonwebtoken");
const User = require("../model/userSchema");
const getInfo = require("../middleware/getInfo");
const bodyParser = require("body-parser");
const app = express();

//express configuration
exports.expressServer = function () {
  app.use(express.json());
  app.use(bodyParser.urlencoded({ extended: true }));
  app.listen(3000, () => console.log("Listening"));
};

//Api calls

//to create new post
exports.addNewPost = function () {
  app.post("/posts", verifyToken, (req, res) => {
    const post = new Post(req.body);
    post
      .save()
      .then((post) =>
        res.send({
          post: post,
          message: "Post created",
        })
      )
      .catch((err) => res.send({ error: err }));
  });
};

//to add new comment to a post
exports.addNewComment = function () {
  app.patch("/posts/:postId/comments", verifyToken, async (req, res) => {
    const userId = req.body.userId;
    const postId = req.params.postId;
    const date = new Date();
    Post.findByIdAndUpdate(
      postId,

      {
        $push: {
          comments: {
            $each: [
              {
                postedBy: userId,
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
        res.status(404).send({ message: "Post does not exist" });
        return;
      }
      res.send({ result: result });
    });
  });
};

//to like a post
exports.likePost = function () {
  app.patch("/posts/:postId", verifyToken, async (req, res) => {
    const isLiked = req.body.like;
    if (isLiked) {
      const userId = req.body.userId;
      const postId = req.params.postId;
      const date = new Date();
      Post.findByIdAndUpdate(
        postId,

        {
          $inc: { likes: 1 },
          $push: {
            likeDetails: {
              $each: [
                {
                  likedBy: userId,
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
          res.status(404).send({ message: "Post does not exist" });
          return;
        }
        res.send({ result: result });
      });
    }
  });
};

//to delete a post
exports.deletePost = function () {
  app.delete("/posts/:postId", verifyToken, (req, res) => {
    const postId = req.params.postId;
    Post.findByIdAndDelete(postId).then((result) => {
      if (!result) {
        res.status(404).send({ message: "Post not found" });
        return;
      }
      res.send({ result: result });
    });
  });
};

//to get all posts
exports.getAllPost = function () {
  app.get("/posts", [getInfo, verifyToken], (req, res) => {
    Post.find().then((result) => {
      if (!result) {
        res.status(404).send({ message: "There is no posts in database" });
        return;
      }
      res.send({ result: result });
    });
  });
};

//to create new user
exports.addNewUser = function () {
  app.post("/users", (req, res) => {
    const user = new User(req.body);
    user
      .save()
      .then((user) => res.send({ user: user, token: token }))
      .catch((err) => res.send({ error: err }));
    var token = jwt.sign({ userid: user.id }, process.env.secret, {
      expiresIn: 86400, // expires in 24 hours
    });
  });
};

//to get all message by time
exports.getAllMessageByTime = function (params) {
  app.get("/users/:userId/messages", (req, res) => {
    const id = req.params.userId;
    User.findById(id).then((result) => {
      if (!result) {
        res
          .status(404)
          .send({ message: "No message send/receive by this user" });
        return;
      } else {
        res.send({ MessageDetails: result.msgDetails });
      }
    });
  });
};

//to send message
exports.sendMessage = function () {
  app.patch("/users/:senderId/messages", verifyToken, async (req, res) => {
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
  });
};
