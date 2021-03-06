const express = require("express");
const mongoose = require("mongoose");
const verifyToken = require("./middleware/verifyToken");
const logRequestInfo = require("./middleware/logRequestInfo");
const bodyParser = require("body-parser");
const app = express();
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
const { movieByYear } = require("./route/axiosRoute/index");
const {
  addNewPost,
  getAllPost,
  likePost,
  addNewComment,
  getAllComment,
  deletePost,
  updatePost,
  getPostById,
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
    useCreateIndex: true,
  })
  .then(() => console.log("Connected To mongodb"))
  .catch((err) => res.send({ error: err }));

//server listening on port 3000
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
app.post("/posts/:postId/comments", verifyToken, async (req, res) => {
  addNewComment(req, res);
});

//to get all comments of particular post
app.get("/posts/:postId/comments", verifyToken, async (req, res) => {
  getAllComment(req, res);
});

//to like a post
app.post("/posts/:postId/likes", verifyToken, async (req, res) => {
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

//to get post by id
app.get("/posts/:postId", verifyToken, async (req, res) => {
  getPostById(req, res);
});

//to add new user
app.post("/users", (req, res) => {
  addNewUser(req, res);
});

//to get all message by time
app.get("/users/:userId/messages", verifyToken, (req, res) => {
  getAllMessageByTime(req, res);
});

//to send message
app.patch("/users/:senderId/messages", verifyToken, async (req, res) => {
  sendMessage(req, res);
});

//axios call

//get movie or series or episode by title and year
app.get("/omdb/api", async (req, res) => {
  movieByYear(req, res);
});
