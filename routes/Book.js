const BookReqController = require("../controllers/BookReqControllers");
const BookCheck = require("../middleware/bookcheck");
const express = require("express");
const router = express.Router();

router.post("/book", BookCheck, BookReqController.createBook);
router.get("/book", BookReqController.showAllBook);
router.patch("/book", BookReqController.updateBook);

module.exports = router;
