const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const roomSchema = new Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    reciever: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    messages: [
      {
        text: {
          type: String,
        },
        sender: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        reciever: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        date: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);
const Room = mongoose.model("Room", roomSchema);
module.exports = Room;
