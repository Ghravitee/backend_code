import User from "../models/User.js";

export const createUser = async (req, res) => {
  const {
    fullName,
    email,
    username,
    dateOfBirth,
    gender,
    weight,
    height,
    password,
    confirmPassword,
  } = req.body;

  //  validate the fields to make sure they are filled
  if (
    (!fullName,
    !email,
    !username,
    !dateOfBirth,
    !gender,
    !weight,
    !height,
    !password,
    !confirmPassword)
  ) {
    return res.status(400).json({ message: "Invalid credential" });
  }

  //   Validate the passwords to make sure they are identical

  if (password !== confirmPassword) {
    return res.status(400).json({ message: "Passwords do not match" });
  }

  //   Check if it is an existing user
  try {
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Create user
    const user = new User({
      fullName,
      email,
      username,
      dateOfBirth,
      gender,
      weight,
      height,
      password,
      confirmPassword,
    });

    await user.save();

    return res.status(201).json({
      message: "User registered successfully",
      user: {
        ...user.toObject(),
        passowrd: undefined,
        confirmPassword: undefined,
      },
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get all users
export const getUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password -confirmPassword");
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a single user by ID
export const getUsersById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select(
      "-password -confirmPassword"
    );
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json(patient);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update a user

export const updateUser = async (req, res) => {
  try {
    const { password, confirmPassword, ...updateData } = req.body;

    // Validate passwords if provided
    if (password && password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match." });
    }

    // If password is provided, hash it
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    // Only allow the update of specific fields
    const allowedFields = [
      "fullName",
      "username",
      "dateOfBirth",
      "gender",
      "weight",
      "height",
    ];

    // Remove any fields not in the allowed fields list
    Object.keys(req.body).forEach((key) => {
      if (!allowedFields.includes(key)) {
        delete updateData[key];
      }
    });

    // Update user
    const user = await User.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    }).select("-password -confirmPassword");

    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete a user
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: "Patient not found" });
    res.status(200).json({ message: "Patient deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "No user found with that email",
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
    user.resetPasswordExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

    await user.save();

    try {
      await sendResetPasswordEmail(user.email, resetToken);

      res.json({
        status: "success",
        message: "Reset token sent to email",
      });
    } catch (error) {
      user.resetPasswordToken = null;
      user.resetPasswordExpires = null;
      await user.save();

      return res.status(500).json({
        status: "error",
        message: "Error sending email. Please try again later.",
      });
    }
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    // Hash token
    const resetPasswordToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const user = await User.findOne({
      where: {
        resetPasswordToken,
        resetPasswordExpires: { [Op.gt]: Date.now() },
      },
    });

    if (!user) {
      return res.status(400).json({
        status: "error",
        message: "Token is invalid or has expired",
      });
    }

    // Update password
    user.password = password;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    // Generate new token
    const newToken = generateToken(user.id);

    res.json({
      status: "success",
      data: {
        user,
        token: newToken,
      },
    });
  } catch (error) {
    next(error);
  }
};
