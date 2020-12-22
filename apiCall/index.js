const express = require("express");
const Post = require("../model/postSchema");
const verifyToken = require("../middleware/verifyToken");
const jwt = require("jsonwebtoken");
const User = require("../model/userSchema");
const getInfo = require("../middleware/getInfo");
const bodyParser = require("body-parser");
const app = express();

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

//Api calls
function apiCalls() {
  //to create new post
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

  //to add new comment to a post
  app.patch("/posts/:postId/comments", verifyToken, async (req, res) => {
    const userId = req.body.userId;
    const postId = req.params.postId;
    // let name = "";
    const date = new Date();
    // await User.findById(userId)
    //   .select("username")
    //   .then((result) => {
    //     if (!result) {
    //       res.status(404).send("User does not exist");
    //       return;
    //     }
    //     name = result.username;
    //   });

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

  //to like a post
  app.patch("/posts/:postId", verifyToken, async (req, res) => {
    const isLiked = req.body.like;
    if (isLiked) {
      const userId = req.body.userId;
      const postId = req.params.postId;
      //let name = "";
      const date = new Date();
      // await User.findById(userId)
      //   .select("username")
      //   .then((result) => {
      //     if (!result) {
      //       res.status(404).send("User does not exist");
      //       return;
      //     }
      //     name = result.username;
      //   });

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

  //to delete a post
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

  //to get all posts
  app.get("/posts", [getInfo, verifyToken], (req, res) => {
    Post.find().then((result) => {
      if (!result) {
        res.status(404).send({ message: "There is no posts in database" });
        return;
      }
      res.send({ result: result });
    });
  });

  //to create new user
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

  // app.get("/users", verifyToken, (req, res) => {
  //   const senderId = req.query.senderId;
  //   const receiverId = req.query.receiverId;
  //   if (senderId) {
  //     User.findById(senderId).then((result) => {
  //       if (!result) {
  //         res.status(404).send("No message send by this user");
  //         return;
  //       } else {
  //         res.send(result.senderMsgDetails);
  //       }
  //     });
  //   } else if (receiverId) {
  //     User.findById(receiverId).then((result) => {
  //       if (!result) {
  //         res.status(404).send("No message received by this user");
  //         return;
  //       } else {
  //         res.send(result.receiverMsgDetails);
  //       }
  //     });
  //   }
  // });

  // function sortFunction(a, b) {
  //   var dateA = new Date(a.date).getTime();
  //   var dateB = new Date(b.date).getTime();
  //   return dateA > dateB ? -1 : 1;
  // }

  //to get all message (send/receive) by particular user
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

  //to get all msg by time
  app.patch("/users/:senderId/messages", verifyToken, async (req, res) => {
    const senderId = req.params.senderId;
    const receiverId = req.body.receiverId;
    const message = req.body.message;
    const date = new Date();
    let output;
    // senderName = "",
    //receiverName = "";

    // await User.findById(receiverId)
    //   .select("username")
    //   .then((result) => {
    //     if (!result) {
    //       res.status(404).send({message:"User does not exist"});
    //       return;
    //     }
    //     receiverName = result.username;
    //   });

    // await User.findById(senderId)
    //   .select("username")
    //   .then((result) => {
    //     if (!result) {
    //       res.status(404).send({message:"User does not exist"});
    //       return;
    //     }
    //     senderName = result.username;
    //   });

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

  app.listen(3000, () => console.log("Listening"));
}
module.exports = apiCalls;
