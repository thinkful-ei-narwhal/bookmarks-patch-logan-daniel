require("dotenv");

const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const helmet = require("helmet");
const { data } = require("./store");
const bmRouter = require("./bookmarks-router");

const { NODE_ENV, PORT, API_TOKEN } = require("./config");

const app = express();

const morganOption = NODE_ENV === "production" ? "tiny" : "common";

app.use(cors());
app.use(helmet());
app.use(morgan(morganOption));

app.use("/bookmarks", bmRouter);

app.use(function errorMiddleWare(err, req, res, next) {
  let response;
  if (NODE_ENV === "production") {
    response = { error: { message: "Server error" } };
  } else {
    console.log(err);
    response = { error: err, message: err.message };
  }
  res.status(500).json({ error: err.message });
  next();
});

module.exports = app;
