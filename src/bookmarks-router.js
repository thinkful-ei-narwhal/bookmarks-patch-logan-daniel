const express = require("express");
const { v4: uuid } = require("uuid");
const logger = require("./logger");
const xss = require("xss");

const bmRouter = express.Router();
const dataParser = express.json();
const BmService = require("./bookmark-service");

const serializeBookmark = bookmark => ({
  id: bookmark.id,
  title: xss(bookmark.title),
  url: bookmark.url,
  description: xss(bookmark.description),
  rating: Number(bookmark.rating),
})

bmRouter
  .route("/")
  .get((req, res) => {
    BmService.getAllBookmarks(req.app.get("db"))
      .then(bookmarks => res.json(bookmarks.map(serializeBookmark));
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

    BmService.insertBookmark(req.app.get("db"), newBm);
    logger.info(`Successful post : Bookmark ${title} was added with id: ${id}`);
    res.status(201).json(serializeBookmark(bookmark));
  });

bmRouter
  .route("/:id")
  .get((req, res, next) => {
    const { id } = req.params;
    BmService.getBookmarkById(req.app.get("db"), id)
      .then(bookmark => {
        if (!bookmark) {
          logger.error(`Failed get book with id: ${id}`);
          return res.status(404).json({
            error: { message: "Bookmark doesn't exist" }
          });
        }
        logger.info(
          `Successful get : Bookmark ${bookmark.title} was retrieved with id: ${bookmark.id}`
        );
        res.status(201).json(serializeBookmark(bookmark));
      })
      .catch(next);
  })
  .delete((req, res) => {
    const { id } = req.params;
    BmService.getBookmarkById(req.app.get("db"), id)
      .then(bookmark => {
        if (!bookmark) {
          logger.error(`Failed get delete with id: ${id}`);
          return res.status(404).json({
            error: { message: "Bookmark doesn't exist" }
          });
        }
        BmService.deleteBookmark(req.app.get("db"), bookmark.id)
          .then(() => {
            logger.info(
              "Successful delete : Bookmark was deleted"
            );
            res.status(201).send(`Bookmark with id ${id} was deleted`);
          });
      });
  })
  .patch(bodyParser, (req, res, next) => {
    const { title, url, description, rating } = req.body
    const bookmarkToUpdate = { title, url, description, rating }

    const numberOfValues = Object.values(bookmarkToUpdate).filter(Boolean).length
    if (numberOfValues === 0) {
      logger.error(`Invalid update without required fields`)
      return res.status(400).json({
        error: {
          message: `Request body must content either 'title', 'url', 'description' or 'rating'`
        }
      })
    };
    const error = getBookmarkValidationError(bookmarkToUpdate)

    if (error) return res.status(400).send(error)

    BookmarksService.updateBookmark(
      req.app.get('db'),
      req.params.bookmark_id,
      bookmarkToUpdate
    )
      .then(numRowsAffected => {
        res.status(204).end()
      })
      .catch(next)
  });


module.exports = bmRouter;
