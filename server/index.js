const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
var cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path");
const bodyParser = require("body-parser");
const { ensureDefaultAdminUser } = require("./bootstrap/adminUser");

let port = process.env.PORT || 5000;
const app = express();
ensureDefaultAdminUser().catch((error) => {
  console.error("Initial admin bootstrap failed:", error.message);
});

app.use(bodyParser.json({ limit: "2mb" }));

app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.send("HELLO FROM API");
});

app.use("/content", require("./routes/Content"));
app.use("/auth", require("./routes/Auth"));

if (require.main === module) {
  app.listen(port, () => console.log("API IS RUNNING 🚀 at port:", port));
}

module.exports = app;
