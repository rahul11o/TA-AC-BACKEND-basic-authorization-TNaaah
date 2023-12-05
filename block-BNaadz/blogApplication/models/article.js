let mongoose = require("mongoose");
let slugify = require("slugify");
let User = require("../models/user")

let articleSchema = new mongoose.Schema({
  title: String,
  description: String,
  comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],
  author: {type :mongoose.Schema.Types.ObjectId, ref :"User", required:true },
  likes: { type: Number, default: 0 },
  dislikes: { type: Number, default: 0 },
  slug: { type: String, unique: true },
});

articleSchema.pre("save", async function (next) {
  if (this.isModified("title")) {
    this.slug = slugify(this.title, { lower: true });
    try {
      let existingArticle = await this.constructor.findOne({ slug: this.slug });
      if (existingArticle) {
        this.slug = `${this.slug}-${Date.now()}`;
      }
      next();
    } catch (error) {
      next(error);
    }
  } else {
    next();
  }
});

module.exports = mongoose.model("Article", articleSchema);
