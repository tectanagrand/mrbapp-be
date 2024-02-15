const express = require("express");
const router = express.Router();
//import controllers here
const Example = require("../controllers/ExampleController");
const Book = require("./Book");
const User = require("./User");

//@using router
// router.use('/api/<endpoint>', <controller>)
router.use("/api/room", Book);
router.use("/api/user", User);

router.use("/api", (req, res) => {
  res.status(200).send({
    message: "Connected",
  });
});

router.get("/api/example", Example.exampleMethod);

module.exports = router;
