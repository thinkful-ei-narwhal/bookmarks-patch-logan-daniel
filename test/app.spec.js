/* eslint-disable quotes */
const app = require("../src/app");
let store = require("../src/store");

describe("Bookmark endpoints", () => {
  let bookmarksCopy;
  const authTokenTest = "Bearer my-secret";
  beforeEach("copy the bookmarks", () => {
    bookmarksCopy = store;
  });

  afterEach("restore the bookmarks", () => {
    store = bookmarksCopy;
  });

  // it('should return 200 "Hello world!"', () => {
  //   return supertest(app)
  //     .get("/")

  //     .expect(200, { message: "Hello world!" });
  // });

  //positive tests
  //200 on the three endpoints
  describe("GET all bookmarks", () => {
    describe("GET all bookmarks happy path", () => {
      it("gets the bookmarks from the store", () => {
        return supertest(app)
          .get("/bookmarks")
          .set("Authorization", authTokenTest)
          .expect(200, store);
      });

      it("should get a particular book by ID from store", () => {
        return supertest(app)
          .get("/bookmarks/0123")
          .set("Authorization", authTokenTest)
          .expect(201, store[0]);
      });

      it("posts a bookmark to the store", () => {
        const postValues = {
          title: "test-title",
          url: "http://some.thing.com",
          rating: "1",
        };
        console.log(postValues);
        return supertest(app)
          .post("/bookmarks")
          .send(postValues)
          .set("Authorization", authTokenTest)
          .expect(201)
          .expect((res) => {
            expect(res.body.title).to.equal(postValues.title);
            expect(res.body.url).to.equal(postValues.url);
          });
      });
    });

    describe("GET all bookmarks unhappy path", () => {
      it("should delete the bookmark specified by id", () => {
        return supertest(app)
          .delete("/bookmarks/0123")
          .set("Authorization", authTokenTest)
          .expect(201)
          .expect(store.filter((x) => x.id == "0123"))
          .to.equal("undefined");
      });
    });
  });

  //  .delete((req, res) => {
  //   const { id } = req.params;
  //   let delBm = data.findIndex((bm) => bm.id === id);

  //   if (delBm === -1) {
  //     logger.error(`Failed to delete : Bookmark ${delBm.title} `);
  //     return res.status(404).send(`Bookmark with id ${id} was not found`);
  //   }

  //   data.splice(delBm, 1);
  //   logger.info(
  //     `Successful delete : Bookmark ${delBm.title} was deleted with id: ${delBm.id}`
  //   );
  //   res.status(201).send(`Bookmark with id ${id} was deleted`);
  // });

  // describe();

  //negative tests
  //400 on all the expected endpoints

  //proper token passes
  //junk token fails

  //missing bearer fails
  //having bearer passes
});
