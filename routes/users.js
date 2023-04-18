const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const {authorize} = require("../middleware/auth");
const userModel = require("../models/user");
const roomId = require("../models/room");
const { AUTH_ROLES } = require("../middleware/auth");
const {USER} = AUTH_ROLES; 
const router = express.Router();
// @route   GET users/profile
// @desc    Get logged in user
router.get("/profile", authorize(USER), async (req, res) => {
  const user = await userModel.findById(req.user._id).select("-password");
  res.json(user);
});
// @route   POST users/auth
// @desc    Auth user & get token
router.post("/auth", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await userModel.findOne({ $or: [{ email: username }, { username }] });
    if (!user) {
      return res.status(400).json({ msg: "Invalid Credentials" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: "Invalid Credentials" });
    }
    const payload = {
      sub: user.id,
      role: "user",
    };
    jwt.sign(
      payload,
      process.env.TOKEN_SECRET,
      {
        expiresIn: 3600,
      },
      (err, token) => {
        if (err) throw err;
        res.json({ user, token });
      }
    );
  } catch (err) {
    res.status(500).json({ msg: "Server Error" });
  }
});
// @route   GET users/
// @desc    Auth user & get token
router.get("/", authorize(USER), async (req, res) => {
  if(!req.user) return res.status(401).json({msg: "Unauthorized"});
  const users = await userModel.find({ _id: { $ne: req.user._id } });
  res.json(users);
});
// @route   POST users/register
// @desc    Register a user
router.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 12);
    await userModel.create({
      username,
      email,
      password: hashedPassword,
    });
    res.json({ msg: "User created" });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

module.exports = router;