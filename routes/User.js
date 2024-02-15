const express = require("express");
const router = express.Router();
const controller = require("../controllers/UserController");

router.post("/register", controller.registerUser);
router.post("/verifynew", controller.newUserVerify);
router.post("/login", controller.loginUser);
router.post("/reqres", controller.reqResetPassword);
router.post("/verifresotp", controller.verifResetPass);
router.post("/resetpass", controller.resetPassword);
router.post("/refreshtoken", controller.refreshToken);

module.exports = router;
