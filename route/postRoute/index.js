const Post = require("../../model/postSchema");
const Comment = require("../../model/commentSchema");
const client = require("../../service/cache");
//to create new post
exports.addNewPost = function (req, res) {
  const post = new Post(req.body);
  post
    .save()
    .cache()
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
exports.addNewComment = async function (req, res) {
  const postId = req.params.postId;
  req.body.postId = postId;
  const comment = new Comment(req.body);
  comment
    .save()
    .then(async (comment) => {
      const cache_data = await client.getAsync("Comment" + postId);
      const ans = "";
      if (cache_data) {
        ans = cache_data + comment;
      } else {
        ans = comment;
      }
      client.setAsync("Comment" + postId, JSON.stringify(ans));
      res.send({
        comment: comment,
        message: "Comment posted",
      });
    })
    .catch((err) => res.send({ error: err }));
};

//to get all comments of particular post
exports.getAllComment = async function (req, res) {
  try {
    const postId = req.params.postId;
    const cache_data = await client.getAsync("Comment" + postId);
    if (cache_data) {
      res.status(200).json(JSON.parse(cache_data));
    } else {
      const res_data = await Comment.find({ postId: postId }).populate(
        "commentedBy"
      );
      await client.setAsync("Comment" + postId, JSON.stringify(res_data));
      client.expire(postId, 60);
      res.status(200).json(JSON.parse(res_data));
    }
  } catch (err) {
    res.send({ error: err });
  }
};

//to like a post
exports.likePost = async function (req, res) {
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
    ).then(async (result) => {
      if (!result) {
        res.status(404).send({ message: "Post does not exist" });
        return;
      }
      await client.setAsync("Post" + postId, JSON.stringify(result));
      client.expire("POst" + postId, 60);
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

//to get post by id
exports.getPostById = async function (req, res) {
  const cache_data = await client.getAsync("Post" + req.params.postId);
  if (cache_data) {
    res.status(200).send(JSON.parse(cache_data));
  } else {
    Post.find({ _id: req.params.postId }).then(async (result) => {
      if (!result) {
        res.status(404).send({ message: "No post exist with given id" });
        return;
      }
      await client.setAsync("Post" + req.params.postId, JSON.stringify(result));
      client.expire("Post" + req.params.postId, 60);
      res.status(200).send({ result: result });
    });
  }
};
