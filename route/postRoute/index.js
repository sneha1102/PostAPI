const Post = require("../../model/postSchema");
const Comment = require("../../model/commentSchema");

//to create new post
exports.addNewPost = function (req, res) {
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
};

//to update a post
exports.updatePost = function (req, res) {
  const postId = req.params.postId;
  Post.findByIdAndUpdate(
    postId,
    { description: req.body.description },
    { new: true }
  ).then((result) => {
    if (!result) {
      res.status(404).send({ message: "Post doesn't exist" });
      return;
    } else {
      res.send({ result: result });
    }
  });
};

//to add new comment to a post
exports.addNewComment = function (req, res) {
  const postId = req.params.postId;
  req.body.postId = postId;
  const comment = new Comment(req.body);
  comment
    .save()
    .then((comment) =>
      res.send({
        comment: comment,
        message: "Comment posted",
      })
    )
    .catch((err) => res.send({ error: err }));
};

//to like a post
exports.likePost = function (req, res) {
  const isLiked = req.body.isLiked;
  if (isLiked) {
    const userId = req.body.userId;
    const postId = req.params.postId;
    Post.findByIdAndUpdate(
      postId,
      {
        $inc: { likes: 1 },
        $push: {
          likeDetails: {
            $each: [
              {
                likedBy: userId,
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
};

//to delete a post
exports.deletePost = function (req, res) {
  const postId = req.params.postId;
  Post.findByIdAndDelete(postId).then((result) => {
    if (!result) {
      res.status(404).send({ message: "Post not found" });
      return;
    }
    res.send({ result: result });
  });
};

//to get all posts
exports.getAllPost = function (req, res) {
  Post.find().then((result) => {
    if (!result) {
      res.status(404).send({ message: "There is no posts in database" });
      return;
    }
    res.send({ result: result });
  });
};
