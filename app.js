const mongoose = require("mongoose");
const apiCall = require("./apiCall/index");

mongoose
  .connect("mongodb://localhost/PostDB", {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useFindAndModify: false,
  })
  .then(() => console.log("Connected To mongodb"))
  .catch((err) => res.send({ error: err }));

apiCall();
