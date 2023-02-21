const chat = require("../../models/chatModel");
const user = require("../../models/userModel");
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

exports.createGroupChat = async (req, res, next) => {
  try {
    let { name, users } = req.body;
    users = JSON.parse(users);
    if (users.length < 2) {
      return res
        .status(400)
        .send("More than 2 users are required to form a group chat");
    }
    users.push(req.user._id);
    const createGroupChat = await chat.create({
      chatName: name,
      isGroupChat: true,
      users,
      groupAdmin: req.user,
    });

    const populateUserForCreateGroupChat = await chat
      .find(createGroupChat)
      .populate("users")
      .populate("groupAdmin");

    res.status(200).json(populateUserForCreateGroupChat);
  } catch (error) {
    next(error);
  }
};

exports.renameGroup = async (req, res, next) => {
  try {
    const { chatId, chatName } = req.body;
    const findChatId = await chat
      .findOne({ _id: chatId })
      .populate("users")
      .populate("groupAdmin");

    if (!findChatId) {
      res.status(404);
      throw new Error("Chat Not Found");
    }
    findChatId.chatName = chatName;
    await findChatId.save();
    res.status(200).json(findChatId);
  } catch (error) {
    next(error);
  }
};

exports.addToGroup = async (req, res, next) => {
  try {
    const { chatId, userId } = req.body;

    const added = await chat
      .findByIdAndUpdate(
        chatId,
        {
          $push: { users: userId },
        },
        {
          new: true,
        }
      )
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    if (!added) {
      res.status(404);
      throw new Error("Chat Not Found");
    } else {
      res.json(added);
    }
  } catch (error) {}
};

exports.removeFromGroup = async (req, res, next) => {
  const { chatId, userId } = req.body;

  const removed = await chat
    .findByIdAndUpdate(
      chatId,
      {
        $pull: { users: userId },
      },
      {
        new: true,
      }
    )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  if (!removed) {
    res.status(404);
    throw new Error("Chat Not Found");
  } else {
    res.json(removed);
  }
};

//write prime number
