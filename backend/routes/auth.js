const express = require("express");
const { register, login, allUsers } = require("../controllers/auth");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/", protect, allUsers);


module.exports = router;
