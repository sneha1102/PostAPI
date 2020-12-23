const mongoose = require("mongoose");
const usersSchema = new mongoose.Schema({
  username: { type: String, unique: true },
});
const User = mongoose.model("User", usersSchema);
module.exports = User;
