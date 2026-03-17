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
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} = require("../contollers/categoryController.js");
const { protect } = require("../middleware/auth.js");

const categoryRoute = express.Router();

categoryRoute.get("/", getAllCategories);
categoryRoute.get("/:id", getCategoryById);
categoryRoute.post("/Create",protect, createCategory);
categoryRoute.put("/update/:id", protect, updateCategory);
categoryRoute.delete("/Category/:id", protect, deleteCategory);

module.exports = categoryRoute;
