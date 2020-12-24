const mongoose = require("mongoose");

const commentsSchema = new mongoose.Schema(
  {
    postId: { type: mongoose.Schema.Types.ObjectId, ref: "Post" },
    comment: String,
    commentedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  {
    timestamps: true,
  }
);
commentsSchema.index({ postId: 1 });
const Comment = mongoose.model("Comment", commentsSchema);
module.exports = Comment;
