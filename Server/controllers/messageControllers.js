const HttpError = require("../models/errorModel");
const ConversationModel = require("../models/ConversationModel");
const MessageModel = require("../models/MessageModel");
const { getReceiverSocketId , io} = require("../socket/socket");

//CREATE MESSAGE------------
//POST : api/message/receiverId
//PROTECTED
const createMessage = async (req, res, next) => {
  try {
    const { receiverId } = req.params;
    const { messageBody } = req.body;
    //Check if there is a ready conversation bw current user and receiver
    let conversation = await ConversationModel.findOne({
      participants: { $all: [req.user.id, receiverId] },
    });
    //Create a new conversation if none was found
    if (!conversation) {
      conversation = await ConversationModel.create({
        participants: [req.user.id, receiverId],
        lastMessage: { text: messageBody, senderId: req.user.id },
      });
    }
    //Create a new message
    const newMessage = await MessageModel.create({
      conversationId: conversation._id,
      senderId: req.user.id,
      text: messageBody,
    });
    await conversation.updateOne({
      lastMessage: { text: messageBody, senderId: req.user.id }
    });

    const receiverSocketId = getReceiverSocketId(receiverId)
    if(receiverSocketId){
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }
    res.json(newMessage);
  } catch (error) {
    return next(new HttpError(error));
  }
};

//GET MESSAGE------------
//GET : api/message/receiverId
//PROTECTED
const getMessages = async (req, res, next) => {
  try {
    const { receiverId } = req.params;
    const conversation = await ConversationModel.findOne({
      participants: { $all: [req.user.id, receiverId] },
    });
    if (!conversation) {
      return next(
        new HttpError("You have no conversation with this person", 404)
      );
    }
    const messages = await MessageModel.find({
      conversationId: conversation._id,
    }).sort({ createdAt: 1 });
    res.json(messages);
  } catch (error) {
    return next(new HttpError(error));
  }
};

//GET CONVERSATIONS------------
//GET : api/conversations
//PROTECTED
const getConversations = async (req, res, next) => {
  try {
    let conversations = await ConversationModel.find({
      participants: req.user.id
    })
      .populate({ path: "participants", select: "fullName profilePhoto" })
      .sort({ createdAt: -1 });
    //remove logged in user from the participants array
    conversations.forEach((conversation) => {
      conversation.participants = conversation.participants.filter(
        (participant) => participant._id.toString() !== req.user.id.toString()
      );
    });
    res.json(conversations);
  } catch (error) {
    return next(new HttpError(error));
  }
};

module.exports = { createMessage, getMessages, getConversations };
