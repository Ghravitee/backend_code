import jwt from "jsonwebtoken";
import User from "../models/User";

const auth = () => {
  return async (req, res, next) => {
    const token = req.cookies.token;

    if (!token) {
      return res
        .status(401)
        .json({ error: "Access denied. No token provided" });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const { id } = decoded;

      // Find user by ID
      const user = await User.findById(id);

      if (!user) {
        return res
          .status(401)
          .json({ message: "Unauthorized, user not found" });
      }

      req.user = {
        id: user._id,
        fullname: user.fullName,
        email: user.email,
        username: user.username,
        gender: user.gender,
        dateOfBirth: user.dateOfBirth,
        weight: user.weight,
        height: user.height,
      };

      next();
    } catch (error) {
      res.status(400).json({ error: "Invalid token" });
    }
  };
};

export default auth;
