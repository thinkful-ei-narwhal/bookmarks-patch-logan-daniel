/* eslint-disable quotes */
module.exports = {
  getAllBookmarks(db) {
    //get all
    return db('bookmarks').select();
  },
  insertBookmark(db, newItem) {
    //add item
    return db.insert(newItem).into('bookmarks').returning('*').then(rows => rows[0]);
  },
  updateBookmark(db, id, newItem) {
    return db('bookmarks').where({ id }).update(newItem).returning('*').then(rows => rows[0]);
  },
  deleteBookmark(db, id) {
    return db('bookmarks').where({ id }).del();
  },
  getBookmarkById(db, id) {
    return db('bookmarks').select('*').where({ id }).first();
  }
};