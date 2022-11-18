require("dotenv").config();
require("./database/database").connect();
const express = require("express");
const router = require("./routes/index");

const app = express();
const port = process.env.PORT || 5000;
app.use(express.json());

app.get("/", (req, res) => {
  res.send({ message: "Hello, nodemon!" });
});

// register the application main router
app.use("/api", router);

app.listen(port, () => {
  console.log(`app is listening at http://localhost:${port}`);
});
