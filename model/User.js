const mongoose = require("mongoose")
const userSchema = new mongoose.Schema({
    email: {
      type: String
  },
  password: {
      type: String
  }
  });
  
  userSchema.plugin(passportLocalMongoose);
  
  const User = new mongoose.model("User",userSchema)
  
module.exports = mongoose.model('User', userSchema)