// import express from 'express';
// import {
// //   authenticateWithFirebase,
//   refreshToken,
//   getCurrentUser,
//   updateUserProfile,
//   updateUserSettings,
//   logout,
// } from '../controllers/authController.js';
// import { jwtAuthMiddleware } from '../middleware/auth.js';
// import { asyncHandler } from '../middleware/errorHandler.js';

// const router = express.Router();

// // Public routes
// router.post('/authenticate', asyncHandler(authenticateWithFirebase));
// router.post('/refresh', asyncHandler(refreshToken));

// // Protected routes
// router.get('/me', jwtAuthMiddleware, asyncHandler(getCurrentUser));
// router.put('/profile', jwtAuthMiddleware, asyncHandler(updateUserProfile));
// router.put('/settings', jwtAuthMiddleware, asyncHandler(updateUserSettings));
// router.post('/logout', jwtAuthMiddleware, asyncHandler(logout));

// export default router;

const express = require("express");
const {
  RegisterController,
  LoginController,
  LogoutController,
  MeController,
} = require("../contollers/authController");
const { protect } = require("../middleware/auth");

const authRoute = express.Router();

authRoute.post("/register", RegisterController);
authRoute.post("/login", LoginController);
authRoute.post("/logout", LogoutController);
authRoute.get("/me", protect, MeController);

module.exports = authRoute;
