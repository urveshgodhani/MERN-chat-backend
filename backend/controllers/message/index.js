const express = require("express");
const { protect } = require("../../middleware/auth");
const { sendMessage, allMessages } = require("./controllers");
const router = express.Router();

router.route("/").post(protect, sendMessage);
router.route("/:chatId").get(protect, allMessages);

module.exports = router;
