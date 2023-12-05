let express = require("express");
let Article = require("../models/article");
let Comment = require("../models/comment");
let User = require("../models/user");
let auth = require("../middlewares/auth")

let router = express();


//GET  Retrieve articles
router.get("/", async (req, res, next) => {
  try {
    let article = await Article.find().populate("author", "firstName email");
    console.log(article)
    return res.render("articleList.ejs", { article });
  } catch (error) {
    next(error);
  }
});

////GET  Retrieve article details

router.get("/:slug/details", async (req, res, next) => {
  try {
    let slug = req.params.slug;
    let article = await Article.findOne({ slug: slug }).populate("comments").populate("author", "firstName email");
   
    let err = req.flash("err")[0]
    let error = req.flash("error")[0]
    return res.render("article.ejs", { article, err, error });
  } catch (error) {
    next(error);
  }
});
 
router.use(auth.loggedInUser)

//GET Rendering article form

router.get("/create", (req, res, next) => {
  try {
    
    return res.render("articleForm.ejs");
  } catch (error) {
    next(error);
  }
});

//POST saving an article in the dataabse

router.post("/create", async (req, res, next) => {
  try {
    req.body.author = req.user._id;
    await Article.create(req.body);
    res.redirect("/articles/");
  } catch (error) {
    next(error);
  }
});

router.get("/myarticles", async(req,res,next)=>{
  let article = await Article.find({author : req.user._id})
  return res.render("articleList.ejs", { article });

})

//GET  updating likes

router.get("/:slug/likes", async (req, res, next) => {
  try {
    let slug = req.params.slug;
    let article = await Article.findOneAndUpdate(
      { slug },
      { $inc: { likes: +1 } }
    );
    res.redirect("/articles/" + article.slug + "/details");
  } catch (error) {}
});

//GET  updating dislikes

router.get("/:slug/dislikes", async (req, res, next) => {
  try {
    let slug = req.params.slug;
    let article = await Article.findOneAndUpdate(
      { slug },
      { $inc: { dislikes: +1 } }
    );
    res.redirect("/articles/" + article.slug + "/details");
  } catch (error) {}
});

// GET render update form

router.get("/:slug/update", async (req, res, next) => {
  try {
    let slug = req.params.slug;
    let article = await Article.findOne({ slug });
    console.log(article, "the article");
    console.log(req.user._id, "req.user._id");
    console.log(article.author, "article.author");

    // Convert ObjectId instances to strings for comparison
    const userIdString = req.user._id.toString();
    const articleAuthorString = article.author.toString();

    if (userIdString === articleAuthorString) {
      return res.render("update.ejs", { article });
    } else {
      req.flash("err", "You are not allowed to update it");
      return res.redirect("/articles/" + article.slug + "/details");
    }

  } catch (error) {
    next(error);
  }
});



// GET save update data

router.post("/:slug/update", async (req, res, next) => {
  try {
    let slug = req.params.slug;
    let article = await Article.findOneAndUpdate({ slug }, req.body);
    res.redirect("/articles/" + article.slug + "/details");
  } catch (error) {
    next(error);
  }
});

// GET Delete an article

router.get("/:slug/delete", async (req, res, next) => {
  try {
    let slug = req.params.slug;
    let article = await Article.findOne({ slug });
    if (req.user._id.toString() === article.author.toString()) {
       await Article.findOneAndDelete({ slug });
       await Comment.deleteMany({ articleId: article._id });
       return res.redirect("/articles");
    } else {
      req.flash("err", "You are not allowed to delete it");
      return res.redirect("/articles/" + article.slug + "/details");
    }
  } catch (error) {
    next(error);
  }
});



module.exports = router;
