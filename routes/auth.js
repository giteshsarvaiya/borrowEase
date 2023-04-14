const express = require("express"),
      bodyParser = require("body-parser"),
      ejs = require("ejs"),
      mongoose = require("mongoose"),
      session = require("express-session");
      passport = require("passport"),
      passportLocalMongoose = require("passport-local-mongoose"),
      path = require("path")

var router = express.Router();
router.use(express.static(path.join(__dirname, 'public')));

router.use(bodyParser.urlencoded({extended:true}))

router.use(session({
  secret: "this is my secret",
  resave: false,
  saveUninitialized: false
}));

router.use(passport.initialize());
router.use(passport.session());

mongoose.connect("mongodb://127.0.0.1:27017/UserDB", { useNewUrlParser: true });

// importing user model
const User = require("../model/User")

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

/* authCheck to redirect to previous page*/
const authCheck = (req,res,next) => {
  if(!req.user){
    req.session.redirectUrl = req.redirectUrl;
    res.redirect('login');
  } else {
    next();
  }
};

//show home page
router.get("/", function (req, res) {
  res.render("index");
});

// Showing index page
router.get("/index", isLoggedIn, function (req, res) {
  res.render("index");
});

// Showing register form
router.get("/register", function (req, res) {
  res.render("register");
});

// Showing payment gateway
router.get("/payment",authCheck, function (req, res) {
  res.render("payment"); 
});

// Showing paymentSuccessful
router.get("/paymentSuccessful", function (req, res) {
  res.render("paymentSuccessful");
});

//show createDemand page after login only
router.get("/createDemand",(req,res)=>{
  if(req.isAuthenticated()){
    res.render("createDemand")
  }else{
    res.redirect("/login")
  }
})


// Handling user signup
router.post("/register", async (req, res) => {

    User.register(new User({ username : req.body.username }), req.body.password, function(err, user){

   if(err){
    return res.render("register")
   }
   else{
    passport.authenticate('local')(req, res, function () {
      res.redirect('/index');
    })
  }
  });  
});

//Showing login form
router.get("/login", function (req, res) {
  res.render("login");
});

//Handling user login
router.post("/login", function(req, res){
  
      const user = new User({
        username: req.body.username,
        password: req.body.password
      });

      req.login(user, (err)=>{
        if(err){
          console.log(err)
        }else{
          passport.authenticate("local")(req,res,function(){

            res.redirect("/index")
          })
        }
      })
    
});

  //Handling user logout 
  router.get("/logout", function (req, res) {
    req.logout(function (err) {
      if (err) { return next(err); }
      res.redirect('/');
    });
  });



  function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) return next();
    res.redirect("/login");
  }

  module.exports = router;