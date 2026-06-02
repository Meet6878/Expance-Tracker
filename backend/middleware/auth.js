// import jwt from "jsonwebtoken";
// import { verifyFirebaseToken } from "../config/firebase.js";

// // Verify custom JWT token
// export const jwtAuthMiddleware = (req, res, next) => {
//   try {
//     const token = req.headers.authorization?.split("Bearer ")[1];

//     if (!token) {
//       return res.status(401).json({ message: "No token provided" });
//     }

//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     req.user = decoded;
//     next();
//   } catch (error) {
//     res.status(401).json({ message: "Invalid token", error: error.message });
//   }
// };

// // Optional: Refresh JWT token
// export const refreshTokenMiddleware = (req, res, next) => {
//   try {
//     const token = req.headers.authorization?.split("Bearer ")[1];

//     if (!token) {
//       return res.status(401).json({ message: "No token provided" });
//     }

//     const decoded = jwt.verify(token, process.env.JWT_SECRET, {
//       ignoreExpiration: true,
//     });
//     const newToken = jwt.sign(
//       { uid: decoded.uid, email: decoded.email },
//       process.env.JWT_SECRET,
//       { expiresIn: process.env.JWT_EXPIRY || "7d" },
//     );

//     res.setHeader("X-New-Token", newToken);
//     req.user = decoded;
//     next();
//   } catch (error) {
//     res
//       .status(401)
//       .json({ message: "Token refresh failed", error: error.message });
//   }
// };

const jwt = require("jsonwebtoken");

const protect = async (req, res, next) => {
  try {
    const token =
      req.cookies.token || req.headers.authorization?.split("Bearer ")[1];
    // const token = req.headers.authorization?.split("Bearer ")[1];
    if (!token) {
      return res.status(401).send({ message: "not authorize" });
    }
    const decode = jwt.verify(token, process.env.JWT_SECRET);
    if (!decode) {
      return res.status(401).send({ message: "invalid token" });
    }
    // console.log("decode", decode);
    req.user = decode;
    next();
  } catch (error) {
    console.log("error", error);
    res.status(401).json({ message: "Invalid token" });
  }
};

const getRole = async (req, res, next) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: "User not authenticated" });
    }
    const role = user.role || "user"; 
    if (role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admin privileges required." });
    }
    next();
  } catch (error) {
    console.log("error", error);
    res.status(500).json({ message: "Failed to get user role", error: error.message });
  }
}

module.exports = { protect, getRole };
