const BookReqController = require("../controllers/BookReqControllers");
const BookCheck = require("../middleware/bookcheck");
const express = require("express");
const router = express.Router();

router.post("/", BookCheck, BookReqController.createBook);
router.get("/", BookReqController.showAllBook);
router.get("/show", BookReqController.showBookbyUser);
router.patch("/", BookReqController.updateBook);
router.get("/byroom", BookReqController.showBookbyRoom);
// http://localhost:5000/api/book/byroom?roomid=ROOM003

module.exports = router;
