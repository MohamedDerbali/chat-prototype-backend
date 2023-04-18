const jwt = require("jsonwebtoken");
const userModel = require("../models/user");
exports.AUTH_ROLES = {
  NO_TOKEN: "no token",
  USER: "user",
};
exports.authorize =
  (...roles) =>
  async (req, res, next) => {
    let token = req.headers["x-access-token"] || req.headers.authorization;
    if (token && token.startsWith("Bearer ")) {
      token = token.slice(7, token.length);
    }
    if (!token) {
      if (roles.length === 0 || roles.includes("no token")) {
        return next();
      }
      res.status(401).json({ message: "you are not authorized to do this!" });
    }
    try {
      const data = jwt.verify(token, process.env.TOKEN_SECRET);
      if ("role" in data) {
        if (data.role == "user") {
          const user = await userModel
            .findOne({ _id: data.sub }, { password: 0 })
            .lean();
          req.user = user;
          req.role = "user";
        } else throw new Error("No user found!");
      } else {
        const user = await userModel
          .findById(data.id || data._id, { password: 0 })
          .lean();
        if (user) {
          req.user = user;
          req.role = "user";
        } else throw new Error("No user found!");
      }
      next();
    } catch (error) {
      res.status(401).json({ message: error.message });
    }
  };
