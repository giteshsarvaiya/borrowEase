require('dotenv').config();
const { log } = require("console");
const express = require("express"),
      bodyParser = require("body-parser"),
      ejs = require("ejs"),
      mongoose = require("mongoose"),
      session = require("express-session");
      passport = require("passport");
      passportLocalMongoose = require("passport-local-mongoose");
      path = require("path");

/* function for current time */
var today = new Date();
var date = today.getDate()+'-'+(today.getMonth()+1)+'-'+today.getFullYear()
var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
var dateTime =time+' '+date;

//console.log(dateTime)
var router = express.Router();
router.use(express.static(path.join(__dirname, 'public')));

router.use(bodyParser.urlencoded({extended:true}));


router.use(session({
  secret: "this is my secret. ",
  resave: false,
  saveUninitialized: false
}));

router.use(passport.initialize());
router.use(passport.session());

mongoose.connect("mongodb://127.0.0.1:27017/UserDB", { useNewUrlParser: true });


/* userDetailSchema */
const userDetailSchema = new mongoose.Schema({
  username: String,
  uniRollNo: Number,
  email: String,
});

/* demandSchema */
const demandSchema = new mongoose.Schema({
  userdetail: userDetailSchema,
  amount: Number,
  time: String,
  reason: String
});

/*  userSchema */
const userSchema = new mongoose.Schema({
  username: String,
  password: String,
});

userSchema.plugin(passportLocalMongoose);

const Detail = new mongoose.model("Detail",userDetailSchema);
const User = new mongoose.model("User",userSchema);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

const Demand = new mongoose.model("Demand", demandSchema);
// module.exports = mongoose.model("Demand", demandSchema);


/* Create a User for demo  */
const user1 = new User({
  username: "rajeevranjan",
  password: "rajeevranjan",
});

 /* creating userDetail for demo */
 const detail1 = new Detail ({
  username: "rajeevranjan",
  uniRollNo: 1001,
  email: "rajeevranjan@gmail.com",
 });

 /* Create a Demand*/
const demand1 = new Demand ({
  userdetail: detail1,
  amount: 500,
  time: dateTime,
  reason: "Educational Purpose",
});

 /* Registering Demo User1  */
//  User.register({username: "rajeevranjan"}, "rajeevranjan"); // commented because it is supposed to run once only. otherwise it will throw error that the user already exists in DB.
/* added userDetails to DB */

// console.log(req.user.username);
/* authCheck to redirect to previous page*/
const authCheck = (req,res,next) => {
  if(!req.user){
    req.session.redirectUrl = req.redirectUrl;
    res.redirect('login');
  } else {
    next();
  }
};

/* array of default posts */
const defaultDemands = [demand1];

async function getDemands(){
  const Demands = await Demand.find({});
  return Demands;
};

//show content page
router.get("/content", function (req, res) {
  if(req.isAuthenticated()){
    getDemands().then(function(foundDemands){
      if (foundDemands.length === 0) {
        Demand.insertMany(defaultDemands);
        res.redirect("/content");
      } else {
        console.log(req.user.username);
        res.render("content",{ newDemands: foundDemands} );
      }
  
    });
  }else{
    res.redirect("/login")
  }

});

router.post("/content", function(req, res){

  const newDemand = new Demand({
    username: req.user.username,
    amount: req.body.amount,
    reason: req.body.reason
  });
  demands.save(newDemand);
  res.redirect("/");
});


// Showing index page
router.get("/", function (req, res) {
  res.render("index");
});

// Showing tnc page
router.get("/tnc", function (req, res) {
  res.render("tnc");
});

// Showing register form
router.get("/register", function (req, res) {
  res.render("register", {msg1:" ", msg2:" ", msg3:" "});
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
  // console.log(Detail.find({username: req.body.username}));

    // if(Detail.find({username: req.body.username}).length !== 0 || Detail.find({uniRollNo: req.body.uniRollNo}).length !== 0 || Detail.find({email: req.body.email}).length !== 0){
    //   res.render("register", {msg1: "That user already exists", msg2:" ", msg3:" "});
 
    // }else{
    //   const userDetail = new Detail({
    //     username: req.body.username,
    //     uniRollNo: req.body.uniRollNo,
    //     email: req.body.email
    //   })
    //   Detail.insertMany(userDetail);
    // }
    
    User.register({ username : req.body.username }, req.body.password, function(err, user){

   if(err){
    return res.render("register")
   }
   else{
    passport.authenticate('local')(req, res, function () {
      res.redirect('/content');
    })
  }
  });
});

//Showing login form
router.get("/login", function (req, res) {
  res.render("login", {msg: " "});

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

            res.redirect("/content")
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