const mongoose = require("mongoose");
const postsSchema = new mongoose.Schema(
  {
    postName: String,
    userName: String,
    description: String,
    likes: { type: Number, default: 0 },
    likeDetails: [{ type: Object, default: {} }],
    image: String,
  },
  {
    timestamps: true,
  }
);
const Post = mongoose.model("Post", postsSchema);
module.exports = Post;
