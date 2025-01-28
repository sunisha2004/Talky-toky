import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  senderID: { type: String, required: true },
  receiverID: { type: String, required: true },
  message: { type: String, required: true },
  time: { type: Date, default: Date.now },
});

const Message = mongoose.model("Message", messageSchema);
export default Message;
