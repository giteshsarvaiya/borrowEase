let express = require('express');
let app = express();
const path = require("path")
const route = require("./routes/auth")

app.set('view engine', 'ejs');



app.use(express.static(path.join(__dirname, 'public')));
/* function for current time */
var today = new Date();
var date = today.getDate()+'-'+(today.getMonth()+1)+'-'+today.getFullYear()
var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
var dateTime =time+' '+date;
//console.log(dateTime)

app.use("/", route);



var port = process.env.PORT || 3000;
app.listen(port, function () {
  console.log("Server Has Started!");
});


// var today = new Date();
// var date = today.getDate()+'-'+(today.getMonth()+1)+'-'+today.getFullYear()
// var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
// var dateTime =time+' '+date;
 
// console.log(dateTime)