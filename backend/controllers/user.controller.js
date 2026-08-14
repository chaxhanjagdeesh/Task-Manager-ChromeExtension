import bcrypt from "bcrypt";
import User from "../models/User.js";
import Client from "../models/Client.js";
import Entry from "../models/Entry.js";

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select(
      "-password"
    );

    res.json(user);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};
export const updateProfile = async (req, res) => {
  try {
    let { name, email } = req.body;

    if (!name || !email) {
      return res.status(400).json({
        message: "Name and email are required",
      });
    }

    name = name.trim();
    email = email.trim().toLowerCase();

    if (name.length < 2) {
      return res.status(400).json({
        message: "Name must be at least 2 characters long",
      });
    }

    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return res.status(400).json({
        message: "Invalid email address",
      });
    }

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const existingUser = await User.findOne({
      email,
      _id: { $ne: req.user.id },
    });

    if (existingUser) {
      return res.status(409).json({
        message: "Email already exists",
      });
    }

    if (
      user.name === name &&
      user.email === email
    ) {
      return res.status(200).json({
        message: "No changes made",
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
        },
      });
    }

    user.name = name;
    user.email = email;

    await user.save();

    return res.status(200).json({
      message: "Profile updated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

export const changePassword = async (req, res) => {
  try {
    const {
      currentPassword,
      newPassword,
    } = req.body;

    const user = await User.findById(req.user.id);

    const isMatch = await bcrypt.compare(
      currentPassword,
      user.password
    );

    if (!isMatch) {
      return res.status(400).json({
        message: "Current password is incorrect",
      });
    }

    if (newPassword.length < 6) {
  return res.status(400).json({
    message:
      "Password must be at least 6 characters.",
  });
}

    user.password = await bcrypt.hash(
      newPassword,
      10
    );

    await user.save();

    res.json({
      message: "Password updated",
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

export const deleteAccount = async (req, res) => {
  try {
    await Client.deleteMany({
      owner: req.user.id,
    });

    await Entry.deleteMany({
      owner: req.user.id,
    });

    await User.findByIdAndDelete(req.user.id);

    res.json({
      message: "Account deleted",
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};