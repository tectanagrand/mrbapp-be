const BookReqController = require("../controllers/BookReqControllers");
const BookCheck = require("../middleware/bookcheck");
const express = require("express");
const router = express.Router();

router.post("/", BookCheck, BookReqController.createBook);
router.get("/", BookReqController.showAllBook);
router.patch("/", BookReqController.updateBook);

module.exports = router;
