let mongoose = require("mongoose");
let bcrypt = require("bcrypt");

let userSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: { type: String, unique: true },
  password: String,
  city: String,
});

userSchema.pre("save", function (next) {
  if (this.password && this.isModified("password")) {
    bcrypt.hash(this.password, 10, (err, hash) => {
      if (!err) {
        this.password = hash;
        next();
      } else {
        next(err);
      }
    });
  } else {
    next();
  }
});
userSchema.methods.verifyPassword = function (password) {
  return new Promise((res, rej) => {
    bcrypt.compare(password, this.password, (err, result) => {
      if (!err) {
        res(result);
      } else {
        next(err);
      }
    });
  });
};
userSchema.methods.fullName = function () {
  return this.firstName + this.lastName;
};

module.exports = mongoose.model("User", userSchema);
