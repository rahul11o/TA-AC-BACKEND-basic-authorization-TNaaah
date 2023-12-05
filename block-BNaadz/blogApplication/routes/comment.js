let express = require("express");
let Article = require("../models/article");
let Comment = require("../models/comment");
let auth = require("../middlewares/auth")

let router = express();



router.use(auth.loggedInUser);
//POST saving the comment into database

router.post("/:articleId", async (req, res, next) => {
  try {
    let articleId = req.params.articleId;
    req.body.articleId = articleId;
    req.body.author = req.user._id;
    let comment = await Comment.create(req.body);
    let article = await Article.findByIdAndUpdate(articleId, {
      $push: { comments: comment._id },
    });
    res.redirect("/articles/" + article.slug + "/details");
  } catch (error) {
    next(error);
  }
});

//GET  updating likes

router.get("/:commentId/likes", async (req, res, next) => {
  try {
    let commentId = req.params.commentId;
    let comment = await Comment.findById(commentId);
    let articleId = comment.articleId;
    let article = await Article.findById(articleId);
    await Comment.findByIdAndUpdate(commentId, { $inc: { likes: +1 } });
    res.redirect("/articles/" + article.slug + "/details");
  } catch (error) {
    next(error);
  }
});

//GET  updating dislikes

router.get("/:commentId/dislikes", async (req, res, next) => {
  try {
    let commentId = req.params.commentId;
    let comment = await Comment.findById(commentId);
    let articleId = comment.articleId;
    let article = await Article.findById(articleId);
    await Comment.findByIdAndUpdate(commentId, { $inc: { dislikes: +1 } });
    res.redirect("/articles/" + article.slug  + "/details");
  } catch (error) {
    next(error);
  }
});

//GET   rendering form for editing comments

router.get("/:id/update", async (req, res, next) => {
  try {
    let id = req.params.id;
    let comment = await Comment.findById(id);
    let articleId = comment.articleId;
    let article = await Article.findById(articleId);
    if(comment.author.toString() === req.user._id.toString()){
      res.render("comment.ejs", { comment });
    }else{
      req.flash("error", "only author can update it")
      res.redirect("/articles/" + article.slug  + "/details");
    }
  
  } catch (error) {}
});

//POST  Updating comments

router.post("/:commentId/update", async (req, res, next) => {
  try {
    let commentId = req.params.commentId;
    let comment = await Comment.findById(commentId);
    let articleId = comment.articleId;
    let article = await Article.findById(articleId);
    await Comment.findByIdAndUpdate(commentId, req.body);
    // let article = Article.findByIdAndUpdate(articleId,{$pop:{comments :commentId}})
    res.redirect("/articles/" + article.slug + "/details" );
  } catch (error) {
    next(error);
  }
});

//POST  Deleting comments
router.get("/:commentId/delete", async (req, res, next) => {
  try {
    let commentId = req.params.commentId;
    let comment = await Comment.findById(commentId);
    let articleId = comment.articleId;
    let article = await Article.findById(articleId);
    if(comment.author.toString() === req.user._id.toString()){
      await Comment.findByIdAndDelete(commentId);
      await Article.findByIdAndUpdate(articleId, {
      $pull: { comments: commentId },
      });
      res.redirect("/articles/" + article.slug  + "/details");
      
    }else{
      req.flash("error", "only author can delete it")
      res.redirect("/articles/" + article.slug  + "/details");
    }
    
  } catch (error) {
    next(error);
  }
});

module.exports = router;
