var User = require("../models/user");

module.exports = {
    loggedInUser : (req, res, next)=>{
        if(req.session && req.session.userId){
           next()
        }
        else{
            res.redirect("/users/login")
        }
    },

    userInfo : async(req,res,next)=>{
        try {
            let userId = req.session && req.session.userId;
        if(userId){
            let user = await User.findById(userId, "firstName lastName email");
            req.user = user;
            res.locals.user = user;
            next()
        }else{
            req.user = null;
            res.locals.user = null;
            next()
        }
        } catch (error) {
            next(error)
        }     
    }
}