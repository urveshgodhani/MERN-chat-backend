const express = require("express");
const auth = require("./controllers/auth/index");
const chat = require("./controllers/chat/index");
const message = require("./controllers/message/index");
const router = express.Router();

router.use("/api/v1/auth", auth);
router.use("/api/v1/chat", chat);
router.use("/api/v1/message", message);

module.exports = router;
