const Message = require("../models/messageModel");
const chat = require("../models/chatModel");
const user = require("../models/userModel");

exports.sendMessage = async (req, res, next) => {
  const { content, chatId } = req.body;
  if (!content || !chatId) {
    console.log("Invalid data passed into request");
    return res.sendStatus(400);
  }

  var newMessage = {
    sender: req.user._id,
    content: content,
    chat: chatId,
  };

  try {
    var message = await Message.create(newMessage);
    message = await message.populate({
      path: "chat",
      populate: {
        path: "users",
        select: "name pic email",
      },
    });

    await chat.findByIdAndUpdate(req.body.chatId, { latestMessage: message });
    res.status(200).json(message);
  } catch (error) {
    next(error);
  }
};

exports.allMessages = async (req, res, next) => {
  try {
    const chatId = req.params.chatId;
    const message = await Message.find({ chat: chatId })
      .populate("sender", "name pic email")
      .populate("chat");
    res.status(200).json(message);
  } catch (error) {
    next(error);
  }
};
