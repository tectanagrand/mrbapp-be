const RoomController = require("../controllers/RoomControllers");
const express = require("express");
const router = express.Router();

router.get("/", RoomController.getAllRoom);
router.get("/fas", RoomController.getAllRoomWithFac);

module.exports = router;
