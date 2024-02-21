const RoomController = require("../controllers/RoomControllers");
const express = require("express");
const router = express.Router();

router.get("/", RoomController.getAllRoom);

module.exports = router;
