const mongoose = require("mongoose");
const {
  expressServer,
  addNewUser,
  addNewPost,
  sendMessage,
  getAllMessageByTime,
  getAllPost,
  likePost,
  addNewComment,
  deletePost,
} = require("./route/index");

mongoose
  .connect("mongodb://localhost/PostDB", {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useFindAndModify: false,
  })
  .then(() => console.log("Connected To mongodb"))
  .catch((err) => res.send({ error: err }));

expressServer();

addNewUser();
addNewPost();
addNewComment();
likePost();
getAllPost();
deletePost();
sendMessage();
getAllMessageByTime();
