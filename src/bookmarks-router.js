const express = require("express");
const data = require("./store");
const { v4: uuid } = require("uuid");
const logger = require("./logger");

const bmRouter = express.Router();
const dataParser = express.json();

bmRouter
  .route("/")
  .get((req, res) => {
    res.status(200).json(data);
  })
  .post(dataParser, (req, res) => {
    const { title, rating, url, description } = req.body;
    const id = uuid();

    if (!title || !url) {
      //logger.error(`New POST rejected: No Title or Url. Error sent to user`);
      res.status(400).json({ error: "Title and URL are required" });
    }

    const newBm = {
      id,
      title,
      rating,
      url,
      description,
    };

    //logger.info(`New Bookmark created by user: ${title}, ${id}`);
    data.push(newBm);
    res.status(201).send(`Bookmark ${title} was added with id: ${id}`);
  });

bmRouter
  .route("/:id")
  .get((req, res) => {
    const { id } = req.params;
    let userBm = data.find((bm) => bm.id === id);

    if (!userBm) {
      return res.status(404).send(`Bookmark with ${id} was not found`);
    }

    res.status(201).json(userBm);
  })
  .delete((req, res) => {
    const { id } = req.params;
    let delBm = data.findIndex((bm) => bm.id == id);

    if (delBm === -1) {
      return res.status(404).send(`Bookmark with id ${id} was not found`);
    }

    data.splice(delBm, 1);
    res.status(201).send(`Bookmark with id ${id} was deleted`);
  });

module.exports = bmRouter;
