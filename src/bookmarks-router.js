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
      logger.error("Failed post : User didn't supply title or URL");
      res.status(400).json({ error: "Title and URL are required" });
    }

    const newBm = {
      id,
      title,
      rating,
      url,
      description,
    };

    data.push(newBm);
    logger.info(`Successful post : Bookmark ${title} was added with id: ${id}`);
    res.status(201).json(newBm);
  });

bmRouter
  .route("/:id")
  .get((req, res) => {
    const { id } = req.params;
    let userBm = data.find((bm) => bm.id === id);

    if (typeof userBm === "undefined") {
      logger.error(`Failed get book with id: ${id}`);
      return res.status(404).send(`Bookmark with ${id} was not found`);
    }

    logger.info(
      `Successful get : Bookmark ${userBm.title} was retrieved with id: ${userBm.id}`
    );
    res.status(201).json(userBm);
  })
  .delete((req, res) => {
    const { id } = req.params;
    let delBm = data.findIndex((bm) => bm.id === id);

    if (delBm === -1) {
      logger.error(`Failed to delete : Bookmark ${delBm.title} `);
      return res.status(404).send(`Bookmark with id ${id} was not found`);
    }

    data.splice(delBm, 1);
    logger.info(
      `Successful delete : Bookmark ${delBm.title} was deleted with id: ${delBm.id}`
    );
    res.status(201).send(`Bookmark with id ${id} was deleted`);
  });

module.exports = bmRouter;
