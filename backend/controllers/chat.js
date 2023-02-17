const chat = require("../models/chatModel");
const user = require("../models/userModel");
var mongoose = require("mongoose");

exports.accessChat = async (req, res, next) => {
  try {
    let { userId } = req.body;

    if (!userId) {
      console.log("UserId param not sent with request");
      return res.sendStatus(400);
    }

    userId = mongoose.Types.ObjectId(userId);
    const loginUserId = req.user._id;

    let isChat = await chat
      .findOne({
        chatName: "sender",
        isGroupChat: false,
        users: { $all: [userId, loginUserId] },
      })
      .populate("users");

    if (!isChat) {
      isChat = await chat.create({
        chatName: "sender",
        isGroupChat: false,
        users: [userId, loginUserId],
      });
      const FullChat = await chat
        .findOne({ _id: isChat._id })
        .populate("users");
      res.status(200).json(FullChat);
    }

    return res.status(200).json(isChat);
  } catch (error) {
    next(error);
  }
};

exports.fetchChats = async (req, res, next) => {
  try {
    chat
      .find({ users: { $elemMatch: { $eq: req.user._id } } })
      .populate("users", "-password")
      .populate("groupAdmin", "-password")
      .populate("latestMessage")
      .sort({ updatedAt: -1 })
      .then(async (results) => {
        console.log(results);
        results = await user.populate(results, {
          path: "latestMessage.sender",
          select: "name pic email",
        });
        res.status(200).send(results);
      });
  } catch (error) {
    next(error);
  }
};

