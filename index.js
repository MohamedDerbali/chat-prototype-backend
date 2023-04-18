const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const userRouter = require("./routes/users");
const roomModel = require("./models/room");
require("dotenv").config();
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const http = require("http").Server(app);
const PORT = 4000;
const socketIO = require("socket.io")(http, {
  cors: {
    origin: "http://localhost:3000",
  },
});

//database connection
mongoose
  .connect("mongodb://localhost:27017/liveChat", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.log(err));

app.use(cors());
let users = [];

socketIO.on("connection", (socket) => {
  // console.log(`⚡: ${socket.id} user just connected!`);
  socket.on("checkAndMakeRoom", async (data) => {
    const roomId = await roomModel.findOne({
      $or: [
        { sender: data.sender, reciever: data.reciever },
        { sender: data.reciever, reciever: data.sender },
      ],
    });
    if (!roomId) {
      const newRoom = new roomModel({
        sender: data.sender,
        reciever: data.reciever,
        messages: [],
      });
      await newRoom.save();
    } else {
      socket.emit("room", roomId);
    }
  });
  socket.on("sendMessage", async (data) => {
    if (data.message && data.sender && data.reciever) {
      const roomId = await roomModel.findOne({
        $or: [
          { sender: data.sender._id, reciever: data.reciever._id },
          { sender: data.reciever._id, reciever: data.sender._id },
        ],
      });
      if (roomId) {
        roomId.messages.push({
          sender: data.sender._id,
          reciever: data.reciever._id,
          text: data.message,
        });
        await roomId.save();
        const messageToReturn = {
          sender: data.sender._id,
          reciever: data.reciever._id,
          text: data.message,
        };
        socketIO.emit("messageResponse", messageToReturn);
      }
    }
  });
  
  socket.on("disconnect", () => {
    console.log("🔥: A user disconnected");
    socket.disconnect();
  });
});

app.get("/", (req, res) => {
  res.json({ message: "welcome to the api" });
});
app.use("/users", userRouter);

http.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
