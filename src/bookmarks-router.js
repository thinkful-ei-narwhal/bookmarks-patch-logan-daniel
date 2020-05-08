const express = require('express');
const { v4: uuid } = require('uuid');
const logger = require('./logger');
const xss = require('xss');
const bmRouter = express.Router();
const dataParser = express.json();
const BmService = require('./bookmark-service');

bmRouter
  .route('/')
  .get((req, res) => {
    BmService.getAllBookmarks(req.app.get('db'))
      .then(bookmarks => res.json(bookmarks.map(b => ({...b, title: xss(b.title), url: xss(b.url), description: xss(b.description)}))))
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
    res.status(201).json({
      ...newBm,
      title: xss(newBm.title),
      url: xss(newBm.url),
      description: xss(newBm.description)
    });
  });

bmRouter
  .route('/:id')
  .get((req, res, next) => {
    const { id } = req.params;
    BmService.getBookmarkById(req.app.get('db'), id)
      .then(bookmark => {
        if (!bookmark) {
          logger.error(`Failed get book with id: ${id}`);
          return res.status(404).json({
            error: { message: 'Bookmark doesn\'t exist' }
          });
        }
        logger.info(
          `Successful get : Bookmark ${bookmark.title} was retrieved with id: ${bookmark.id}`
        );
        res.status(201).json({
          ...bookmark,
          title: xss(bookmark.title),
          url: xss(bookmark.url),
          description: xss(bookmark.description)
        });
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
            res.status(204).end();
          });
      });
  })
  .patch(dataParser, (req, res, next) => {
    const { title, rating, url, description } = req.body;
    const bookmarkToUpdate = { title, rating, url, description };

    const valueNum = Object.values(bookmarkToUpdate).filter(Boolean).length;

    if (valueNum === 0) {
      return res.status(400).json({
        error: {message: `Request body must contain either 'title', 'rating', 'url', or 'description'`}
      });
    };

    BmService.updateBookmark(req.app.get('db'), req.params.id, bookmarkToUpdate)
      .then(data => {
        res.status(204).end()
      })
      .catch(next)
  });

module.exports = bmRouter;
