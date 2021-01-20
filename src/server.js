const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const PORT = process.env.PORT || 3000;
const path = require("path");
const upload = require("express-fileupload");
const botRouter = require("./routes/route");
const app = express();

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(expressLayouts);
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));
app.use(upload());

app.use("/", botRouter);

app.listen(PORT, console.log(`listening on ${PORT}`));

module.exports = app;
