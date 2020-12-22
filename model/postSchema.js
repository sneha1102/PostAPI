const mongoose = require("mongoose");
const postsSchema = new mongoose.Schema(
  {
    postName: String,
    description: String,
    image: String,
    postedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    likes: { type: Number, default: 0 },
    likeDetails: [
      {
        likedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      },
    ],
  },
  {
    timestamps: true,
  }
);
const Post = mongoose.model("Post", postsSchema);
module.exports = Post;
