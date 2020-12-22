const express = require("express");
const mongoose = require("mongoose");
const verifyToken = require("./middleware/verifyToken");
const logRequestInfo = require("./middleware/logRequestInfo");
const bodyParser = require("body-parser");
const app = express();
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

const {
  addNewPost,
  getAllPost,
  likePost,
  addNewComment,
  deletePost,
  updatePost,
} = require("./route/postRoute/index");
const {
  addNewUser,
  sendMessage,
  getAllMessageByTime,
} = require("./route/userRoute/index");

mongoose
  .connect("mongodb://localhost/PostDB", {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useFindAndModify: false,
  })
  .then(() => console.log("Connected To mongodb"))
  .catch((err) => res.send({ error: err }));

//app.use(express.json());
//app.use(bodyParser.urlencoded({ extended: true }));
app.listen(3000, () => console.log("Listening"));

//to create new post
app.post("/posts", verifyToken, (req, res) => {
  addNewPost(req, res);
});

//to update a post
app.patch("/posts/:postId", verifyToken, (req, res) => {
  updatePost(req, res);
});

//to add new comment to a post
app.post("/posts/:postId/comments", verifyToken, (req, res) => {
  addNewComment(req, res);
});

//to like a post
app.post("/posts/:postId/likes", verifyToken, (req, res) => {
  likePost(req, res);
});

//to delete a post
app.delete("/posts/:postId", verifyToken, (req, res) => {
  deletePost(req, res);
});

//to get all posts
app.get("/posts", [logRequestInfo, verifyToken], (req, res) => {
  getAllPost(req, res);
});

//to add new user
app.post("/users", (req, res) => {
  addNewUser(req, res);
});

//to get all message by time
app.get("/users/:userId/messages", (req, res) => {
  getAllMessageByTime(req, res);
});

//to send message
app.patch("/users/:senderId/messages", verifyToken, async (req, res) => {
  sendMessage(req, res);
});
