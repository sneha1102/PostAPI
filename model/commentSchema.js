const mongoose = require("mongoose");
const commentsSchema = new mongoose.Schema({
  username: String,
  message: String,
});
const Comment = mongoose.model("Comment", commentsSchema);
module.exports = Comment;
