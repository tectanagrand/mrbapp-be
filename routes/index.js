const express = require("express");
const router = express.Router();
//import controllers here
const Example = require("../controllers/ExampleController");
const Book = require("./Book");
const User = require("./User");
const Room = require("./Room");
const Notif = require("../controllers/NotificationController");

//@using router
// router.use('/api/<endpoint>', <controller>)
router.use("/api/book", Book);
router.use("/api/user", User);
router.use("/api/room", Room);
router.get("/api/notif", Notif.PushMultiNotif);
router.get("/api/testcron", Example.cronTest);

// router.use("/api", (req, res) => {
//   res.status(200).send({
//     message: "Connected",
//   });
// });

router.get("/api/example", Example.exampleMethod);

module.exports = router;
