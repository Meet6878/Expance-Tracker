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
} = require("../contollers/authController");

const authRoute = express.Router();

authRoute.post("/register", RegisterController);
authRoute.post("/login", LoginController);
authRoute.get("/logout", LogoutController);

module.exports = authRoute;
