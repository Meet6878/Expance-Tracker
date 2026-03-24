// import jwt from 'jsonwebtoken';
// import User from '../models/User.js';
// import { verifyFirebaseToken } from '../config/firebase.js';

const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { asyncHandler } = require("../middleware/errorHandler");
// // Register or Login with Firebase
// // export const authenticateWithFirebase = async (req, res) => {
// //   try {
// //     const { token } = req.body;

// //     if (!token) {
// //       return res.status(400).json({ message: 'Token is required' });
// //     }

// //     // Verify Firebase token
// //     const decodedToken = await verifyFirebaseToken(token);
// //     const { uid, email } = decodedToken;

// //     // Find or create user in MongoDB
// //     let user = await User.findOne({ firebaseUid: uid });

// //     if (!user) {
// //       user = await User.create({
// //         firebaseUid: uid,
// //         email,
// //         displayName: decodedToken.name || '',
// //         profileImage: decodedToken.picture || '',
// //         currency: 'USD',
// //       });
// //     } else if (!user.isActive) {
// //       return res.status(403).json({ message: 'User account is inactive' });
// //     }

// //     // Generate custom JWT token
// //     const jwtToken = jwt.sign(
// //       {
// //         uid: user._id,
// //         firebaseUid: user.firebaseUid,
// //         email: user.email,
// //       },
// //       process.env.JWT_SECRET,
// //       { expiresIn: process.env.JWT_EXPIRY || '7d' }
// //     );

// //     res.status(200).json({
// //       success: true,
// //       message: 'Authentication successful',
// //       jwtToken,
// //       user: {
// //         id: user._id,
// //         email: user.email,
// //         displayName: user.displayName,
// //         currency: user.currency,
// //       },
// //     });
// //   } catch (error) {
// //     console.error('Authentication error:', error);
// //     res.status(401).json({
// //       message: 'Authentication failed',
// //       error: error.message,
// //     });
// //   }
// // };

// // Refresh JWT token
// export const refreshToken = async (req, res) => {
//   try {
//     const { token } = req.body;

//     if (!token) {
//       return res.status(400).json({ message: 'Token is required' });
//     }

//     // Verify Firebase token
//     const decodedToken = await verifyFirebaseToken(token);
//     const { uid } = decodedToken;

//     // Find user in MongoDB
//     const user = await User.findOne({ firebaseUid: uid });

//     if (!user) {
//       return res.status(404).json({ message: 'User not found' });
//     }

//     if (!user.isActive) {
//       return res.status(403).json({ message: 'User account is inactive' });
//     }

//     // Generate new JWT token
//     const newJwtToken = jwt.sign(
//       {
//         uid: user._id,
//         firebaseUid: user.firebaseUid,
//         email: user.email,
//       },
//       process.env.JWT_SECRET,
//       { expiresIn: process.env.JWT_EXPIRY || '7d' }
//     );

//     res.status(200).json({
//       success: true,
//       jwtToken: newJwtToken,
//     });
//   } catch (error) {
//     console.error('Token refresh error:', error);
//     res.status(401).json({
//       message: 'Token refresh failed',
//       error: error.message,
//     });
//   }
// };

// // Get current user profile
// export const getCurrentUser = async (req, res) => {
//   try {
//     const user = await User.findById(req.user.uid).select('-createdAt -updatedAt');

//     if (!user) {
//       return res.status(404).json({ message: 'User not found' });
//     }

//     res.status(200).json({
//       success: true,
//       user,
//     });
//   } catch (error) {
//     console.error('Get user error:', error);
//     res.status(500).json({
//       message: 'Failed to fetch user',
//       error: error.message,
//     });
//   }
// };

// // Update user profile
// export const updateUserProfile = async (req, res) => {
//   try {
//     const { displayName, currency, profileImage } = req.body;

//     const updateData = {};
//     if (displayName) updateData.displayName = displayName;
//     if (currency) updateData.currency = currency;
//     if (profileImage) updateData.profileImage = profileImage;

//     const user = await User.findByIdAndUpdate(req.user.uid, updateData, {
//       new: true,
//       runValidators: true,
//     }).select('-createdAt -updatedAt');

//     res.status(200).json({
//       success: true,
//       message: 'Profile updated successfully',
//       user,
//     });
//   } catch (error) {
//     console.error('Update profile error:', error);
//     res.status(500).json({
//       message: 'Failed to update profile',
//       error: error.message,
//     });
//   }
// };

// // Update user settings
// export const updateUserSettings = async (req, res) => {
//   try {
//     const { emailNotifications, monthlyReminder } = req.body;

//     const updateData = { settings: {} };
//     if (emailNotifications !== undefined) {
//       updateData.settings.emailNotifications = emailNotifications;
//     }
//     if (monthlyReminder !== undefined) {
//       updateData.settings.monthlyReminder = monthlyReminder;
//     }

//     const user = await User.findByIdAndUpdate(req.user.uid, updateData, {
//       new: true,
//       runValidators: true,
//     }).select('-createdAt -updatedAt');

//     res.status(200).json({
//       success: true,
//       message: 'Settings updated successfully',
//       user,
//     });
//   } catch (error) {
//     console.error('Update settings error:', error);
//     res.status(500).json({
//       message: 'Failed to update settings',
//       error: error.message,
//     });
//   }
// };

// // Logout
// export const logout = async (req, res) => {
//   try {
//     // Just return success - tokens are stateless
//     res.status(200).json({
//       success: true,
//       message: 'Logged out successfully',
//     });
//   } catch (error) {
//     res.status(500).json({
//       message: 'Logout failed',
//       error: error.message,
//     });
//   }
// };

const RegisterController = asyncHandler(async (req, res) => {
  try {
    const { email, password, role } = req.body;
    const user = await User.findOne({ email });
    if (user) {
      const err = new Error("User already exists");
      err.status = 400;
      throw err;
    }
    const hashPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      name: email.split("@")[0],
      email,
      password: hashPassword,
      role: role.toLowerCase(),
    });

    return res.status(201).send({
      success: true,
      message: "User registered successfully",
      user: newUser,
    });
  } catch (error) {
    throw error;
  }
});

const LoginController = asyncHandler(async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      const err = new Error("User not found");
      err.status = 404;
      throw err;
    }

    const comparePassword = await bcrypt.compare(password, user.password);

    if (!comparePassword) {
      const err = new Error("Invalid password");
      err.status = 401;
      throw err;
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      {
        expiresIn: "30d",
      },
    );
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "development" ? false : true, // true in production (HTTPS)
      sameSite: "strict",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).send({
      success: true,
      message: "Login successful",
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    throw error;
  }
});

const LogoutController = asyncHandler(async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: false, // true in production
    });

    return res.status(200).send({
      success: true,
      message: "Logout successful",
    });
  } catch (error) {
    throw error;
  }
});

module.exports = { RegisterController, LoginController, LogoutController };
