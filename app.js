let express = require('express');
let app = express();
const path = require("path")
const route = require("./routes/auth")

app.set('view engine', 'ejs');



app.use(express.static(path.join(__dirname, 'public')));

app.use("/", route)

var port = process.env.PORT || 3000;
app.listen(port, function () {
  console.log("Server Has Started!");
});