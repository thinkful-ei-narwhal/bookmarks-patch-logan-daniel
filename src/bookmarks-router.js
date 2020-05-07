const express = require('express');
const data = require('./store');
const { v4: uuid } = require('uuid');
const logger = require('./logger');

const bmRouter = express.Router();
const dataParser = express.json();
const BmService = require('./bookmark-service');

bmRouter
  .route('/')
  .get((req, res) => {
    BmService.getAllBookmarks(req.app.get('db'))
      .then(bookmarks => res.json(bookmarks));
  })
  .post(dataParser, (req, res) => {
    const { title, rating, url, description } = req.body;
    const id = uuid();

    if (!title || !url) {
      logger.error('Failed post : User didn\'t supply title or URL');
      res.status(400).json({ error: 'Title and URL are required' });
    }

    const newBm = {
      id,
      title,
      rating,
      url,
      description,
    };

    BmService.insertBookmark(req.app.get('db'), newBm);
    logger.info(`Successful post : Bookmark ${title} was added with id: ${id}`);
    res.status(201).json(newBm);
  });

bmRouter
  .route('/:id')
  .get((req, res, next) => {
    const { id } = req.params;
    BmService.getBookmarkById(req.app.get('db'), id)
      .then(bookmarks => {
        if (!bookmarks) {
          logger.error(`Failed get book with id: ${id}`);
          return res.status(404).json({
            error: { message: 'Bookmark doesn\'t exist' }
          });
        }
        logger.info(
          `Successful get : Bookmark ${bookmarks.title} was retrieved with id: ${bookmarks.id}`
        );
        res.status(201).json(bookmarks);
      })
      .catch(next);
  })
  .delete((req, res) => {
    const { id } = req.params;
    BmService.getBookmarkById(req.app.get('db'), id)
      .then(bookmark => {
        if (!bookmark) {
          logger.error(`Failed get delete with id: ${id}`);
          return res.status(404).json({
            error: { message: 'Bookmark doesn\'t exist' }
          });
        }
        BmService.deleteBookmark(req.app.get('db'), bookmark.id)
          .then(() => {
            logger.info(
              'Successful delete : Bookmark was deleted'
            );
            res.status(201).send(`Bookmark with id ${id} was deleted`);
          });
      });
  });

module.exports = bmRouter;
